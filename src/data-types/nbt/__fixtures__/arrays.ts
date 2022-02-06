import { readFile } from 'fs/promises';
import { byteArray, compound, intArray, longArray } from '../NBTSerialize';
import { resolve } from 'path';

export const name = 'arrays';

export const getActualNbtBuffer = () => readFile(resolve(__dirname, './nbt/arrays.nbt'));

export const nbtValue = compound({
  root: {
    byte: byteArray([1, 2, 3]),
    int: intArray([1, 2, 3]),
    long: longArray([1n, 2n, 3n]),
  },
});
