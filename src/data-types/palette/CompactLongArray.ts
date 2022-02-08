const LONG_BIT_LENGTH = 64;
const LONG_BYTE_LENGTH = 8;

/**
 * Paletted container. Uses unsigned longs (64 bits) to write buffers
 */
export class CompactLongArray {
  protected readonly data: bigint[] = [];
  protected elementSizeAvailable = 0;

  get length() {
    return this.data.length;
  }

  constructor(public readonly bitsPerEntry: number, public readonly canCrossBorders: boolean) {
    if (bitsPerEntry > 32) {
      throw new Error('Bits per entry above 32 is not supported - JS bitwise use 32 bits');
    }
  }

  addData(num: number) {
    let bitsRemaining = this.bitsPerEntry;

    while (bitsRemaining > 0) {
      if (this.elementSizeAvailable < 0) {
        throw new Error(
          `Negative amount of bits available in this element (${this.elementSizeAvailable}). This should not be possible!`,
        );
      }

      // If we can't fit the current number, pad the current long and create the next one
      if (
        this.data.length > 0 &&
        !this.canCrossBorders &&
        bitsRemaining > this.elementSizeAvailable
      ) {
        this.data[this.data.length - 1] <<= BigInt(this.elementSizeAvailable);
        this.elementSizeAvailable = 0;
      }

      // Create a new long if needed
      if (this.elementSizeAvailable === 0) {
        this.data.push(0n);
        this.elementSizeAvailable = LONG_BIT_LENGTH;
      }

      // Select the max amount of bits from the number and add it to the current long
      const bitCount = Math.min(this.elementSizeAvailable, bitsRemaining);
      const rightPaddingLength = BigInt(bitsRemaining - bitCount);
      const mask = ((1n << BigInt(bitCount)) - 1n) << rightPaddingLength;
      this.data[this.data.length - 1] <<= BigInt(bitCount);
      this.data[this.data.length - 1] |= (mask & BigInt(num)) >> rightPaddingLength;

      bitsRemaining -= bitCount;
      this.elementSizeAvailable -= bitCount;
    }
  }

  getLongArray(): bigint[] {
    if (this.data.length === 0) return [];

    const longArray = [...this.data];
    longArray[longArray.length - 1] <<= BigInt(this.elementSizeAvailable);
    return longArray;
  }

  getBuffer(): Buffer {
    if (this.data.length === 0) {
      return Buffer.allocUnsafe(0);
    }

    const longArray = this.getLongArray();
    const buf = Buffer.allocUnsafe(longArray.length * LONG_BYTE_LENGTH);
    for (let i = 0; i < longArray.length; i++) {
      buf.writeBigUInt64BE(longArray[i], LONG_BYTE_LENGTH * i);
    }

    return buf;
  }
}
