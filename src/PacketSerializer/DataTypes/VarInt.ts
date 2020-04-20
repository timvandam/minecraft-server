import { DataType } from "./";

export default class VarInt extends DataType<number> {
  protected read (data: Buffer): number {
    let numRead = 0
    let result = 0
    let read = 0

    do {
      read = data.readInt8(numRead)
      const value = (read & 0b01111111)
      result |= (value << (7 * numRead))
      numRead++
      if (numRead > 5) throw new Error('VarInt is too big')
    } while ((read & 0b10000000) !== 0)

    return result
  }

  protected write (value: number): Buffer {
    if (value > 2147483647) throw new Error('Value is out of range')
    if (value < -2147483648) throw new Error('Value is out of range')

    const result = []

    do {
      let temp = value & 0b01111111
      value >>>= 7
      if (value !== 0) temp |= 0b10000000
      result.push(temp)
    } while (value !== 0)


    return Buffer.from(result)
  }
}
