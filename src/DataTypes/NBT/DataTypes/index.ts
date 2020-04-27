// These datatypes are for Java edition Minecraft - so big endian stuff

import { DataType, DataTypeConstructor } from '../../DataType'
import { ENBTTag } from '../../../enums/ENBTTag'

interface NBTTagConstructor extends DataTypeConstructor {
  id: ENBTTag;
}

// Used to differentiate NBTTags and Minecraft DataTypes
interface NBTTag {
  [key: string]: any;
}

// A single signed byte
export class Byte extends DataType<number> implements NBTTag {
  public static id = ENBTTag.Byte

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
export class Short extends DataType<number> implements NBTTag {
  public static id = ENBTTag.Short

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
export class Int extends DataType<number> implements NBTTag {
  public static id = ENBTTag.Int

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
export class Long extends DataType<bigint> implements NBTTag {
  public static id = ENBTTag.Long

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
export class Float extends DataType<number> implements NBTTag {
  public static id = ENBTTag.Float

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
export class Double extends DataType<number> implements NBTTag {
  public static id = ENBTTag.Double

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

// An array of bytes prefixed by its length
export class ByteArray extends DataType<number[]> implements NBTTag {
  public static id = ENBTTag.ByteArray

  protected read (data: Buffer): number[] {
    return []
  }

  protected write (values: number[]): Buffer {
    // Compute the length byte, then get all the numbers as bytes
    const length = byte(values.length)
    return Buffer.concat([length.buffer, ...values.map(value => byte(value).buffer)])
  }
}
export const bytearray = (...values: number[]) => new ByteArray({ value: values })

// A utf-8 string prefixed by its length (as an unsigned short)
export class NBTString extends DataType<string> implements NBTTag {
  public static id = ENBTTag.String

  protected read (data: Buffer): string {
    const length = data.readUInt16BE()
    const str = data.toString('utf8', 2, 2 + length)
    return str
  }

  protected write (value: string): Buffer {
    const buf = Buffer.allocUnsafe(value.length + 2)
    buf.writeUInt16BE(value.length)
    buf.write(value, 2, 'utf8')
    return buf
  }
}
export const string = (value: string) => new NBTString({ value })

// List prefixed by 1-byte type and 4 byte signed length
// Creates a List class with a specific type
export const List = (Type: NBTTagConstructor) => class List extends DataType<any[]> implements NBTTag {
  public static id = ENBTTag.List

  protected read (data: Buffer): any[] {
    const type = data.readUInt8()

    if (type !== Type.id) throw new Error(`Received list with type ${ENBTTag[type]}, but expected ${ENBTTag[Type.id]}`)

    const size = new Int({ buffer: data.slice(1) }).value
    const items = []
    data = data.slice(5)

    for (let i = 0; i < size; i++) {
      const item = new Type({ buffer: data })
      items.push(item.value)
      data = data.slice(item.buffer.length)
    }

    return items
  }

  protected write (values: any[]): Buffer {
    return Buffer.concat([
      Buffer.alloc(1, Type.id), // Type
      int(values.length).buffer, // Length
      ...values.map(value => new Type({ value }).buffer) // Data
    ])
  }
}
export const list = (Type: NBTTagConstructor) => (...values: any[]) => new (List(Type))({ value: values })

// TODO: Compound, IntArray, LongArray.
// Compound should accept Record<string, NBTTag>
export class Compound extends DataType<Record<string, NBTTag>> implements NBTTag {}
