import { AsyncBuffer } from '../packets/io/AsyncBuffer';

export class AsyncBufferReader<T extends unknown[]> {
  constructor(protected readonly buffer: AsyncBuffer) {}

  protected async readVarNum(maxByteCount: number) {
    let offset = 0;
    let result = 0;

    while (true) {
      if (offset >= maxByteCount) {
        throw new Error(`Number too big for VarNum(${maxByteCount}) is too big`);
      }

      const chunk = (await this.buffer.consume(1)).readInt8();
      const value = chunk & 0b01111111;
      const hasNextChunk = chunk & 0b10000000;
      result |= value << (7 * offset);
      offset++;

      if (!hasNextChunk) break;
    }

    return result;
  }

  readVarInt() {
    return this.readVarNum(5);
  }

  readVarLong() {
    return this.readVarNum(10);
  }

  readBlob(length: number) {
    return this.buffer.consume(length);
  }
}
