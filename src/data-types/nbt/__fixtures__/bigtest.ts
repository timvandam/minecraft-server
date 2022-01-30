import { readFile } from 'fs/promises';
import { byte, byteArray, double, float, int, list, nbt, short } from '../NBTSerialize';
import { resolve } from 'path';

export const name = 'bigtest';

export const getActualNbtBuffer = () => readFile(resolve(__dirname, './bigtest.nbt'));

export const nbtValue = nbt('Level', {
  longTest: 9223372036854775807n,
  shortTest: short(32767),
  stringTest: 'HELLO WORLD THIS IS A TEST STRING \xc5\xc4\xd6!',
  floatTest: float(0.49823147058486938),
  intTest: int(2147483647),
  'nested compound test': {
    ham: {
      name: 'Hampus',
      value: float(0.75),
    },
    egg: {
      name: 'Eggbert',
      value: float(0.5),
    },
  },
  'listTest (long)': list.long(11n, 12n, 13n, 14n, 15n),
  'listTest (compound)': list.compound(
    {
      name: 'Compound tag #0',
      'created-on': 1264099775885n,
    },
    {
      name: 'Compound tag #1',
      'created-on': 1264099775885n,
    },
  ),
  byteTest: byte(127),
  'byteArrayTest (the first 1000 values of (n*n*255+n*7)%100, starting with n=0 (0, 62, 34, 16, 8, ...))':
    byteArray(Array.from({ length: 1000 }, (_, i) => (i * i * 255 + i * 7) % 100)),
  doubleTest: double(0.49312871321823148),
});
