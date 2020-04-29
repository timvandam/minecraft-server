// A 8 byte double
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'

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
