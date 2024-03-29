import { CompactLongArray } from '../CompactLongArray';

it('one long', () => {
  const container = new CompactLongArray(32, true);
  container.addData(111);
  container.addData(222);
  expect(container.getBuffer()).toEqual(Buffer.from('0000006f000000de', 'hex'));
});

it('two longs', () => {
  const container = new CompactLongArray(32, true);
  container.addData(111);
  container.addData(222);
  container.addData(222);
  container.addData(111);
  expect(container.getBuffer()).toEqual(Buffer.from('0000006f000000de000000de0000006f', 'hex'));
});

it('one and a half longs', () => {
  const container = new CompactLongArray(32, true);
  container.addData(111);
  container.addData(222);
  container.addData(222);
  expect(container.getBuffer()).toEqual(Buffer.from('0000006f000000de000000de00000000', 'hex'));
});

it('half long', () => {
  const container = new CompactLongArray(32, true);
  container.addData(111);
  expect(container.getBuffer()).toEqual(Buffer.from('0000006f00000000', 'hex'));
});

it('border crossing', () => {
  const container = new CompactLongArray(20, true);
  container.addData(0);
  container.addData(0);
  container.addData(0);
  container.addData(0b11110000111100001111);
  expect(container.getBuffer()).toEqual(Buffer.from('000000000000000f0f0f000000000000', 'hex'));
});

it('no border crossing', () => {
  const container = new CompactLongArray(9, false);
  for (let i = 0; i < Math.ceil(64 / 9); i++) {
    container.addData(0b111111111);
  }
  const buf = container.getBuffer();
  expect(buf.length).toEqual(16);
  // 64 / 9 = 7 * 9 bits + 1 bit. This last one is padded as a 0
  expect(buf.readUInt8(7)).toEqual(0b11111110);
});

it('align left', () => {
  const container = new CompactLongArray(1, false, false);
  container.addData(1);
  expect(container.getLongArray()[0]).toBeGreaterThan(1n);
});

it('align right', () => {
  const container = new CompactLongArray(1, false, true);
  container.addData(1);
  expect(container.getLongArray()[0]).toBe(1n);
});

it('add to left', () => {
  const container = new CompactLongArray(2, false, true, false);
  container.addData(1);
  container.addData(2);
  expect(container.getLongArray()[0] & 0b1111n).toEqual(0b1001n);
});

it('add to right', () => {
  const container = new CompactLongArray(2, false, true, true);
  container.addData(1);
  container.addData(2);
  expect(container.getLongArray()[0] & 0b1111n).toEqual(0b0110n);
});

it('add to left, align right', () => {
  const container = new CompactLongArray(5, false, true, false);
  [1, 2, 2, 3, 4, 4, 5, 6, 6, 4, 8, 0, 7, 4, 3, 13, 15, 16, 9, 14, 10, 12, 0, 2].forEach((num) =>
    container.addData(num),
  );
  expect(container.getBuffer()).toEqual(Buffer.from('002086314841884101018A7260F68C87', 'hex'));
});
