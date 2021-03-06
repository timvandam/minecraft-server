import { DataType, DataTypeConstructor } from './DataType'
import VarInt from './VarInt'
import _Array from './Array'

/**
 * Create a Length-Array with certain datatypes
 */
export default function (...DTs: DataTypeConstructor[]) {
  // Each element is an array!
  return class LArray extends _Array(...DTs) {
    protected read (data: Buffer): any[] {
      // Read length
      const length = new VarInt({ buffer: data })
      data = data.slice(length.buffer.length)
      return super.read(data, length.value)
    }

    protected write (values: any[]): Buffer {
      const length = new VarInt({ value: values.length })
      return Buffer.concat([
        length.buffer,
        super.write(values)
      ])
    }
  }
}
