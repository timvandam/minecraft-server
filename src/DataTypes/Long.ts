import { DataType } from './DataType'

export default class Long extends DataType<bigint> {
  protected read (data: Buffer): bigint {
    return data.readBigInt64BE()
  }

  protected write (value: bigint): Buffer {
    const result = Buffer.allocUnsafe(8)
    result.writeBigInt64BE(value)
    return result
  }
}
