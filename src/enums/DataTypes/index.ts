// These datatypes are for Java edition Minecraft - so big endian stuff

import { DataType } from '../../DataTypes/DataType'

// A single signed byte
export class Byte extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readInt8()
  }

  protected write (value: number): Buffer {
    const buf = Buffer.allocUnsafe(1)
    buf.writeInt8(value)
    return buf
  }
}
export const byte = (value: number) => new Byte({ value })

// A 2-byte signed short
export class Short extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readInt16BE()
  }

  protected write (value: number): Buffer {
    const buf = Buffer.allocUnsafe(2)
    buf.writeInt16BE(value)
    return buf
  }
}
export const short = (value: number) => new Short({ value })

// A 4 byte int
export class Int extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readInt32BE()
  }

  protected write (value: number): Buffer {
    const buf = Buffer.allocUnsafe(4)
    buf.writeInt32BE(value)
    return buf
  }
}
export const int = (value: number) => new Int({ value })

// A 8 bit long
export class Long extends DataType<bigint> {
  protected read (data: Buffer): bigint {
    return data.readBigInt64BE()
  }

  protected write (value: bigint): Buffer {
    const buf = Buffer.allocUnsafe(8)
    buf.writeBigInt64BE(value)
    return buf
  }
}
export const long = (value: bigint) => new Long({ value })

// A 4 byte float
export class Float extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readFloatBE()
  }

  protected write (value: number): Buffer {
    const buf = Buffer.allocUnsafe(4)
    buf.writeFloatBE(value)
    return buf
  }
}
export const float = (value: number) => new Float({ value })

// A 8 byte double
export class Double extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readDoubleBE()
  }

  protected write (value: number): Buffer {
    const buf = Buffer.allocUnsafe(8)
    buf.writeDoubleBE(value)
    return buf
  }
}
export const double = (value: number) => new Double({ value })
