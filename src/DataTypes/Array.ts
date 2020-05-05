import { DataType, DataTypeConstructor } from './DataType'
import VarInt from './VarInt'

/**
 * Create a Array with certain datatypes
 */
export default function (...DTs: DataTypeConstructor[]) {
  // Each element is an array!
  return class Array extends DataType<any[][]> {
    protected read (data: Buffer): any[] {
      const result = []

      // Fetch all values
      for (let i = 0; i < data.length;) {
        const element = []
        for (let j = 0; j < DTs.length; j++) {
          const DT = DTs[j]
          const value = new DT({ buffer: data.slice(i) })
          element.push(value.value)
          i += value.buffer.length
        }
        result.push(element)
      }

      return result
    }

    protected write (values: any[]): Buffer {
      const array = []

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
