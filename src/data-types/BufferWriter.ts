import { Chat } from './Chat';
import { nbt, serializeNbt } from './nbt/NBTSerialize';
import { NBTCompound } from './nbt';
import { NBTType } from './nbt/NBTType';
import { BitSet } from './BitSet';

export class BufferWriter {
  protected buffers: Buffer[] = [];
  public length = 0;

  protected write(buf: Buffer) {
    this.buffers.push(buf);
    this.length += buf.length;
  }

  getBuffer() {
    return Buffer.concat(this.buffers);
  }

  clear() {
    this.buffers = [];
    this.length = 0;
    return this;
  }

  writeBoolean(bool: boolean) {
    this.writeByte(bool ? 1 : 0);
    return this;
  }

  writeByte(num: number) {
    const buf = Buffer.allocUnsafe(1);
    buf.writeInt8(num);
    this.write(buf);
    return this;
  }

  writeUByte(num: number) {
    const buf = Buffer.allocUnsafe(1);
    buf.writeUInt8(num);
    this.write(buf);
    return this;
  }

  writeShort(num: number) {
    const buf = Buffer.allocUnsafe(2);
    buf.writeInt16BE(num);
    this.write(buf);
    return this;
  }

  writeUShort(num: number) {
    const buf = Buffer.allocUnsafe(2);
    buf.writeUInt16BE(num);
    this.write(buf);
    return this;
  }

  writeInt(num: number) {
    const buf = Buffer.allocUnsafe(4);
    buf.writeInt32BE(num);
    this.write(buf);
    return this;
  }

  writeLong(num: bigint) {
    const buf = Buffer.allocUnsafe(8);
    buf.writeBigInt64BE(num);
    this.write(buf);
    return this;
  }

  writeFloat(num: number) {
    const buf = Buffer.allocUnsafe(4);
    buf.writeFloatBE(num);
    this.write(buf);
    return this;
  }

  writeDouble(num: number) {
    const buf = Buffer.allocUnsafe(8);
    buf.writeDoubleBE(num);
    this.write(buf);
    return this;
  }

  writeString(str: string) {
    // TODO: Specify max length
    const textBuf = Buffer.from(str, 'utf8');
    return this.writeVarInt(textBuf.length).writeBlob(textBuf);
  }

  writeChat(chat: string | Chat) {
    if (typeof chat === 'string') {
      return this.writeString(chat);
    } else {
      return this.writeString(JSON.stringify(chat));
    }
  }

  writeIdentifier(identifier: string) {
    return this.writeString(identifier);
  }

  protected writeVarNum(maxByteCount: number, num: number) {
    const bytes = [];
    while (true) {
      const current = num & 0b1111111;
      const remaining = num & ~0b1111111;

      bytes.push(current | (remaining ? 0b10000000 : 0));
      if (bytes.length > maxByteCount) {
        throw new Error(`Number is too big for a VarNum(${maxByteCount})`);
      }

      num >>>= 7;

      if (!remaining) break;
    }

    this.write(Buffer.from(bytes));
    return this;
  }

  writeVarInt(num: number) {
    return this.writeVarNum(5, num);
  }

  writeVarLong(num: number) {
    return this.writeVarNum(10, num);
  }

  writePosition(x: number, y: number, z: number) {
    const buf = Buffer.allocUnsafe(8);
    buf.writeBigUInt64BE(
      ((BigInt(x) & ((1n << 26n) - 1n)) << (26n + 12n)) |
        ((BigInt(z) & ((1n << 26n) - 1n)) << 12n) |
        (BigInt(y) & 0xfffn),
    );
    return this.writeBlob(buf);
  }

  /**
   * Writes an angle as an unsigned byte (0-255)
   */
  writeAngle(num: number) {
    return this.writeUByte(num);
  }

  writeUuid(uuid: Buffer) {
    if (uuid.length !== 16) {
      throw new Error('UUID must have length of 16 bytes');
    }
    return this.writeBlob(uuid);
  }

  writeBlob(buf: Buffer) {
    this.write(buf);
    return this;
  }

  writeVarIntLenByteArray(buf: Buffer) {
    return this.writeVarInt(buf.length).writeBlob(buf);
  }

  writeNbt(compound: NBTCompound) {
    serializeNbt(this, compound);
    return this;
  }

  writeBitSet(bitSet: BitSet) {
    const longs = bitSet.getLongArray();
    this.writeVarInt(longs.length);
    for (const long of longs) this.writeLong(long);
    return this;
  }
}
