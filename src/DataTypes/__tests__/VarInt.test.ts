import VarInt from '../VarInt'

describe('write works', () => {
  it('when providing valid values', () => {
    expect(new VarInt({ value: 128 }).buffer).toEqual(Buffer.from('8001', 'hex'))
    expect(new VarInt({ value: 2147483647 }).buffer).toEqual(Buffer.from('ffffffff07', 'hex'))
    expect(new VarInt({ value: -1 }).buffer).toEqual(Buffer.from('ffffffff0f', 'hex'))
  })

  it('when providing invalid values', () => {
    expect(() => new VarInt({ value: 2147483647000 })).toThrow(new Error('Value is out of range'))
    expect(() => new VarInt({ value: -2147483647000 })).toThrow(new Error('Value is out of range'))
  })
})

describe('read works', () => {
  it('when providing valid values', () => {
    expect(new VarInt({ buffer: Buffer.from('ffffffff07', 'hex') }).value).toBe(2147483647)
    expect(new VarInt({ buffer: Buffer.from('8080808008', 'hex') }).value).toBe(-2147483648)
    expect(new VarInt({ buffer: Buffer.from('ffffffff0f', 'hex') }).value).toBe(-1)
    expect(new VarInt({ buffer: Buffer.from('ff01', 'hex') }).value).toBe(255)
  })

  it('when providing too-big values', () => {
    expect(new VarInt({ buffer: Buffer.from('0102', 'hex') }).buffer).toEqual(Buffer.from('01', 'hex'))
  })

  it('when providing invalid values', () => {
    expect(() => new VarInt({ buffer: Buffer.from('ffffffffffff', 'hex') })).toThrow(new Error('VarInt is too big'))
    expect(() => new VarInt({ buffer: Buffer.from('ffffffffffffffffff01', 'hex') })).toThrow(new Error('VarInt is too big'))
  })
})
