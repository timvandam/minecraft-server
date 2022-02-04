import { NBTType } from './NBTType';
import { NBT_VALUE, NBTValue } from './NBTValue';

/**
 * Class representing a compound tag, used for reading deserialized NBT values.
 * Allows reading compound tags with validation.
 * A POJO with users having to do validation is not possible because that would create an infinitely nested type
 */
export class NBTCompound implements NBTValue<NBTType.COMPOUND> {
  public readonly [NBT_VALUE]: typeof NBT_VALUE = NBT_VALUE;
  public readonly type = NBTType.COMPOUND;

  constructor(public readonly value: Record<string, NBTValue>) {}

  protected getNamedValue<T extends NBTType>(name: string, type: T): NBTValue<T> {
    const val = this.value[name];
    if (val === undefined) {
      throw new Error(`There exists no value with name '${name}'`);
    }

    if (val.type !== type) {
      throw new Error(
        `Value with name '${name}' has incorrect type. Expected ${
          NBTType[type]
        } (${type}), but got ${NBTType[val.type]} (${val.type})`,
      );
    }

    return val as NBTValue<T>;
  }

  getByte(name: string): number {
    return this.getNamedValue(name, NBTType.BYTE).value;
  }

  getShort(name: string): number {
    return this.getNamedValue(name, NBTType.SHORT).value;
  }

  getInt(name: string): number {
    return this.getNamedValue(name, NBTType.INT).value;
  }

  getLong(name: string): bigint {
    return this.getNamedValue(name, NBTType.LONG).value;
  }

  getFloat(name: string): number {
    return this.getNamedValue(name, NBTType.FLOAT).value;
  }

  getDouble(name: string): number {
    return this.getNamedValue(name, NBTType.DOUBLE).value;
  }

  getByteArray(name: string): number[] {
    return this.getNamedValue(name, NBTType.BYTE_ARRAY).value;
  }

  getString(name: string): string {
    return this.getNamedValue(name, NBTType.STRING).value;
  }

  getList(name: string, type: NBTType.COMPOUND): NBTCompound[];
  getList<T extends Exclude<NBTType, NBTType.COMPOUND>>(
    name: string,
    type: T,
  ): NBTValue<T>['value'][];

  getList<T extends NBTType>(name: string, type: T) {
    const list = this.getNamedValue(name, NBTType.LIST).value;

    const incorrectIndex = list.findIndex((val) => val.type !== type);
    if (incorrectIndex !== -1) {
      const val = list[incorrectIndex];
      let errorMessage = `List is of wrong type. Expected ${NBTType[type]} (${type}), but got ${
        NBTType[val.type]
      } (${val.type})`;

      if (incorrectIndex !== 0) {
        errorMessage += `. Incorrect item is at index ${incorrectIndex}. This indicates that something is wrong with client side list creation, as multiple types are present in a typed list`;
      }

      throw new Error(errorMessage);
    }

    if (type === NBTType.COMPOUND) {
      return list.map(
        (value) => new NBTCompound(value.value as NBTValue<NBTType.COMPOUND>['value']),
      );
    }

    return list.map((value) => value.value);
  }

  getCompound(name: string): NBTCompound {
    return new NBTCompound(this.getNamedValue(name, NBTType.COMPOUND).value);
  }

  getIntArray(name: string): number[] {
    return this.getNamedValue(name, NBTType.INT_ARRAY).value;
  }

  getLongArray(name: string): bigint[] {
    return this.getNamedValue(name, NBTType.LONG_ARRAY).value;
  }
}
