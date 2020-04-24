import { DataType, DataTypeConstructor } from './DataType'
import VarInt from './VarInt'

/**
 * Create a Length-Array with certain datatypes
 */
export default function (...DTs: DataTypeConstructor[]) {
  return class LArray extends DataType<any[]> {
    protected read (data: Buffer): any[] {
      // Read length
      const length = new VarInt({ buffer: data })
      data = data.slice(length.buffer.length)

      const result = []

      // Fetch all values
      for (let i = 0; i < length.value; i++) {
        const DT = DTs[i]
        const value = new DT({ buffer: data })
        result.push(value.value)
        data = data.slice(value.buffer.length)
      }

      return result
    }

    protected write (value: any[]): Buffer {
      const array = []

      // Add buffers for each dt found
      for (const DT of DTs) {
        array.push(new DT({ value: value.shift() }).buffer)
      }

      // Add array length to the start
      const length = new VarInt({ value: array.length })
      array.unshift(length.buffer)

      return Buffer.concat(array)
    }
  }
}
