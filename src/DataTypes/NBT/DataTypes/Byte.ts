// A single signed byte
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'

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
