export abstract class DataType<T> {
  public value: T;
  public buffer: Buffer;

  constructor (value: T | Buffer) {
    this.value = value instanceof Buffer
      ? this.read(value)
      : value

    this.buffer = value instanceof Buffer
      ? value
      : this.write(value)
  }

  protected abstract read (data: Buffer): T
  protected abstract write (value: T): Buffer
}
