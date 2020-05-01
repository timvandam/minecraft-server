import { DataType } from './DataType'
import VarInt from './VarInt'

export default class ByteArray extends DataType<Buffer> {
  protected read (data: Buffer): Buffer {
    return data
  }

  protected write (value: Buffer): Buffer {
    return value
  }
}
