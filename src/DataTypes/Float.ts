import { DataType } from './DataType'

export default class Float extends DataType<number> {
  protected read (data: Buffer): number {
    return data.readFloatBE()
  }

  protected write (value: number): Buffer {
    const buf = Buffer.allocUnsafe(4)
    buf.writeFloatBE(value)
    return buf
  }
}
