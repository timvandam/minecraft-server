// Pretty much the NBT equivalent of an object
// Hence you don't have to use this. Objects will automatically be converted to a compound
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTGenerator, NBTTag, NBTTagConstructor, types } from './index'
import { string } from './String'
import { End } from './End'
import { list } from './List'
import { long } from './Long'

export class Compound extends NBTTag<Record<string, NBTTag<any>>> {
  public static id = ENBTTag.Compound

  // Returns the value but instead of NBT Types uses JS types
  get json (): Record<string, any> {
    const result: Record<string, any> = {}

    Object.entries(this.value).forEach(([key, value]) => {
      result[key] = value?.json ?? value.value
    })

    return result
  }

  protected read (data: Buffer): Record<string, NBTTag<any>> {
    const result: Record<string, NBTTag<any>> = {}

    while (data.length && data.readUInt8() !== 0x00) {
      // Type, name length, name
      const type = data.readUInt8()
      data = data.slice(1)
      const length = data.readUInt16BE()
      data = data.slice(2)
      const name = data.slice(0, length).toString('utf8')
      data = data.slice(length)
      let Type = types.get(type)
      if (((Type as NBTTagConstructor)?.id) === undefined && typeof Type === 'function') Type = (Type as NBTGenerator)()
      else if (Type === undefined) throw new Error('Invalid type!')
      const info = new (Type as NBTTagConstructor)({ buffer: data })
      data = data.slice(info.buffer.length)
      result[name] = info
    }

    return result
  }

  // Convert strings, objects and arrays to their respective NBT types
  private static convertValue (value: NBTTag<any>|string|bigint|any[]|object|Record<string, any>): NBTTag<any> {
    let result: NBTTag<any>

    if (value instanceof NBTTag) {
      // Its an NBT tag!
      result = value
    } else if (typeof value === 'bigint') {
      result = long(value)
    } else if (Array.isArray(value)) {
      const firstType = value.length === 0 ? End : (Compound.convertValue(value[0]).constructor as NBTTagConstructor)
      result = list(firstType)(...value.map(val => val.value)) // we need to take their values because List will read them again
    } else if (typeof value === 'string') {
      result = string(value)
    } else if (typeof value === 'object') {
      // Convert all children into NBT tags recursively
      const obj: Record<string, NBTTag<any>> = {}
      Object.entries(value).forEach(([key, value]) => {
        obj[key] = Compound.convertValue(value)
      })
      result = new Compound({ value: obj })
    } else {
      throw new Error(`Invalid value of type ${typeof value}`)
    }

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
