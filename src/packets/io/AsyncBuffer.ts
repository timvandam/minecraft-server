import { EventEmitter, on } from 'events';

export class AsyncBuffer {
  protected length = 0;
  protected chunks: Buffer[] = [];
  protected lengthEmitters: EventEmitter[] = [];

  protected static async pipe(asyncIterable: AsyncIterable<Buffer>, asyncBuffer: AsyncBuffer) {
    for await (const buffer of asyncIterable) {
      asyncBuffer.expand(buffer);
    }
  }

  static fromAsyncIterable(asyncIterable: AsyncIterable<Buffer>) {
    const asyncBuffer = new AsyncBuffer();
    AsyncBuffer.pipe(asyncIterable, asyncBuffer);
    return asyncBuffer;
  }

  protected emitLength() {
    this.lengthEmitters[0]?.emit('length', this.length);
  }

  expand(buffer: Buffer) {
    this.chunks.push(buffer);
    this.length += buffer.length;
    this.emitLength();
  }

  async consume(byteCount: number): Promise<Buffer> {
    const lengthEmitter = new EventEmitter();
    this.lengthEmitters.push(lengthEmitter);

    if (byteCount === 0) {
      return Buffer.alloc(0);
    }

    if (this.lengthEmitters.length > 1 || this.length < byteCount) {
      // Wait for enough bytes to be present (and for our turn)
      for await (const length of on(lengthEmitter, 'length')) {
        if (length >= byteCount) break;
      }
    }

    // Check which chunks we need to get the requested amount of bytes
    let remainingByteCount = byteCount;
    let lastBufferIndex = 0;
    for (let i = 0; i < this.chunks.length; i++) {
      remainingByteCount -= this.chunks[i].length;
      lastBufferIndex = i;
      if (remainingByteCount <= 0) break;
    }

    if (remainingByteCount > 0) {
      throw new Error('Not enough bytes available. This should be impossible!');
    }

    // Get all the required chunks
    const buffers = this.chunks.splice(0, lastBufferIndex + 1);

    // We took too many bytes. Split the last buffer
    if (remainingByteCount < 0) {
      const bytesTooMany = -remainingByteCount;
      const lastChunk = buffers[buffers.length - 1];
      const overshotBytes = lastChunk.slice(lastChunk.length - bytesTooMany);
      buffers[buffers.length - 1] = lastChunk.slice(0, lastChunk.length - bytesTooMany);
      this.chunks.unshift(overshotBytes);
    }

    const buffer = Buffer.concat(buffers);

    this.length -= buffer.length;
    this.lengthEmitters.shift();
    this.emitLength();

    return buffer;
  }
}
