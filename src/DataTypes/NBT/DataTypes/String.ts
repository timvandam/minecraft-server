// A utf-8 string prefixed by its length (as an unsigned short)
// This never has to be used directly - string are automatically converted
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'

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
