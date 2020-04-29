// A 4 byte int
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'

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
