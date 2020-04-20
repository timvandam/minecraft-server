import { DataType } from './DataType'

export default class UShort extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readUInt16BE()
  }

  protected write (value: number): Buffer {
    const result = Buffer.alloc(2)
    result.writeUInt16BE(value)
    return result
  }
}
