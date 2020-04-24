import crypto from 'crypto'
import axios from 'axios'

/**
 * Generate a hex digest from a secret & pubKey
 */
export function generateHexDigest (secret: Buffer, pubKey: Buffer) {
  // The hex digest is the hash made below.
  // However, when this hash is negative (meaning its MSB is 1, as it is in two's complement), instead of leaving it
  // like that, we make it positive and simply put a '-' in front of it. This is a simple process: as you always do
  // with 2's complement you simply flip all bits and add 1

  let hash = crypto.createHash('sha1')
    .update('') // serverId = just an empty string
    .update(secret)
    .update(pubKey)
    .digest()

  // Negative check: check if the most significant bit of the hash is a 1.
  const isNegative = (hash.readUInt8(0) & (0b10000000)) !== 0 // when 0, it is positive

  if (isNegative) {
    // Flip all bits and add one. Start at the right to make sure the carry works
    const inverted = Buffer.allocUnsafe(hash.length)
    let carry = 0
    for (let i = hash.length - 1; i >= 0; i--) {
      let num = (hash.readUInt8(i) ^ 0xff) // a byte XOR a byte of 1's = the inverse of the byte
      if (i === hash.length - 1) num++
      num += carry
      carry = Math.max(0, num - 0xff)
      num = Math.min(0xff, num)
      inverted.writeUInt8(num, i)
    }
    hash = inverted
  }
  let result = hash.toString('hex').replace(/^0+/, '')
  // If the result was negative, add a '-' sign
  if (isNegative) result = `-${result}`

  return result
}

export interface Profile {
  id: string;
  name: string;
  properties: ProfileProperties[];
}

interface ProfileProperties {
  name: string;
  value: string;
  signature: string;
}

/**
 * Fetches a joined user's profile from mojang
 */
export function fetchJoinedUser (username: string, digest: string): Promise<Profile> {
  return axios.get(`https://sessionserver.mojang.com/session/minecraft/hasJoined?username=${username}&serverId=${digest}`)
    .then(response => {
      if (response.status !== 200) return Promise.reject(new Error(`Non-200 status code (${response.status})`))
      return response.data
    })
}
