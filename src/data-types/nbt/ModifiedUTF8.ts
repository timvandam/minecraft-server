const getBitCount = (num: number): number => Math.max(0, Math.floor(Math.log2(num))) + 1;

const unitPrefixes = {
  0b0: [0b0],
  0b110: [0b110, 0b10],
  0b1110: [0b1110, 0b10, 0b10],
  0b11101101: [0b11101101, 0b1010, 0b10, 0b11101101, 0b1011, 0b10],
} as const;

type WritePrefixes = 0b0 | 0b110 | 0b1110 | 0b11101101;

/**
 * Prefix 0b11101101 does not need any special treatment for deserialization.
 * This prefix is used for encoding surrogate pairs, which are pairs of codepoints which encode for another (larger) codepoint.
 * Surrogate pairs are read as two codepoints.
 * String.fromCodePoint() understands that these two codepoints encode for a larger singular codepoint (this is possible since the two units in the pair are in a reserved range).
 * Hence, we can just read it as two codepoints, no special things needed to.
 */
type ReadPrefixes = Exclude<WritePrefixes, 0b11101101>;

/**
 * @see {@link https://docs.oracle.com/javase/specs/jvms/se16/html/jvms-4.html#jvms-4.4.7}
 * @see {@link https://docs.oracle.com/javase/8/docs/api/java/io/DataInput.html#modified-utf-8}
 */
export function serializeModifiedUtf8(str: string): Buffer {
  const bytes: number[] = [];
  for (const c of str) {
    let codePoint = c.codePointAt(0);

    if (codePoint === undefined) {
      throw new Error(`Undefined codepoint for character '${c}'`);
    }

    let prefix: WritePrefixes;

    if (codePoint >= 0x0001 && codePoint <= 0x007f) {
      prefix = 0b0;
    } else if (codePoint <= 0x07ff) {
      prefix = 0b110;
    } else if (codePoint <= 0xffff) {
      prefix = 0b1110;
    } else if (codePoint <= 0x10ffff) {
      prefix = 0b11101101;
      codePoint -= 0x10000;
    } else {
      throw new Error(`Codepoint out of bounds: ${codePoint}`);
    }

    const codePointBytes = [];
    const prefixes = unitPrefixes[prefix];
    for (let i = prefixes.length - 1; i >= 0; i--) {
      const prefix = prefixes[i];
      const prefixLength = getBitCount(prefix);
      const bitCount = 8 - prefixLength;
      codePointBytes.unshift((prefix << bitCount) | (codePoint & ((1 << bitCount) - 1)));
      codePoint >>>= bitCount;
    }
    bytes.push(...codePointBytes);
  }

  return Buffer.from(bytes);
}

const byteHasPrefix = (byte: number, prefix: number): boolean =>
  byte >> (8 - getBitCount(prefix)) === prefix;

const readPrefixes: ReadPrefixes[] = [0b0, 0b110, 0b1110];

/**
 * @see {@link https://docs.oracle.com/javase/specs/jvms/se16/html/jvms-4.html#jvms-4.4.7}
 * @see {@link https://docs.oracle.com/javase/8/docs/api/java/io/DataInput.html#modified-utf-8}
 */
export function deserializeModifiedUtf8(buf: Buffer): string {
  const codePoints: number[] = [];
  let i = 0;

  while (i < buf.length) {
    const prefix = readPrefixes.find((p) => byteHasPrefix(buf[i], p));

    if (prefix === undefined) {
      throw new Error(`Invalid prefix for byte 0b${buf[i].toString(2)}`);
    }

    let codePoint = 0;
    const prefixes = unitPrefixes[prefix];
    for (const prefix of prefixes) {
      if (!byteHasPrefix(buf[i], prefix)) {
        throw new Error(
          `Expected prefix 0b${prefix.toString(2)}, but received byte 0b${buf[i].toString(2)}`,
        );
      }

      const prefixLength = getBitCount(prefix);
      const bitCount = 8 - prefixLength;
      codePoint <<= bitCount;
      codePoint |= buf[i] & ((1 << bitCount) - 1);
      i++;
    }

    codePoints.push(codePoint);
  }

  return String.fromCodePoint(...codePoints);
}
