// TODO: Write
export class BufferWriter {
  protected buffers: Buffer[] = [];
  protected shouldPrepend = false;
  public length = 0;

  protected clone() {
    const copy = new BufferWriter();
    copy.buffers = this.buffers;
    copy.length = this.length;
    return copy;
  }

  get prepend() {
    const copy = this.clone();
    copy.shouldPrepend = true;
    return copy;
  }

  get append() {
    const copy = this.clone();
    copy.shouldPrepend = false;
    return copy;
  }

  protected write(buf: Buffer) {
    if (this.shouldPrepend) {
      this.buffers.unshift(buf);
    } else {
      this.buffers.push(buf);
    }
    this.length += buf.length;
  }

  getBuffer() {
    return Buffer.concat(this.buffers);
  }

  clear() {
    // Setting length to 0 makes sure the underlying reference stays the same. Important in cases where you both prepend and append to the buffer (ie when there are multiple BufferWriters writing the same buffer)
    this.buffers.length = 0;
    this.length = 0;
    return this;
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

  // writeBoolean() {
  //   const bool = this.buffer.readInt8() === 1;
  //   this.buffer = this.buffer.slice(1);
  //   return bool;
  // }
  //
  // writeByte() {
  //   const num = this.buffer.readInt8();
  //   this.buffer = this.buffer.slice(1);
  //   return num;
  // }
  //
  // writeUByte() {
  //   const num = this.buffer.readUInt8();
  //   this.buffer = this.buffer.slice(1);
  //   return num;
  // }
  //
  // writeShort() {
  //   const num = this.buffer.readInt16BE();
  //   this.buffer = this.buffer.slice(2);
  //   return num;
  // }
  //
  // writeUShort() {
  //   const num = this.buffer.readUInt16BE();
  //   this.buffer = this.buffer.slice(2);
  //   return num;
  // }
  //
  // writeInt() {
  //   const num = this.buffer.readInt32BE();
  //   this.buffer = this.buffer.slice(4);
  //   return num;
  // }

  writeLong(num: bigint) {
    const buf = Buffer.allocUnsafe(8);
    buf.writeBigInt64BE(num);
    this.write(buf);
    return this;
  }

  // writeFloat() {
  //   const num = this.buffer.readFloatBE();
  //   this.buffer = this.buffer.slice(4);
  //   return num;
  // }
  //
  // writeDouble() {
  //   const num = this.buffer.readDoubleBE();
  //   this.buffer = this.buffer.slice(8);
  //   return num;
  // }

  writeString(str: string) {
    // TODO: Specify max length
    const textBuf = Buffer.from(str, 'utf8');
    this.prepend.writeVarInt(textBuf.length);
    this.writeBlob(textBuf);
    return this;
  }

  // writeChat() {
  //   return this.readString();
  // }
  //
  // writeIdentifier() {
  //   return this.readString();
  // }
  //
  // writeVarInt() {
  //   return this.readVarNum(5);
  // }
  //
  // writeVarLong() {
  //   return this.readVarNum(10);
  // }
  //
  // writePosition() {
  //   const num = this.buffer.readBigInt64BE();
  //   const x = num >> (12n + 26n);
  //   const y = num & 0xfffn;
  //   const z = (num >> 12n) & ((1n << 26n) - 1n);
  //
  //   this.buffer = this.buffer.slice(8);
  //
  //   return { x, y, z };
  // }
  //
  // writeAngle() {
  //   const num = this.buffer.readUInt8();
  //   this.buffer = this.buffer.slice(1);
  //   return num;
  // }

  writeUuid(uuid: bigint) {
    const leftBuf = Buffer.allocUnsafe(8);
    const rightBuf = Buffer.allocUnsafe(8);
    leftBuf.writeBigInt64BE(uuid >> 64n);
    rightBuf.writeBigInt64BE(uuid & ((1n << 64n) - 1n));
    this.write(leftBuf);
    this.write(rightBuf);
    return this;
  }

  writeBlob(buf: Buffer) {
    this.write(buf);
    return this;
  }

  writeVarIntLenByteArray(buf: Buffer) {
    this.write(new BufferWriter().writeVarInt(buf.length).writeBlob(buf).getBuffer());
    return this;
  }
}
