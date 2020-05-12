import Storage from '../Storage'
import { EStorageType } from '../enums/EStorageType'
import { Document } from 'mongoose'
import VarInt from '../DataTypes/VarInt'

// Chunk storage without caching (it's expensive for chunks!)
const chunkStorage = new Storage(EStorageType.CHUNK_SECTION, false, false)

// TODO: generateChunk method
// chunkStorage.set({ x: 0, y: 10, z: 0 }, {
//   blockCount: 4096,
//   bitsPerBlock: 4,
//   palette: Buffer.concat([new VarInt({ value: 1 }).buffer, new VarInt({ value: 9 }).buffer]), // length = 1, block = grass
//   blocks: Buffer.alloc(256) // 4096 * 4 bits = 256 bytes
// })

// TODO: Support no palettes
interface ChunkSection {
  blockCount: number;
  bitsPerBlock: number;
  palette: Buffer;
  data: Buffer;
}

interface Chunk {
  x: number;
  z: number;
  bitMask: number;
  sections: ChunkSection[];
}

const BITS_PER_BLOCK = 14

/**
 * Iterates through n-bit sections of a buffer.
 */
// TODO: Don't rely on strings bruh
function * bitIterator (buf: Buffer, bitsPerBlock: number) {
  const bytes = Array.from(buf.values())
  const bits = bytes.map(num => {
    const binary = num.toString(2)
    return `${'0'.repeat(8 - binary.length)}${binary}`
  }).join('')
  const grouped = bits.matchAll(new RegExp(`[01]{${bitsPerBlock}}`, 'g'))
  for (const group of grouped) {
    yield parseInt(group[0], 2)
  }
}

/**
 * Iterates through a string per n chars. Will yield the last chunk even if its not big enough
 */
function * stringIterator (str: string, charsPerChunk: number) {
  while (str.length) {
    yield str.slice(0, charsPerChunk)
    str = str.slice(charsPerChunk)
  }
}

/**
 * Converts a Chunk Section from the database into a ChunkSection object
 */
function createChunkSection (doc: Document): ChunkSection {
  const section: ChunkSection = {
    blockCount: doc.get('blockCount') as number,
    bitsPerBlock: doc.get('bitsPerBlock') as number,
    palette: doc.get('palette') as Buffer,
    data: doc.get('blocks') as Buffer
  }

  return section
}

// Load from central chunk storage
export async function loadChunk (x: number, z: number): Promise<Chunk> {
  // Fetch all chunk sections
  // TODO: Fetch these better (with a range query)
  const sections = await Promise.all(Array(16).fill(0).map((e, y) => chunkStorage.get({ x, y, z })))

  // Compose a bitmask. 1-bits indicate that a section is present (where LSB: y = 0, MSB: y = 15)
  let bitMask = 0b0
  // Reverse so we start at y = 15 (MSB)
  sections.forEach((section) => {
    const y = section?.get('y') ?? -1
    bitMask |= 1 << y // if section is not present, will resolve to 0
  })

  // Transform sections into ChunkSection objects
  const chunkSections: ChunkSection[] = (sections.filter(e => e !== undefined) as Document[])
    .map(createChunkSection)

  return {
    x,
    z,
    bitMask,
    sections: chunkSections
  }
}

/**
 * Create a world with the given name if it does not exist yet
 */
export async function createWorld (name: string, seed?: string) {
}
