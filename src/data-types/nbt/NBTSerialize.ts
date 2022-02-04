import { NBTType } from './NBTType';
import { isNBTValue, nbtValue, NBTValue } from './NBTValue';
import { serializeModifiedUtf8 } from './ModifiedUTF8';
import { BufferWriter } from '../BufferWriter';
import { NBTCompound } from './NBTCompound';

type InferrableNBTValue =
  | string // String
  | bigint // Long
  | { [K: string]: NBTValue | InferrableNBTValue }; // Compound

type WrapInList<T> = {
  [K in keyof T & string]: T[K] extends (arg: infer T) => NBTValue<infer R>
    ? (...args: T[]) => Omit<NBTValue<NBTType.LIST>, 'value'> & { value: NBTValue<R>[] }
    : K extends 'list'
    ? WrapInList<WrapInList<T>>
    : T[K];
};

type NBT = {
  (name: string, value: NBTValue | InferrableNBTValue): NBTValue<NBTType.COMPOUND>;
  compound(compound: { [K: string]: NBTValue | InferrableNBTValue }): NBTValue<NBTType.COMPOUND>;
  string(str: string): NBTValue<NBTType.STRING>;
  byte(num: number): NBTValue<NBTType.BYTE>;
  short(num: number): NBTValue<NBTType.SHORT>;
  int(num: number): NBTValue<NBTType.INT>;
  long(num: bigint): NBTValue<NBTType.LONG>;
  float(num: number): NBTValue<NBTType.FLOAT>;
  double(num: number): NBTValue<NBTType.DOUBLE>;
  byteArray(nums: number[]): NBTValue<NBTType.BYTE_ARRAY>;
  intArray(nums: number[]): NBTValue<NBTType.INT_ARRAY>;
  longArray(nums: bigint[]): NBTValue<NBTType.LONG_ARRAY>;

  list: WrapInList<NBT>;
};

function infer(value: string): NBTValue<NBTType.STRING>;
function infer(value: bigint): NBTValue<NBTType.LONG>;
function infer(value: { [K: string]: NBTValue | InferrableNBTValue }): NBTValue<NBTType.COMPOUND>;
function infer(value: NBTValue | InferrableNBTValue): NBTValue;

/**
 * Infer everything that can be inferred. Works recursively in case of compounds.
 */
function infer(value: NBTValue | InferrableNBTValue): NBTValue {
  if (isNBTValue(value)) {
    return value;
  }

  switch (typeof value) {
    case 'string':
      return string(value);

    case 'bigint':
      return long(value);

    case 'object':
      return new NBTCompound(
        Object.fromEntries(Object.entries(value).map(([k, v]) => [k, infer(v)])),
      );
  }

  return value;
}

function serializeArray(
  writer: BufferWriter,
  ...[itemSize, items]:
    | [itemSize: 1, items: number[]]
    | [itemSize: 4, items: number[]]
    | [itemSize: 8, items: bigint[]]
): void {
  writer.writeInt(items.length);

  const write = {
    1: writer.writeByte,
    4: writer.writeInt,
    8: writer.writeLong,
  }[itemSize].bind(writer) as (value: typeof items[number]) => void;

  for (let i = 0; i < items.length; i++) {
    write(items[i]);
  }
}

function serializeString(writer: BufferWriter, str: string) {
  const stringBuf = serializeModifiedUtf8(str);
  writer.writeUShort(stringBuf.length).writeBlob(stringBuf);
}

function serializeNamedNbt(writer: BufferWriter, value: NBTValue, name: string) {
  writer.writeByte(value.type);
  serializeString(writer, name);
  serializeNbtWithoutType(writer, value);
}

function serializeNbtWithoutType(writer: BufferWriter, value: NBTValue, root = false): void {
  switch (value.type) {
    case NBTType.BYTE:
      writer.writeByte(value.value);
      break;

    case NBTType.SHORT:
      writer.writeShort(value.value);
      break;

    case NBTType.INT:
      writer.writeInt(value.value);
      break;

    case NBTType.LONG:
      writer.writeLong(value.value);
      break;

    case NBTType.FLOAT:
      writer.writeFloat(value.value);
      break;

    case NBTType.DOUBLE:
      writer.writeDouble(value.value);
      break;

    case NBTType.STRING:
      serializeString(writer, value.value);
      break;

    case NBTType.LIST: {
      const type = value.value?.[0]?.type ?? NBTType.END;
      writer.writeByte(type).writeInt(value.value.length);
      value.value.forEach((el) => serializeNbtWithoutType(writer, el));
      break;
    }

    case NBTType.COMPOUND:
      for (const [k, v] of Object.entries(value.value)) {
        serializeNamedNbt(writer, v, k);
      }
      // The root (implicit compound) does not have an END tag, so omit it if this is the root
      if (!root) {
        writer.writeByte(NBTType.END);
      }
      break;

    case NBTType.BYTE_ARRAY:
      serializeArray(writer, 1, value.value);
      break;

    case NBTType.INT_ARRAY:
      serializeArray(writer, 4, value.value);
      break;

    case NBTType.LONG_ARRAY:
      serializeArray(writer, 8, value.value);
      break;
  }
}

export const serializeNbt = (writer: BufferWriter, nbt: NBTValue<NBTType.COMPOUND>) =>
  serializeNbtWithoutType(writer, nbt, true);

export const nbt: NBT = (name: string, value: NBTValue | InferrableNBTValue) =>
  compound({ [name]: value });

nbt.compound = (value) => infer(value);
export const compound = nbt.compound;

nbt.string = (value) => nbtValue(NBTType.STRING, value);
export const string = nbt.string;

nbt.byte = (value) => nbtValue(NBTType.BYTE, value);
export const byte = nbt.byte;

nbt.short = (value) => nbtValue(NBTType.SHORT, value);
export const short = nbt.short;

nbt.int = (value) => nbtValue(NBTType.INT, value);
export const int = nbt.int;

nbt.long = (value) => nbtValue(NBTType.LONG, value);
export const long = nbt.long;

nbt.float = (value) => nbtValue(NBTType.FLOAT, value);
export const float = nbt.float;

nbt.double = (value) => nbtValue(NBTType.DOUBLE, value);
export const double = nbt.double;

nbt.byteArray = (value) => nbtValue(NBTType.BYTE_ARRAY, value);
export const byteArray = nbt.byteArray;

nbt.intArray = (value) => nbtValue(NBTType.INT_ARRAY, value);
export const intArray = nbt.intArray;

nbt.longArray = (value) => nbtValue(NBTType.LONG_ARRAY, value);
export const longArray = nbt.longArray;

export const list = createListProp(nbt);
nbt.list = list;

function isKeyOf<T>(obj: T, key: unknown): key is keyof T {
  return typeof key === 'string' && key in obj;
}

function createListProp<T>(nbt: T): WrapInList<T> {
  return new Proxy(nbt as WrapInList<T>, {
    get(nbt, prop: string) {
      if (prop === 'list') {
        return createListProp(nbt);
      }

      if (isKeyOf(nbt, prop)) {
        const fn = nbt[prop];

        if (typeof fn !== 'function') {
          return fn;
        }

        return (...args: unknown[]) => {
          return nbtValue(
            NBTType.LIST,
            args.map((arg) => fn(arg)),
          );
        };
      }

      return undefined;
    },
  });
}
