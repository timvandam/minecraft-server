const getBitCount = (num: number): number => Math.max(0, Math.floor(Math.log2(num))) + 1;

/**
 * Takes some bits, and turns it into some other bits (and says how many bits were used, because this can not be determined mathematically if the MSB(s) are 0)
 */
type BitTransformer = (bits: number) => { bits: number; bitCount: number };

const writeByte =
  (prefix: number): BitTransformer =>
  (bits) => {
    const prefixLength = getBitCount(prefix);
    const bitCount = 8 - prefixLength;

    return { bitCount, bits: (prefix << bitCount) | (bits & ((1 << bitCount) - 1)) };
  };

const writeHandlers: { [prefix: number]: BitTransformer[] } = {
  0b0: [writeByte(0b0)],
  0b110: [writeByte(0b110), writeByte(0b10)],
  0b1110: [writeByte(0b1110), writeByte(0b10), writeByte(0b10)],
  0b11101101: [
    writeByte(0b11101101),
    (bits) => writeByte(0b1010)(bits - 1),
    writeByte(0b10),
    writeByte(0b11101101),
    writeByte(0b1011),
    writeByte(0b10),
  ],
};

/**
 * @see {https://docs.oracle.com/javase/specs/jvms/se16/html/jvms-4.html#jvms-4.4.7}
 * @see {https://docs.oracle.com/javase/8/docs/api/java/io/DataInput.html#modified-utf-8}
 */
export function serializeModifiedUtf8(str: string): Buffer {
  const bytes: number[] = [];
  for (const c of str) {
    let codePoint = c.codePointAt(0);

    if (codePoint === undefined) {
      throw new Error(`Undefined codepoint for character '${c}'`);
    }

    let handlers: BitTransformer[] | undefined = undefined;

    if (codePoint >= 0x0001 && codePoint <= 0x007f) handlers = writeHandlers[0b0];
    else if (codePoint <= 0x07ff) handlers = writeHandlers[0b110];
    else if (codePoint <= 0xffff) handlers = writeHandlers[0b1110];
    else if (codePoint <= 0x10ffff) handlers = writeHandlers[0b11101101];
    else throw new Error(`Codepoint out of bounds: ${codePoint}`);

    if (handlers === undefined) {
      throw new Error(`No write handler for codePoint ${codePoint}`);
    }

    const codePointBytes = [];
    for (let i = handlers.length - 1; i >= 0; i--) {
      const { bitCount, bits } = handlers[i](codePoint);
      codePointBytes.unshift(bits);
      codePoint >>>= bitCount;
    }
    bytes.push(...codePointBytes);
  }

  return Buffer.from(bytes);
}

const byteHasPrefix = (byte: number, prefix: number): boolean =>
  byte >> (8 - getBitCount(prefix)) === prefix;

const readByte =
  (prefix: number): BitTransformer =>
  (byte) => {
    if (!byteHasPrefix(byte, prefix)) {
      throw new Error(
        `Expected prefix 0b${prefix.toString(2)}, but received byte 0b${byte.toString(2)}`,
      );
    }

    const prefixLength = getBitCount(prefix);
    const bitCount = 8 - prefixLength;

    return { bitCount, bits: byte & ((1 << bitCount) - 1) };
  };

const readHandlers: { [prefix: number]: BitTransformer[] } = {
  0b0: [readByte(0b0)],
  0b110: [readByte(0b110), readByte(0b10)],
  0b1110: [readByte(0b1110), readByte(0b10), readByte(0b10)],
  /**
   * Prefix 0b11101101 does not need any special treatment for deserialization.
   * This prefix is used for encoding surrogate pairs, which are in short a pair of codepoints which encode for another (larger) codepoint.
   * Hence, surrogate pairs are read as two codepoints (both with the 0b1110 prefix).
   * String.fromCodePoint() understands that these two codepoints encode for a larger one (this is possible since the two units in the pair are in a reserved range)
   */
};

const prefixes: (keyof typeof readHandlers)[] = Object.keys(readHandlers).map(Number);

/**
 * @see {https://docs.oracle.com/javase/specs/jvms/se16/html/jvms-4.html#jvms-4.4.7}
 * @see {https://docs.oracle.com/javase/8/docs/api/java/io/DataInput.html#modified-utf-8}
 */
export function deserializeModifiedUtf8(buf: Buffer): string {
  const codePoints: number[] = [];
  let i = 0;

  while (i < buf.length) {
    const prefix = prefixes.find((p) => byteHasPrefix(buf[i], p));

    if (prefix === undefined) {
      throw new Error(`Invalid prefix for byte 0b${buf[i].toString(2)}`);
    }

    let codePoint = 0;
    const handlers = readHandlers[prefix];
    for (const handler of handlers) {
      const { bitCount, bits } = handler(buf[i]);
      codePoint <<= bitCount;
      codePoint |= bits;
      i++;
    }

    // TODO: Overlong checking (though this is not really needed, as the raw bytes are never used, only the encoded codepoints are relevant)

    codePoints.push(codePoint);
  }

  return String.fromCodePoint(...codePoints);
}
