enum NBTType {
  END = 0,
  BYTE = 1,
  SHORT = 2,
  INT = 3,
  LONG = 4,
  FLOAT = 5,
  DOUBLE = 6,
  BYTE_ARRAY = 7,
  STRING = 8,
  LIST = 9,
  COMPOUND = 10,
  INT_ARRAY = 11,
  LONG_ARRAY = 12,
}

const NBT_VALUE = Symbol('NBT_VALUE');
type NBTValue<O extends NBTType = NBTType, I = unknown> = {
  [NBT_VALUE]: typeof NBT_VALUE;
  type: O;
} & (
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
      value: (I & (NBTValue | InferrableNBTValue))[];
    }
  | {
      type: NBTType.COMPOUND;
      value: { [K: string]: NBTValue | InferrableNBTValue };
    }
  | {
      type: NBTType.INT_ARRAY;
      value: number[];
    }
  | {
      type: NBTType.LONG_ARRAY;
      value: bigint[];
    }
);

type InferrableNBTValue<T extends NBTType = NBTType> =
  // | (NBTValue<T> | (InferrableNBTValue & NBTValue<T>['value']))[] // List TODO: Fix this type to include just one infered
  | string // String
  | bigint // Long
  | { [K: string]: NBTValue | InferrableNBTValue }; // Compound

type WrapInList<T> = {
  [K in keyof T & string]: T[K] extends (arg: infer T) => NBTValue<infer R, infer I>
    ? (...args: T[]) => NBTValue<NBTType.LIST, NBTValue<R, I>>
    : K extends 'list'
    ? WrapInList<WrapInList<T>>
    : T[K];
};

type NBT = {
  (name: string, value: NBTValue | InferrableNBTValue): Buffer;
  compound(compound: NBTValue<NBTType.COMPOUND>['value']): NBTValue<NBTType.COMPOUND>;
  string(str: NBTValue<NBTType.STRING>['value']): NBTValue<NBTType.STRING>;
  byte(num: NBTValue<NBTType.BYTE>['value']): NBTValue<NBTType.BYTE>;
  short(num: NBTValue<NBTType.SHORT>['value']): NBTValue<NBTType.SHORT>;
  int(num: NBTValue<NBTType.INT>['value']): NBTValue<NBTType.INT>;
  long(num: NBTValue<NBTType.LONG>['value']): NBTValue<NBTType.LONG>;
  float(num: NBTValue<NBTType.FLOAT>['value']): NBTValue<NBTType.FLOAT>;
  double(num: NBTValue<NBTType.DOUBLE>['value']): NBTValue<NBTType.DOUBLE>;
  byteArray(nums: NBTValue<NBTType.BYTE_ARRAY>['value']): NBTValue<NBTType.BYTE_ARRAY>;
  intArray(nums: NBTValue<NBTType.INT_ARRAY>['value']): NBTValue<NBTType.INT_ARRAY>;
  longArray(nums: NBTValue<NBTType.LONG_ARRAY>['value']): NBTValue<NBTType.LONG_ARRAY>;

  list: WrapInList<NBT>;
};

function isNBTValue(value: unknown): value is NBTValue {
  return typeof value === 'object' && value !== null && NBT_VALUE in value;
}

type NormalizedNBTValue<O extends NBTType = NBTType, I extends NBTType = NBTType> = { type: O } & (
  | Exclude<NBTValue<O, I>, { type: NBTType.COMPOUND | NBTType.LIST }>
  | (
      | {
          type: NBTType.LIST;
          value: NormalizedNBTValue<I>[];
        }
      | {
          type: NBTType.COMPOUND;
          value: { [K: string]: NormalizedNBTValue };
        }
    )
);

/**
 * Infer everything that can be inferred.
 */
function normalize(value: NBTValue | InferrableNBTValue): NormalizedNBTValue {
  if (isNBTValue(value)) {
    switch (value.type) {
      case NBTType.COMPOUND:
        return {
          ...value,
          value: Object.fromEntries(
            Object.entries(value.value).map(([key, value]) => [key, normalize(value)]),
          ),
        };

      case NBTType.LIST:
        return {
          ...value,
          value: value.value.map((el) => normalize(el)),
        };

      default:
        return value;
    }
  }

  switch (typeof value) {
    case 'string':
      return string(value);

    case 'bigint':
      return long(value);

    case 'object': {
      if (Array.isArray(value)) {
        return normalize({ type: NBTType.LIST, value, [NBT_VALUE]: NBT_VALUE });
      } else {
        return normalize(compound(value));
      }
    }
  }

  return value;
}

function serializeArray(
  ...[itemSize, items]:
    | [itemSize: 1, items: number[]]
    | [itemSize: 4, items: number[]]
    | [itemSize: 8, items: bigint[]]
): Buffer {
  const buf = Buffer.allocUnsafe(4 + itemSize * items.length);
  buf.writeInt32BE(items.length);

  const write = {
    1: buf.writeInt8,
    4: buf.writeInt32BE,
    8: buf.writeBigInt64BE,
  }[itemSize].bind(buf) as (value: typeof items[number], offset: number) => number;

  for (let i = 0; i < items.length; i++) {
    write(items[i], 4 + i * itemSize);
  }

  return buf;
}

/**
 * Turn some value into a buffer. Does not include the type ID (except for lists and compound items)
 */
function serialize(value: NormalizedNBTValue): Buffer {
  switch (value.type) {
    case NBTType.BYTE: {
      const buf = Buffer.allocUnsafe(1);
      buf.writeInt8(value.value);
      return buf;
    }

    case NBTType.SHORT: {
      const buf = Buffer.allocUnsafe(2);
      buf.writeInt16BE(value.value);
      return buf;
    }

    case NBTType.INT: {
      const buf = Buffer.allocUnsafe(4);
      buf.writeInt32BE(value.value);
      return buf;
    }

    case NBTType.LONG: {
      const buf = Buffer.allocUnsafe(8);
      buf.writeBigInt64BE(value.value);
      return buf;
    }

    case NBTType.FLOAT: {
      const buf = Buffer.allocUnsafe(4);
      buf.writeFloatBE(value.value);
      return buf;
    }

    case NBTType.DOUBLE: {
      const buf = Buffer.allocUnsafe(8);
      buf.writeDoubleBE(value.value);
      return buf;
    }

    case NBTType.STRING: {
      const stringBuf = Buffer.from(value.value, 'utf8');
      const stringLenBuf = Buffer.allocUnsafe(2);
      stringLenBuf.writeInt16BE(stringBuf.length);
      return Buffer.concat([stringLenBuf, stringBuf]);
    }

    case NBTType.LIST: {
      const itemsBuf = value.value.map((el) => serialize(el));
      const itemCountBuf = Buffer.allocUnsafe(4);
      itemCountBuf.writeInt32BE(itemsBuf.length);
      const type = value.value?.[0]?.type ?? NBTType.END;
      return Buffer.concat([Buffer.of(type), itemCountBuf, ...itemsBuf]);
    }

    case NBTType.COMPOUND: {
      const itemsBuf = Object.entries(value.value).map(([key, val]) => {
        // TODO: Use namedNbt
        const nameBuf = Buffer.from(key, 'utf8');
        const nameLenBuf = Buffer.allocUnsafe(2);
        nameLenBuf.writeUInt16BE(nameBuf.length);
        return Buffer.concat([Buffer.of(val.type), nameLenBuf, nameBuf, serialize(val)]);
      });
      return Buffer.concat([...itemsBuf, Buffer.of(NBTType.END)]);
    }

    case NBTType.BYTE_ARRAY:
      return serializeArray(1, value.value);

    case NBTType.INT_ARRAY:
      return serializeArray(4, value.value);

    case NBTType.LONG_ARRAY:
      return serializeArray(8, value.value);
  }
}

const namedNbt = (name: string, value: NBTValue | InferrableNBTValue) => {
  // Create a root element with some name
  const normalizedValue = normalize(value);
  const buf = serialize(normalizedValue);

  // TODO: Use modified utf8
  const nameBuf = Buffer.from(name, 'utf8');
  const nameLenBuf = Buffer.allocUnsafe(2);
  nameLenBuf.writeUInt16BE(nameBuf.length);

  return Buffer.concat([Buffer.of(normalizedValue.type), nameLenBuf, nameBuf, buf]);
};

export const nbt: NBT = (name: string, value: NBTValue | InferrableNBTValue) =>
  namedNbt(name, value);

export const compound = (
  value: NBTValue<NBTType.COMPOUND>['value'],
): NBTValue<NBTType.COMPOUND> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.COMPOUND,
  value,
});
nbt.compound = compound;

export const string = (value: NBTValue<NBTType.STRING>['value']): NBTValue<NBTType.STRING> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.STRING,
  value,
});
nbt.string = string;

export const byte = (value: NBTValue<NBTType.BYTE>['value']): NBTValue<NBTType.BYTE> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.BYTE,
  value,
});
nbt.byte = byte;

export const short = (value: NBTValue<NBTType.SHORT>['value']): NBTValue<NBTType.SHORT> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.SHORT,
  value,
});
nbt.short = short;

export const int = (value: NBTValue<NBTType.INT>['value']): NBTValue<NBTType.INT> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.INT,
  value,
});
nbt.int = int;

export const long = (value: NBTValue<NBTType.LONG>['value']): NBTValue<NBTType.LONG> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.LONG,
  value,
});
nbt.long = long;

export const float = (value: NBTValue<NBTType.FLOAT>['value']): NBTValue<NBTType.FLOAT> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.FLOAT,
  value,
});
nbt.float = float;

export const double = (value: NBTValue<NBTType.DOUBLE>['value']): NBTValue<NBTType.DOUBLE> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.DOUBLE,
  value,
});
nbt.double = double;

export const byteArray = (
  value: NBTValue<NBTType.BYTE_ARRAY>['value'],
): NBTValue<NBTType.BYTE_ARRAY> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.BYTE_ARRAY,
  value,
});
nbt.byteArray = byteArray;

export const intArray = (
  value: NBTValue<NBTType.INT_ARRAY>['value'],
): NBTValue<NBTType.INT_ARRAY> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.INT_ARRAY,
  value,
});
nbt.intArray = intArray;

export const longArray = (
  value: NBTValue<NBTType.LONG_ARRAY>['value'],
): NBTValue<NBTType.LONG_ARRAY> => ({
  [NBT_VALUE]: NBT_VALUE,
  type: NBTType.LONG_ARRAY,
  value,
});
nbt.longArray = longArray;

export const list = createListProp(nbt);
nbt.list = list;

function isKeyOf<T>(obj: T, key: unknown): key is keyof T {
  return typeof key === 'string' && key in obj;
}

function createListProp<T>(nbt: T): WrapInList<T> {
  return new Proxy<WrapInList<T>>(nbt as WrapInList<T>, {
    get(nbt, prop: string, receiver) {
      if (prop === 'list') {
        return createListProp(receiver);
      }

      if (isKeyOf(nbt, prop)) {
        const fn = nbt[prop];

        if (typeof fn !== 'function') {
          return fn;
        }

        return (...args: unknown[]) => {
          return {
            [NBT_VALUE]: NBT_VALUE,
            type: NBTType.LIST,
            value: args.map((arg) => fn(arg)),
          };
        };
      }

      return undefined;
    },
  });
}
