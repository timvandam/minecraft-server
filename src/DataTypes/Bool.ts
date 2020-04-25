import { DataType } from './DataType'

export default class Bool extends DataType<boolean> {
  // Buffers
  private static readonly TRUE = () => Buffer.alloc(1, 0x01)
  private static readonly FALSE = () => Buffer.alloc(1, 0x00)

  protected read (data: Buffer): boolean {
    return Bool.TRUE().compare(data) === 0
  }

  protected write (value: boolean): Buffer {
    return value ? Bool.TRUE() : Bool.FALSE()
  }
}
