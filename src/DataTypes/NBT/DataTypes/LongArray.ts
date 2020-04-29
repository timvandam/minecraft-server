// Array of Longs prefixed by its length (Int)
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'
import { Int, int } from './Int'
import { Long, long } from './Long'

export class LongArray extends NBTTag<bigint[]> {
  public static id = ENBTTag.LongArray

  protected read (data: Buffer): bigint[] {
    const length = new Int({ buffer: data })
    data = data.slice(4)
    const result: bigint[] = []

    for (let i = 0; i < length.value; i++) {
      result.push(new Long({ buffer: data }).value)
      data = data.slice(8)
    }

    return result
  }

  protected write (values: bigint[]): Buffer {
    return Buffer.concat([
      int(values.length).buffer,
      ...values.map(value => long(value).buffer)
    ])
  }
}

export const longarray = (...value: bigint[]): LongArray => new LongArray({ value })

types.set(LongArray.id, LongArray)
