// List prefixed by 1-byte type and 4 byte signed length
// Creates a List class with a specific type
// Whenever an array is found, it will be converted to a list with the type of the first element
// Other arrays have to be explicitly defined (IntArray, ByteArray, etc)
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTGenerator, NBTTag, NBTTagConstructor, types } from './index'
import { Int, int } from './Int'

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

export const list = (Type: NBTTagConstructor) => (...value: any[]): NBTTag<any> => new (List(Type))({ value })

types.set(ENBTTag.List, List)
