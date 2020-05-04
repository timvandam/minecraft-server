import { DataType } from './DataType'

export default class Short extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readInt16BE()
  }

  protected write (value: number): Buffer {
    const result = Buffer.alloc(2)
    result.writeInt16BE(value)
    return result
  }
}
