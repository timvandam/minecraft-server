export class BitSet {
  protected bits = 0n;

  static fromLongArray(longs: bigint[]) {
    const bitSet = new BitSet();
    for (let i = longs.length - 1; i >= 0; i--) {
      bitSet.bits <<= 64n;
      bitSet.bits |= longs[i];
    }
    return bitSet;
  }

  getLongArray(): bigint[] {
    let bits = this.bits;
    const longs: bigint[] = [];
    while (bits != 0n) {
      const mask = this.getBitMaskRange(0, 63);
      longs.push(bits & mask);
      bits >>= 64n;
    }
    return longs;
  }

  protected getBitMask(bit: number) {
    return 1n << BigInt(bit);
  }

  protected getBitMaskRange(a: number, b: number) {
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    return ((1n << BigInt(high - low + 1)) - 1n) << BigInt(low);
  }

  add(bit: number): this {
    const bitMask = this.getBitMask(bit);
    this.bits |= bitMask;
    return this;
  }

  /**
   * Adds an inclusive range
   */
  addRange(a: number, b: number): this {
    const low = Math.min(a, b);
    const high = Math.max(a, b);
    this.bits |= ((1n << BigInt(high - low + 1)) - 1n) << BigInt(low);
    return this;
  }

  getRange(a: number, b: number): BitSet {
    const bitMask = this.getBitMaskRange(a, b);
    const set = new BitSet();
    set.bits = (this.bits & bitMask) >> BigInt(Math.min(a, b));
    return set;
  }

  remove(bit: number): this {
    const bitMask = this.getBitMask(bit);
    this.bits &= ~bitMask;
    return this;
  }

  removeRange(a: number, b: number): this {
    const bitMask = this.getBitMaskRange(a, b);
    this.bits &= ~bitMask;
    return this;
  }

  has(bit: number): boolean {
    const bitMask = this.getBitMask(bit);
    return (this.bits & bitMask) != 0n;
  }
}
