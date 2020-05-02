import { DataType } from './DataType'

export default class Double extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readDoubleBE()
  }

  protected write (value: number): Buffer {
    const buf = Buffer.allocUnsafe(8)
    buf.writeDoubleBE(value)
    return buf
  }
}
