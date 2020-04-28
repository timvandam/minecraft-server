import { DataType } from './DataType'

export class Int extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readInt32BE()
  }

  protected write (value: number): Buffer {
    const result = Buffer.alloc(4)
    result.writeInt32BE(value)
    return result
  }
}
