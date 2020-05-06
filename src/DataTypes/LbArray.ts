import { DataType, DataTypeConstructor } from './DataType'
import VarInt from './VarInt'
import _Array from './Array'

/**
 * Create a Length-Array with certain datatypes
 */
export default function (...DTs: DataTypeConstructor[]) {
  // Each element is an array!
  return class LbArray extends _Array(...DTs) {
    protected read (data: Buffer): any[] {
      // Read length
      const length = new VarInt({ buffer: data })
      data = data.slice(length.buffer.length).slice(0, length.value)
      return super.read(data)
    }

    protected write (values: any[]): Buffer {
      const buf = super.write(values)
      const length = new VarInt({ value: buf.length })
      return Buffer.concat([
        length.buffer,
        buf
      ])
    }
  }
}
