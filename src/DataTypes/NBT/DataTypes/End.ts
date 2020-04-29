import { ENBTTag } from '../../../enums/ENBTTag'
import { NBTTag, types } from './index'

// The end tag has no data, only its id (0)
// Used to indicate the end of Compound tags
export class End extends NBTTag<null> {
  public static id = ENBTTag.End

  constructor () {
    super({ value: null })
  }

  protected read (): null {
    return null
  }

  protected write (): Buffer {
    return Buffer.alloc(1)
  }
}

types.set(End.id, End)
