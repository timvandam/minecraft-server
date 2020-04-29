// These datatypes are for Java edition Minecraft - so big endian stuff

import { DataType, DataTypeConstructor } from '../../DataType'
import { ENBTTag } from '../../../enums/ENBTTag'

export interface NBTTagConstructor extends DataTypeConstructor {
  id: ENBTTag;
}

// Used to differentiate NBTTags and Minecraft DataTypes
export abstract class NBTTag<T> extends DataType<T> {
  [key: string]: any;
}

// A function that generates a NBT tag class. E.g. types lists are first generated using their type
export type NBTGenerator = (Type?: NBTTagConstructor) => NBTTagConstructor

// A map mapping ENBTTags to their respective NBT Tag classes
export const types: Map<ENBTTag, NBTTagConstructor|NBTGenerator> = new Map()
