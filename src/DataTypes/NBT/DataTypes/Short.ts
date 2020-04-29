// A 2-byte signed short
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'

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
