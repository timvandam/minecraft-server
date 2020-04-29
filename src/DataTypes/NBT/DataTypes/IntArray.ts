// Array of Ints prefixed by an Int indicating its length
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'
import { Int, int } from './Int'

export class IntArray extends NBTTag<number[]> {
  public static id = ENBTTag.IntArray

  protected read (data: Buffer): number[] {
    const length = new Int({ buffer: data })
    data = data.slice(4)
    const result: number[] = []

    for (let i = 0; i < length.value; i++) {
      result.push(new Int({ buffer: data }).value)
      data = data.slice(4)
    }

    return result
  }

  protected write (values: number[]): Buffer {
    return Buffer.concat([
      int(values.length).buffer,
      ...values.map(value => int(value).buffer)
    ])
  }
}

export const intarray = (...value: number[]): IntArray => new IntArray({ value })

types.set(IntArray.id, IntArray)
