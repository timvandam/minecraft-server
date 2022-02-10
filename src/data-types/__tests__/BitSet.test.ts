import { BitSet } from '../BitSet';

it('add and remove', () => {
  const set = new BitSet();
  expect(set.has(0)).toBeFalsy();
  expect(set.has(1)).toBeFalsy();
  expect(set.has(2)).toBeFalsy();
  set.add(0);
  expect(set.has(0)).toBeTruthy();
  expect(set.has(1)).toBeFalsy();
  expect(set.has(2)).toBeFalsy();
  set.add(1);
  set.add(4);
  expect(set.has(0)).toBeTruthy();
  expect(set.has(1)).toBeTruthy();
  expect(set.has(2)).toBeFalsy();
  set.remove(0);
  expect(set.has(0)).toBeFalsy();
  expect(set.has(1)).toBeTruthy();
  expect(set.has(2)).toBeFalsy();
  set.remove(30);
  expect(set.has(30)).toBeFalsy();
});

it('one length range', () => {
  const nums = [1, 5, 2, 4, 8, 2, 34, 6, 1, 4573];
  for (const num of nums) {
    expect(new BitSet().add(num).getLongArray()).toEqual(
      new BitSet().addRange(num, num).getLongArray(),
    );
  }
});

it('addRange and removeRange', () => {
  const set = new BitSet();
  set.addRange(1, 5);
  expect(set.getRange(1, 5).getLongArray()).toEqual([0b11111n]);
  set.removeRange(3, 4);
  expect(set.getRange(1, 5).getLongArray()).toEqual([0b10011n]);
});

describe('toLongArray', () => {
  // https://www.geeksforgeeks.org/bitset-tolongarray-method-in-java-with-examples/
  it('geeksforgeeks 1', () => {
    const set = new BitSet();
    set.add(10);
    set.add(20);
    set.add(30);
    set.add(40);
    set.add(50);
    expect(set.getLongArray()).toEqual([1127000493261824n]);
  });

  it('geeksforgeeks 2', () => {
    const set = new BitSet();
    set.add(48);
    set.add(64);
    set.add(15);
    set.add(95);
    set.add(105);
    set.add(21);
    expect(set.getLongArray()).toEqual([281474978840576n, 2201170739201n]);
  });
});
