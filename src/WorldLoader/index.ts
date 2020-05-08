import Storage from '../Storage'
import { EStorageType } from '../enums/EStorageType'
import { Document } from 'mongoose'

// Chunk storage without caching (it's expensive for chunks!)
const chunkStorage = new Storage(EStorageType.CHUNK_SECTION, false, false)

// Grass chunk
// const str = '00000000001001'.repeat(4096)
// const blocks = Array.from(stringIterator(str, 8)).map(e => {
//   const r = parseInt(e, 2).toString(16)
//   return `${'0'.repeat(2 - r.length)}${r}`
// }).join('')
// chunkStorage.set({ x: 0, y: 10, z: 0 }, { blocks: Buffer.from(blocks, 'hex') })

// TODO: Better block storage in the db
interface ChunkSection {
  blockCount: number;
  bitsPerBlock: number;
  palette: number[][];
  data: bigint[][];
}

interface Chunk {
  x: number;
  z: number;
  // TODO: Heightmap, Biomes, BlockEntities
  bitMask: number;
  sections: ChunkSection[];
}

const BITS_PER_BLOCK = 14

/**
 * Iterates through n-bit sections of a buffer.
 */
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
    blockCount: 0,
    bitsPerBlock: 0,
    palette: [],
    data: []
  }
  const blockBuffer = doc.get('blocks')
  const palette = new Map<number, number>() // maps block # to palette array index
  const blocks = bitIterator(blockBuffer, BITS_PER_BLOCK)
  for (const block of blocks) {
    if (palette.has(block)) continue
    palette.set(block, palette.size)
    section.palette.push([block])
    if (block) section.blockCount++
  }

  section.bitsPerBlock = Math.max(4, Math.floor(Math.log2(section.palette.length)) + 1)

  // First bits because why not
  let blockBits = ''
  for (const block of blocks) {
    const paletteId = (palette.get(block) as number).toString(2)
    blockBits += `${'0'.repeat(section.bitsPerBlock - paletteId.length)}${paletteId}`
  }

  // Then convert blockBits into a BigUint64Array
  const blockLongs = []
  for (let chunk of stringIterator(blockBits, 64)) {
    chunk = `0b${chunk}${'0'.repeat(64 - chunk.length)}`
    // eslint-disable-next-line no-undef
    blockLongs.push(BigInt(chunk))
  }

  section.data = blockLongs.map(long => [long])

  return section
}

// Load from central chunk storage
export async function loadChunk (x: number, z: number): Promise<Chunk> {
  // Fetch all chunk sections
  // TODO: Fetch these better (with a range query)
  // TODO: Dont use x=z=0 anymore
  const sections = await Promise.all(Array(16).fill(0).map((e, y) => chunkStorage.get({ x: 0, y, z: 0 })))

  // Compose a bitmask. 1-bits indicate that a section is present (where LSB: y = 0, MSB: y = 15)
  let bitMask = 0b0
  // Reverse so we start at y = 15 (MSB)
  sections.forEach((section, y) => {
    bitMask |= (section ? 1 : 0) << y // 1 if section is present, 0 otherwise
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
