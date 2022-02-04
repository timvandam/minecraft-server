import { NBTType } from './NBTType';
import { NBTCompound } from './NBTCompound';

export const NBT_VALUE = Symbol('NBT_VALUE');
export type NBTValue<O extends NBTType = NBTType> = {
  [NBT_VALUE]: typeof NBT_VALUE;
  type: O;
} & (
  | {
      type: NBTType.END;
      value: null;
    }
  | {
      type: NBTType.BYTE;
      value: number;
    }
  | {
      type: NBTType.SHORT;
      value: number;
    }
  | {
      type: NBTType.INT;
      value: number;
    }
  | {
      type: NBTType.LONG;
      value: bigint;
    }
  | {
      type: NBTType.FLOAT;
      value: number;
    }
  | {
      type: NBTType.DOUBLE;
      value: number;
    }
  | {
      type: NBTType.BYTE_ARRAY;
      value: number[];
    }
  | {
      type: NBTType.STRING;
      value: string;
    }
  | {
      type: NBTType.LIST;
      value: NBTValue[];
    }
  | NBTCompound
  | {
      type: NBTType.INT_ARRAY;
      value: number[];
    }
  | {
      type: NBTType.LONG_ARRAY;
      value: bigint[];
    }
);

export function nbtValue<T extends NBTType>(type: T, value: NBTValue<T>['value']): NBTValue<T> {
  return {
    type,
    value,
    [NBT_VALUE]: NBT_VALUE,
  } as NBTValue<T>;
}

export function isNBTValue(value: unknown): value is NBTValue {
  return typeof value === 'object' && value !== null && NBT_VALUE in value;
}
