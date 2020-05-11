import { DataType } from './DataType'
import mask from 'binmask'

const xMask = mask(~0n).msb(26, 64).mask as bigint
const yMask = mask(~0n).lsb(12).mask as bigint
const zMask = mask(~0n).msb(26, 26 + 12).mask as bigint

/**
 * Converts a two's complement bigint into a Number.
 */
function readTwosComplement (number: number, length: number): number {
  // Check if negative
  const negative = ((mask().msb(1, length).mask as number) & number) !== 0

  // Remove sign
  number &= mask().lsb(length - 1).mask as number

  // Calculate number
  return Number(negative ? -((number ^ mask().lsb(length - 1).mask as number) + 1) : number)
}

function writeTwosComplement (number: number, length: number): number {
  const negative = Math.sign(number) === -1 ? 1 : 0
  return (negative << (length - 1)) | (negative ? (~number ^ mask().lsb(length - 1).mask as number) : number)
}

export class Position extends DataType<number[]> {
  protected read (data: Buffer): number[] {
    const long = data.readBigUInt64BE()
    const x = readTwosComplement(Number((long & xMask) >> 38n), 26)
    const y = readTwosComplement(Number(long & yMask), 12)
    const z = readTwosComplement(Number((long & zMask) >> 12n), 26)
    return [x, y, z]
  }

  protected write ([x, y, z]: number[]): Buffer {
    const buf = Buffer.allocUnsafe(8)
    let long = 0n
    long |= BigInt(writeTwosComplement(Math.floor(x), 26)) << 38n
    long |= BigInt(writeTwosComplement(Math.floor(z), 26)) << 12n
    long |= BigInt(writeTwosComplement(Math.floor(y), 12))
    buf.writeBigUInt64BE(long)
    return buf
  }
}
