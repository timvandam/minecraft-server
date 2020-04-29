// An array of bytes prefixed by its length
import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'
import { Int, int } from './Int'
import { byte, Byte } from './Byte'

export class ByteArray extends NBTTag<number[]> {
  public static id = ENBTTag.ByteArray

  protected read (data: Buffer): number[] {
    const length = new Int({ buffer: data })
    data = data.slice(length.buffer.length)
    const result: number[] = []
    for (let i = 0; i < length.value; i++) {
      const byte = new Byte({ buffer: data.slice(i) })
      result.push(byte.value)
    }
    return result
  }

  protected write (values: number[]): Buffer {
    // Compute the length byte, then get all the numbers as bytes
    const length = int(values.length)
    return Buffer.concat([length.buffer, ...values.map(value => byte(value).buffer)])
  }
}

export const bytearray = (...values: number[]): ByteArray => new ByteArray({ value: values })

types.set(ByteArray.id, ByteArray)
