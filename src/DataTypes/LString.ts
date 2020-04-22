import { DataType } from './DataType'
import VarInt from './VarInt'

export default class LString extends DataType<string> {
  protected read (data: Buffer): string {
    const length = new VarInt({ buffer: data })
    const text = data
      .slice(length.buffer.length)
      .slice(0, length.value)
      .toString('utf8')

    return text
  }

  protected write (value: string): Buffer {
    const length = new VarInt({ value: value.length })
    return Buffer.concat([length.buffer, Buffer.from(value, 'utf8')])
  }
}
