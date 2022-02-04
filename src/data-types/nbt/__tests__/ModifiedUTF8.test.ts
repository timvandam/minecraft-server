import { deserializeModifiedUtf8, serializeModifiedUtf8 } from '../ModifiedUTF8';

describe('invalid encodings', () => {
  it.each<{ name: string; buf: Buffer }>([
    { name: '0b11111111', buf: Buffer.of(0b11111111) },
    { name: '0b10000000', buf: Buffer.of(0b10000000) },
    {
      name: '0b11101101 0b10101110 0b10111111 0b11101101 0b10111111 0b00000000 (surrogate pair, last byte missing 0b10 prefix)',
      buf: Buffer.of(0b11101101, 0b10101110, 0b10111111, 0b11101101, 0b10111111, 0b00000000),
    },
    { name: '0b00000000 0b10000000', buf: Buffer.of(0b00000000, 0b10000000) },
    { name: '0b11000000', buf: Buffer.of(0b11000000) },
    { name: '0b11100000', buf: Buffer.of(0b11100000) },
    { name: '0b11100000 0b10000000', buf: Buffer.of(0b11100000, 0b10000000) },
    {
      name: '0b11100000 0b10000000 0b10000000 0b10000000',
      buf: Buffer.of(0b11100000, 0b10000000, 0b10000000, 0b10000000),
    },
  ])('$name', ({ buf }) => {
    expect(() => deserializeModifiedUtf8(buf)).toThrow();
  });
});

describe.each<{ category: string; strings: [string, Buffer][] }>([
  {
    category: 'emoji flags',
    strings: [['🇳🇱', Buffer.from('eda0bcedb7b3eda0bcedb7b1', 'hex')]],
  },
  {
    category: 'null',
    strings: [
      ['\u0000', Buffer.from('c080', 'hex')],
      ['\u0000\u0000\u0000', Buffer.from('c080c080c080', 'hex')],
    ],
  },
  {
    category: 'alphanumerical',
    strings: [
      ['a', Buffer.from('61', 'hex')],
      ['b', Buffer.from('62', 'hex')],
      ['c', Buffer.from('63', 'hex')],
      ['d', Buffer.from('64', 'hex')],
      ['e', Buffer.from('65', 'hex')],
      ['f', Buffer.from('66', 'hex')],
      ['g', Buffer.from('67', 'hex')],
      ['h', Buffer.from('68', 'hex')],
      ['i', Buffer.from('69', 'hex')],
      ['j', Buffer.from('6a', 'hex')],
      ['k', Buffer.from('6b', 'hex')],
      ['l', Buffer.from('6c', 'hex')],
      ['m', Buffer.from('6d', 'hex')],
      ['n', Buffer.from('6e', 'hex')],
      ['o', Buffer.from('6f', 'hex')],
      ['p', Buffer.from('70', 'hex')],
      ['q', Buffer.from('71', 'hex')],
      ['r', Buffer.from('72', 'hex')],
      ['s', Buffer.from('73', 'hex')],
      ['t', Buffer.from('74', 'hex')],
      ['u', Buffer.from('75', 'hex')],
      ['v', Buffer.from('76', 'hex')],
      ['w', Buffer.from('77', 'hex')],
      ['x', Buffer.from('78', 'hex')],
      ['y', Buffer.from('79', 'hex')],
      ['z', Buffer.from('7a', 'hex')],
      ['A', Buffer.from('41', 'hex')],
      ['B', Buffer.from('42', 'hex')],
      ['C', Buffer.from('43', 'hex')],
      ['D', Buffer.from('44', 'hex')],
      ['E', Buffer.from('45', 'hex')],
      ['F', Buffer.from('46', 'hex')],
      ['G', Buffer.from('47', 'hex')],
      ['H', Buffer.from('48', 'hex')],
      ['I', Buffer.from('49', 'hex')],
      ['J', Buffer.from('4a', 'hex')],
      ['K', Buffer.from('4b', 'hex')],
      ['L', Buffer.from('4c', 'hex')],
      ['M', Buffer.from('4d', 'hex')],
      ['N', Buffer.from('4e', 'hex')],
      ['O', Buffer.from('4f', 'hex')],
      ['P', Buffer.from('50', 'hex')],
      ['Q', Buffer.from('51', 'hex')],
      ['R', Buffer.from('52', 'hex')],
      ['S', Buffer.from('53', 'hex')],
      ['T', Buffer.from('54', 'hex')],
      ['U', Buffer.from('55', 'hex')],
      ['V', Buffer.from('56', 'hex')],
      ['W', Buffer.from('57', 'hex')],
      ['X', Buffer.from('58', 'hex')],
      ['Y', Buffer.from('59', 'hex')],
      ['Z', Buffer.from('5a', 'hex')],
      ['0', Buffer.from('30', 'hex')],
      ['1', Buffer.from('31', 'hex')],
      ['2', Buffer.from('32', 'hex')],
      ['3', Buffer.from('33', 'hex')],
      ['4', Buffer.from('34', 'hex')],
      ['5', Buffer.from('35', 'hex')],
      ['6', Buffer.from('36', 'hex')],
      ['7', Buffer.from('37', 'hex')],
      ['8', Buffer.from('38', 'hex')],
      ['9', Buffer.from('39', 'hex')],
    ],
  },
  {
    category: 'big chars',
    strings: [
      ['\u10000', Buffer.from('e1808030', 'hex')],
      ['\u10e6d', Buffer.from('e183a664', 'hex')],
      ['\u1d11e', Buffer.from('e1b49165', 'hex')],
      ['\u10ffff', Buffer.from('e183bf6666', 'hex')],
      ['\u0faaaa', Buffer.from('e0beaa6161', 'hex')],
    ],
  },
  {
    category: 'surrogate pairs',
    strings: [
      ['👍', Buffer.from('eda0bdedb18d', 'hex')],
      ['👍🏿', Buffer.from('eda0bdedb18deda0bcedbfbf', 'hex')],
    ],
  },
])('$category', ({ strings }) => {
  for (const [str, buf] of strings) {
    describe(str, () => {
      it('serialize', () => {
        expect(serializeModifiedUtf8(str)).toEqual(buf);
      });

      it('deserialize', () => {
        expect(deserializeModifiedUtf8(buf)).toBe(str);
      });
    });
  }
});
