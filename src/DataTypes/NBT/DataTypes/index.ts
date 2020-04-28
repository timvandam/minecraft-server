// These datatypes are for Java edition Minecraft - so big endian stuff

import { DataType, DataTypeConstructor } from '../../DataType'
import { ENBTTag } from '../../../enums/ENBTTag'

interface NBTTagConstructor extends DataTypeConstructor {
  id: ENBTTag;
}

// Used to differentiate NBTTags and Minecraft DataTypes
abstract class NBTTag<T> extends DataType<T> {
  [key: string]: any;
}

type NBTGenerator = (Type?: NBTTagConstructor) => NBTTagConstructor

export const types: Map<ENBTTag, NBTTagConstructor|NBTGenerator> = new Map()

// The end tag has no data, only its id (0)
// Used to indicate the end of Compound tags
export class End extends NBTTag<null> {
  public static id = ENBTTag.End

  constructor () {
    super({ value: null })
  }

  protected read (): null {
    return null
  }

  protected write (): Buffer {
    return Buffer.allocUnsafe(0)
  }
}
types.set(End.id, End)

// A single signed byte
export class Byte extends NBTTag<number> {
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
export const byte = (value: number): Byte => new Byte({ value })
types.set(Byte.id, Byte)

// A 2-byte signed short
export class Short extends NBTTag<number> {
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
export const short = (value: number): Short => new Short({ value })
types.set(Short.id, Short)

// A 4 byte int
export class Int extends NBTTag<number> {
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
export const int = (value: number): Int => new Int({ value })
types.set(Int.id, Int)

// A 8 bit long
export class Long extends NBTTag<bigint> {
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
export const long = (value: bigint): Long => new Long({ value })
types.set(Long.id, Long)

// A 4 byte float
export class Float extends NBTTag<number> {
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
export const float = (value: number): Float => new Float({ value })
types.set(Float.id, Float)

// A 8 byte double
export class Double extends NBTTag<number> {
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
export const double = (value: number): Double => new Double({ value })
types.set(Double.id, Double)

// An array of bytes prefixed by its length
export class ByteArray extends NBTTag<number[]> {
  public static id = ENBTTag.ByteArray

  protected read (data: Buffer): number[] {
    const length = new Byte({ buffer: data })
    data = data.slice(length.buffer.length)
    const result: number[] = []
    for (let i = 0; i < length.value; i++) {
      const byte = new Byte({ buffer: data.slice(i) })
      result.push(byte.value)
    }
    return result
  }

  protected write (values: number[]): Buffer {
    // Compute the length byte, then get all the numbers as bytes
    const length = byte(values.length)
    return Buffer.concat([length.buffer, ...values.map(value => byte(value).buffer)])
  }
}
export const bytearray = (...values: number[]): ByteArray => new ByteArray({ value: values })
types.set(ByteArray.id, ByteArray)

// A utf-8 string prefixed by its length (as an unsigned short)
// This never has to be used directly - string are automatically converted
export class NBTString extends NBTTag<string> {
  public static id = ENBTTag.String

  protected read (data: Buffer): string {
    const length = data.readUInt16BE()
    return data.toString('utf8', 2, 2 + length)
  }

  protected write (value: string): Buffer {
    const buf = Buffer.allocUnsafe(value.length + 2)
    buf.writeUInt16BE(value.length)
    buf.write(value, 2, 'utf8')
    return buf
  }
}
export const string = (value: string): NBTString => new NBTString({ value })
types.set(NBTString.id, NBTString)

// List prefixed by 1-byte type and 4 byte signed length
// Creates a List class with a specific type
// Whenever an array is found, it will be converted to a list with the type of the first element
// Other arrays have to be explicitly defined (IntArray, ByteArray, etc)
export const List: NBTGenerator = (Type?: NBTTagConstructor): NBTTagConstructor => class List extends NBTTag<any[]> {
  public static id = ENBTTag.List

  protected read (data: Buffer): any[] {
    const type = data.readUInt8()

    if (Type !== undefined && type !== Type.id) throw new Error(`Received list with type ${ENBTTag[type]}, but expected ${ENBTTag[Type.id]}`)
    if (Type === undefined) {
      if (types.get(type) === undefined) throw new Error('Received a list with an invalid type')
      else Type = types.get(type) as NBTTagConstructor
    }

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
    if (Type === undefined) return Buffer.allocUnsafe(0)
    return Buffer.concat([
      Buffer.alloc(1, Type.id), // Type
      int(values.length).buffer, // Length
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      ...values.map(value => new Type({ value }).buffer) // Data
    ])
  }
}
export const list = (Type: NBTTagConstructor) => (...values: any[]): NBTTag<any> => new (List(Type))({ value: values })
types.set(ENBTTag.List, List)

// Pretty much the NBT equivalent of an object
// Hence you don't have to use this. Objects will automatically be converted to a compound
export class Compound extends NBTTag<Record<string, NBTTag<any>>> {
  public static id = ENBTTag.Compound

  protected read (data: Buffer): Record<string, NBTTag<any>> {
    const result: Record<string, NBTTag<any>> = {}

    while (data.readUInt8() !== 0x00) {
      // Type, name length, name
      const type = data.readUInt8()
      data = data.slice(1)
      const length = data.readUInt16BE()
      data = data.slice(2)
      const name = data.slice(0, length).toString('utf8')
      data = data.slice(length)
      let Type = types.get(type)
      if (typeof Type === 'function') Type = (Type as NBTGenerator)()
      else if (Type === undefined) throw new Error('Invalid type!')
      const info = new Type({ buffer: data })
      data = data.slice(info.buffer.length)
      result[name] = info
    }

    return result
  }

  // Convert strings, objects and arrays to their respective NBT types
  private static convertValue (value: NBTTag<any>|string|any[]|object|Record<string, any>): NBTTag<any> {
    let result: NBTTag<any>

    if (value instanceof NBTTag) {
      // Its an NBT tag!
      result = value
    } else if (Array.isArray(value)) {
      const firstType = value.length === 0 ? End : value[0].constructor
      result = list(firstType)(...value)
    } else if (typeof value === 'string') {
      result = string(value)
    } else if (typeof value === 'object') {
      // Convert all children into NBT tags recursively
      const obj: Record<string, NBTTag<any>> = {}
      Object.entries(value).forEach(([key, value]) => {
        obj[key] = Compound.convertValue(value)
      })
      result = new Compound({ value: obj })
    } else throw new Error(`Invalid value of type ${typeof value}`)

    return result
  }

  protected write (NBT: Record<string, any>): Buffer {
    // Convert all children into NBT tags
    Object.entries(NBT).forEach(([key, value]) => {
      NBT[key] = Compound.convertValue(value)
    })

    // Calculate the amount of bytes needed
    let bytes = 1 // we will need 1 byte for the END tag
    Object.entries(NBT).forEach(([key, value]) => {
      bytes += 1 // type
      bytes += 2 // name length
      bytes += key.length // name
      bytes += value.buffer.length // value's length
    })

    const result = Buffer.allocUnsafe(bytes)
    result.writeUInt8(0, bytes - 1) // end tag

    // Write all data to the buffer
    let cursor = 0
    Object.entries(NBT).forEach(([key, value]) => {
      const Type: NBTTagConstructor = value.constructor
      const typeID: ENBTTag = Type.id
      // ID
      result.writeUInt8(typeID, cursor)
      cursor += 1
      // Name length + name
      result.writeUInt16BE(key.length, cursor)
      cursor += 2
      result.write(key, cursor)
      cursor += key.length
      // Data
      result.write(value.buffer.toString('hex'), cursor, 'hex')
      cursor += value.buffer.length
    })

    return result
  }
}
const compound = (value: Record<string, any>): Compound => new Compound({ value })
types.set(Compound.id, Compound)

// TODO: IntArray, LongArray.
