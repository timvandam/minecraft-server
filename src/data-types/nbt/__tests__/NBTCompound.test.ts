import { byte, compound, int, list, long, longArray, short } from '../NBTSerialize';
import { NBTType } from '../NBTType';
import { nbtValue } from '../NBTValue';

it('nested compounds', () => {
  const cmp = compound({
    a: compound({
      b: compound({
        c: compound({
          d: longArray([1n, 2n, 3n]),
        }),
      }),
    }),
  });

  expect(cmp.getCompound('a').getCompound('b').getCompound('c').getLongArray('d')).toEqual([
    1n,
    2n,
    3n,
  ]);
});

it('type mismatch', () => {
  const cmp = compound({
    a: int(1),
  });
  expect(() => cmp.getLong('a')).toThrow();
});

it('missing value', () => {
  const cmp = compound({
    a: int(1),
  });
  expect(() => cmp.getLong('b')).toThrow();
});

it('typed list', () => {
  const cmp = compound({
    a: list.short(1, 2, 3),
  });
  expect(() => cmp.getList('a', NBTType.INT)).toThrow();
  expect(cmp.getList('a', NBTType.SHORT)).toEqual([1, 2, 3]);
});

it('invalid typed list', () => {
  const cmp = compound({
    a: nbtValue(NBTType.LIST, [short(1), byte(2), long(3n)]),
  });
  expect(() => cmp.getList('a', NBTType.SHORT)).toThrow();
  expect(() => cmp.getList('a', NBTType.BYTE)).toThrow();
  expect(() => cmp.getList('a', NBTType.LONG)).toThrow();
});
