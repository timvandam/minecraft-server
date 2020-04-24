import { DataTypeConstructor, HasBuffer, HasValue } from './DataType'

export default function (DT: any) {
  return class Optional extends DT {
    constructor ({ value = undefined, buffer = undefined }: HasValue<any> | HasBuffer, ...args: any[]) {
      if (value === undefined && buffer === undefined) return Buffer.alloc(0) // no value? thats fine.
      super({ value, buffer }, ...args)
    }
  }
}
