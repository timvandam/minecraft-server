// A 4 byte float
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'

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
