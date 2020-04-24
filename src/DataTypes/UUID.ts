import { DataType } from './DataType'

export default class UUID extends DataType<string> {
  protected read (data: Buffer) {
    return data.toString('hex')
  }

  protected write (value: string): Buffer {
    return Buffer.from(value.replace(/-/g, ''), 'hex')
  }
}
