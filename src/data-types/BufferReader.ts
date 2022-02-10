import { deserializeNbt } from './nbt/NBTDeserialize';
import { NBTCompound } from './nbt';
import { BitSet } from './BitSet';

export class BufferReader {
  constructor(public buffer: Buffer) {}

  readBoolean() {
    const bool = this.buffer.readInt8() === 1;
    this.buffer = this.buffer.slice(1);
    return bool;
  }

  readByte() {
    const num = this.buffer.readInt8();
    this.buffer = this.buffer.slice(1);
    return num;
  }

  readUByte() {
    const num = this.buffer.readUInt8();
    this.buffer = this.buffer.slice(1);
    return num;
  }

  readShort() {
    const num = this.buffer.readInt16BE();
    this.buffer = this.buffer.slice(2);
    return num;
  }

  readUShort() {
    const num = this.buffer.readUInt16BE();
    this.buffer = this.buffer.slice(2);
    return num;
  }

  readInt() {
    const num = this.buffer.readInt32BE();
    this.buffer = this.buffer.slice(4);
    return num;
  }

  readLong() {
    const num = this.buffer.readBigInt64BE();
    this.buffer = this.buffer.slice(8);
    return num;
  }

  readFloat() {
    const num = this.buffer.readFloatBE();
    this.buffer = this.buffer.slice(4);
    return num;
  }

  readDouble() {
    const num = this.buffer.readDoubleBE();
    this.buffer = this.buffer.slice(8);
    return num;
  }

  readString() {
    // TODO: Specify max length
    const length = this.readVarInt();
    return this.readBlob(length).toString('utf8');
  }

  readChat() {
    return this.readString();
  }

  readIdentifier() {
    return this.readString();
  }

  protected readVarNum(maxByteCount: number) {
    let offset = 0;
    let result = 0;

    while (true) {
      if (offset >= maxByteCount) {
        throw new Error(`Number too big for VarNum(${maxByteCount}) is too big`);
      }

      const chunk = this.buffer.readInt8(offset);
      const value = chunk & 0b01111111;
      const hasNextChunk = chunk & 0b10000000;
      result |= value << (7 * offset);
      offset++;

      if (!hasNextChunk) break;
    }

    this.buffer = this.buffer.slice(offset);
    return result;
  }

  readVarInt() {
    return this.readVarNum(5);
  }

  readVarLong() {
    return this.readVarNum(10);
  }

  readPosition() {
    const num = this.buffer.readBigUInt64BE();
    const x = Number(num >> (12n + 26n));
    const z = Number((num >> 12n) & ((1n << 26n) - 1n));
    const y = Number(num & 0xfffn);

    this.buffer = this.buffer.slice(8);

    return { x, y, z };
  }

  readAngle() {
    const num = this.buffer.readUInt8();
    this.buffer = this.buffer.slice(1);
    return num;
  }

  readUuid() {
    return this.readBlob(16);
  }

  readBlob(length: number) {
    const buf = this.buffer.slice(0, length);
    this.buffer = this.buffer.slice(length);
    return buf;
  }

  readVarIntLenByteArray() {
    const length = this.readVarInt();
    return this.readBlob(length);
  }

  readNbt(): NBTCompound {
    return deserializeNbt(this);
  }

  readBitSet(): BitSet {
    const longCount = this.readVarInt();
    const buf = this.readBlob(longCount * 8);
    const longs = [];
    for (let i = 0; i < longCount; i++) {
      longs.push(buf.readBigUInt64LE(i * 8));
    }
    return BitSet.fromLongArray(longs);
  }
}
