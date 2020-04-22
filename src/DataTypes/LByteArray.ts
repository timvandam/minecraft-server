import { DataType } from './DataType'
import VarInt from './VarInt'

export default class LByteArray extends DataType<Buffer> {
  protected read (data: Buffer): Buffer {
    const length = new VarInt({ buffer: data })
    const byteArray = data.slice(length.buffer.length).slice(0, length.value)
    return byteArray
  }

  protected write (value: Buffer): Buffer {
    const length = new VarInt({ value: value.length })
    return Buffer.concat([length.buffer, value])
  }
}
