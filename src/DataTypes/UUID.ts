import { DataType } from './DataType'

export default class UUID extends DataType<string> {
  protected read (data: Buffer): string {
    return data.slice(0, 16).toString('hex')
  }

  protected write (value: string): Buffer {
    return Buffer.from(value.replace(/-/g, ''), 'hex').slice(0, 16)
  }
}
