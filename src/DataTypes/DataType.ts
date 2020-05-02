export interface DataTypeConstructor {
  new <T>(obj: HasValue<T> | HasBuffer): DataType<T>;
  new <T>(obj: HasValue<T> | HasBuffer, ...args: any[]): DataType<T>;
}

export interface HasValue<T> {
  value: T;
  buffer?: undefined;
}

export interface HasBuffer {
  buffer: Buffer;
  value?: undefined;
}

export abstract class DataType<T> {
  public value: T
  public buffer: Buffer

  constructor ({ value = undefined, buffer = undefined }: HasValue<T> | HasBuffer) {
    this.value = value ?? this.read(buffer as Buffer)

    // Re-write the buffer from the read value
    // This is done in case the provided buffer was too large but still read correctly
    this.buffer = this.write(this.value)
    // if (value !== undefined) this.value = this.read(this.buffer) // reflect any loss of precision
  }

  protected abstract read (data: Buffer): T
  protected abstract write (value: T): Buffer
}
