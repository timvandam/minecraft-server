import { DataType, DataTypeConstructor } from './DataType'
import VarInt from './VarInt'

/**
 * Create a Length-Array with certain datatypes
 */
export default function (...DTs: DataTypeConstructor[]) {
  // Each element is an array!
  return class LArray extends DataType<any[][]> {
    protected read (data: Buffer): any[] {
      // Read length
      const length = new VarInt({ buffer: data })
      data = data.slice(length.buffer.length)

      const result = []

      // Fetch all values
      for (let i = 0; i < length.value; i++) {
        const element = []
        for (let j = 0; j < DTs.length; j++) {
          const DT = DTs[j]
          const value = new DT({ buffer: data })
          element.push(value.value)
          data = data.slice(value.buffer.length)
        }
        result.push(element)
      }

      return result
    }

    protected write (values: any[]): Buffer {
      const array = []

      // Add array length to the start
      const length = new VarInt({ value: values.length })
      array.unshift(length.buffer)

      // For each element of the array, read them using the provided datatypes
      for (let i = 0; i < values.length; i++) {
        const value = values[i]
        // Add buffers for each dt found
        for (let j = 0; j < DTs.length; j++) {
          const DT = DTs[j]
          array.push(new DT({ value: value[j] }).buffer)
        }
      }

      return Buffer.concat(array)
    }
  }
}
