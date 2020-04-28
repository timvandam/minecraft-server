import { DataType } from './DataType'

export class UByte extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readUInt8()
  }

  protected write (value: number): Buffer {
    const result = Buffer.alloc(1)
    result.writeUInt8(value)
    return result
  }
}
