import { once } from 'events';
import { Readable } from 'stream';

export class AsyncBuffer {
  constructor(protected readonly readable: Readable) {}

  async consume(count: number): Promise<Buffer> {
    while (true) {
      const buf = this.readable.read(count);

      if (buf !== null) {
        return buf;
      }

      await once(this.readable, 'readable');
    }
  }

  async readInt8() {
    return (await this.consume(1)).readInt8();
  }

  async readUInt8() {
    return (await this.consume(1)).readUInt8();
  }

  async readInt16BE() {
    return (await this.consume(2)).readInt16BE();
  }

  async readUInt16BE() {
    return (await this.consume(2)).readUInt16BE();
  }

  async readInt32BE() {
    return (await this.consume(4)).readInt32BE();
  }

  async readUInt32BE() {
    return (await this.consume(4)).readUInt32BE();
  }

  async readBigInt64BE() {
    return (await this.consume(8)).readBigInt64BE();
  }

  async readBigUInt64BE() {
    return (await this.consume(8)).readBigUInt64BE();
  }
}
