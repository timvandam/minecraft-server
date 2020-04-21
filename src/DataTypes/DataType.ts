export interface DataTypeConstructor<T> {
  new <T>(value: T | Buffer): DataType<T>;
}

export abstract class DataType<T> {
  public value: T
  public buffer: Buffer

  constructor (value: T | Buffer) {
    this.value = value instanceof Buffer
      ? this.read(value)
      : value

    // Re-write the buffer from the read value
    // This is done in case the provided buffer was too large but still read correctly
    this.buffer = this.write(this.value)
  }

  protected abstract read (data: Buffer): T
  protected abstract write (value: T): Buffer
}
