// These datatypes are for Java edition Minecraft - so big endian stuff

// TODO: Format these the same way as Minecraft datatypes for consistency sake

interface DataType {
  readonly value: number;
  readonly buffer: Buffer;
}

// A single signed byte
export class Byte implements DataType {
  public readonly value: number
  public readonly buffer: Buffer

  constructor (value: number) {
    this.value = value
    this.buffer = Buffer.allocUnsafe(1)
    this.buffer.writeInt8(value)
  }

  static read (buffer: Buffer) {
    return new Byte(buffer.readInt8())
  }
}

// A 2-byte signed short
export class Short implements DataType {
  public readonly value: number
  public readonly buffer: Buffer

  constructor (value: number) {
    this.value = value
    this.buffer = Buffer.allocUnsafe(2)
    this.buffer.writeInt16BE(value)
  }

  static read (buffer: Buffer) {
    return new Short(buffer.readInt16BE())
  }

}
