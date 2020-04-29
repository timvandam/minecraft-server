// A 8 bit long
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'

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
