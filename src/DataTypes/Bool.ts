import { DataType } from './DataType'

export default class Bool extends DataType<boolean> {
  private readonly TRUE = Buffer.alloc(1, 0x01)
  private readonly FALSE = Buffer.alloc(1, 0x00)

  protected read (data: Buffer): boolean {
    return this.TRUE.compare(data) === 0
  }

  protected write (value: boolean): Buffer {
    return value ? this.TRUE : this.FALSE
  }
}
