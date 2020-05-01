import { DataType } from './DataType'

export class Byte extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readInt8()
  }

  protected write (value: number): Buffer {
    const result = Buffer.alloc(1)
    result.writeInt8(value)
    return result
  }
}
