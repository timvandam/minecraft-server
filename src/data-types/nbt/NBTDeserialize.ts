// TODO: Turn buffer into NBTValue. Then have a reader with a .get method that gets also does assertions
import { nbtValue, NBTValue } from './NBTValue';
import { BufferReader } from '../BufferReader';
import { NBTType } from './NBTType';
import { deserializeModifiedUtf8 } from './ModifiedUTF8';
import {
  byte,
  byteArray,
  compound,
  double,
  float,
  int,
  intArray,
  long,
  longArray,
  short,
  string,
} from './NBTSerialize';

function isNBTType(num: number): num is NBTType {
  return Object.values(NBTType).includes(num);
}

function deserializeString(reader: BufferReader): NBTValue<NBTType.STRING> {
  const length = reader.readUShort();
  const stringBuf = reader.readBlob(length);
  const str = deserializeModifiedUtf8(stringBuf);
  return string(str);
}

function deserializeType(reader: BufferReader, type: NBTType): NBTValue {
  switch (type) {
    case NBTType.END:
      return nbtValue(NBTType.END, null);

    case NBTType.BYTE:
      return byte(reader.readByte());

    case NBTType.SHORT:
      return short(reader.readShort());

    case NBTType.INT:
      return int(reader.readInt());

    case NBTType.LONG:
      return long(reader.readLong());

    case NBTType.FLOAT:
      return float(reader.readFloat());

    case NBTType.DOUBLE:
      return double(reader.readDouble());

    case NBTType.BYTE_ARRAY: {
      const length = reader.readInt();
      return byteArray(Array.from({ length }, () => reader.readUByte()));
    }

    case NBTType.STRING:
      return deserializeString(reader);

    case NBTType.LIST: {
      const type = reader.readUByte();
      if (!isNBTType(type)) {
        throw new Error(`Invalid list type ${type}`);
      }
      const length = reader.readInt();
      if (length <= 0 && type === NBTType.END) {
        throw new Error('Invalid list: non-zero length containing end tags');
      }
      return nbtValue(
        NBTType.LIST,
        Array.from({ length }, () => deserializeType(reader, type)),
      );
    }

    case NBTType.COMPOUND: {
      const obj: Record<string, NBTValue> = {};
      let current = deserialize(reader, true);
      while (current.nbtValue.type !== NBTType.END) {
        obj[current.name] = current.nbtValue;
        current = deserialize(reader, true);
      }
      return compound(obj);
    }

    case NBTType.INT_ARRAY: {
      const length = reader.readInt();
      return intArray(Array.from({ length }, () => reader.readInt()));
    }

    case NBTType.LONG_ARRAY: {
      const length = reader.readInt();
      return longArray(Array.from({ length }, () => reader.readLong()));
    }

    default:
      throw new Error(`Unknown type ${type}`);
  }
}

function deserialize(reader: BufferReader, named = false): { name: string; nbtValue: NBTValue } {
  const type = reader.readUByte();

  if (!isNBTType(type)) {
    throw new Error(`Invalid NBT Type ${type}`);
  }

  if (type === NBTType.END) {
    return {
      get name(): string {
        throw new Error('NBTType.END does not have a name');
      },
      nbtValue: nbtValue(NBTType.END, null),
    };
  }

  if (named) {
    return {
      name: deserializeString(reader).value,
      nbtValue: deserializeType(reader, type),
    };
  }

  return {
    get name(): string {
      throw new Error('Can not access name of unnamed tags');
    },
    nbtValue: deserializeType(reader, type),
  };
}

export const deserializeNbt = (reader: BufferReader): NBTValue =>
  // Make the implicit root compound explicit, then just deserialize
  deserialize(
    new BufferReader(
      Buffer.concat([Buffer.of(NBTType.COMPOUND), reader.buffer, Buffer.of(NBTType.END)]),
    ),
  ).nbtValue;
