import Storage from '../Storage'
import { EStorageType } from '../enums/EStorageType'
import { Document } from 'mongoose'
import VarInt from '../DataTypes/VarInt'
import mask from 'binmask/lib'

// Chunk storage without caching (it's expensive for chunks!)
const chunkStorage = new Storage(EStorageType.CHUNK_SECTION, false, false)

// TODO: generateChunk method
// chunkStorage.set({ x: 0, y: 1, z: 0 }, {
//   blockCount: 4096,
//   bitsPerBlock: 4,
//   palette: Buffer.concat([new VarInt({ value: 4 }).buffer, new VarInt({ value: 1 }).buffer, new VarInt({ value: 9 }).buffer, new VarInt({ value: 2 }).buffer, new VarInt({ value: 4090 }).buffer]),
//   blocks: Buffer.concat([
//     new VarInt({ value: (4096 * 4 / 8) / 8 }).buffer, // amount of longs
//     Buffer.alloc((4096 * 2 / 8), 0x01),
//     Buffer.alloc((4096 * 2 / 8), 0x23)
//   ])
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
  const chunkSections: ChunkSection[] = (sections.filter(e => e) as Document[])
    .map(createChunkSection)

  return {
    x,
    z,
    bitMask,
    sections: chunkSections
  }
}

interface Block {
  id: number;
}

/**
 * Fetches a sequence of bits from a a buffer
 */
function getBits (buf: Buffer, start: number, length: number): number {
  // TODO: Validation
  const byteStart = Math.floor(start / 8)
  const byteEnd = Math.ceil((start + length) / 8)
  const byteLength = byteEnd - byteStart
  const bitLength = 8 * byteLength
  const leadingBits = start - (8 * byteStart)
  const trailingBits = bitLength - leadingBits - length

  const binmask = mask().msb(length, bitLength - leadingBits).mask as number
  const data = buf.readUIntBE(byteStart, byteEnd - byteStart)
  const number = (data & binmask) >> trailingBits

  return number
}

/**
 * Fetches the blocks at a certain location
 */
export async function getBlocks (coordinates: number[][]): Promise<(Block|undefined)[]> {
  // Compute which chunk sections should be fetched
  const chunks = new Map<number, Map<number, Set<number>>>() // x => { z }
  for (const [x, y, z] of coordinates) {
    const chunkX = Math.floor(x / 16)
    const chunkY = Math.floor(y / 16)
    const chunkZ = Math.floor(z / 16)
    if (chunks.get(chunkX)?.get(chunkY)?.has(chunkZ) ?? false) continue
    if (!chunks.has(chunkX)) chunks.set(chunkX, new Map([[chunkY, new Set([chunkZ])]]))
    else {
      const ys = chunks.get(chunkX) as Map<number, Set<number>>
      if (!ys.has(chunkY)) ys.set(y, new Set([z]))
      else (ys.get(y) as Set<number>).add(z)
    }
  }

  // Fetch sections
  const chunkCoords: object[] = []
  for (const [x, ys] of chunks) {
    for (const [y, zs] of ys) {
      for (const z of zs) {
        chunkCoords.push({ x, y, z })
      }
    }
  }

  const sections: Document[] = (await Promise.all(chunkCoords.map(coords => chunkStorage.get(coords)))).filter(e => e) as Document[]

  // Map sections to their chunk coordinates
  const sectionMap: Map<number, Map<number, Map<number, Document>>> = new Map()
  for (const section of sections) {
    const x = section.get('x') as number
    const y = section.get('y') as number
    const z = section.get('z') as number
    if (!sectionMap.has(x)) sectionMap.set(x, new Map([[y, new Map([[z, section]])]]))
    else {
      const ys = sectionMap.get(x) as Map<number, Map<number, Document>>
      if (!ys.has(y)) ys.set(y, new Map([[z, section]]))
      else (ys.get(y) as Map<number, Document>).set(z, section)
    }
  }

  // Fetch blocks
  const result: (Block|undefined)[] = []

  for (const [x, y, z] of coordinates) {
    const chunkX = Math.floor(x / 16)
    const chunkY = Math.floor(y / 16)
    const chunkZ = Math.floor(z / 16)
    const section = sectionMap.get(chunkX)?.get(chunkY)?.get(chunkZ)
    if (!section) {
      result.push(undefined)
      continue
    }
    // The `blocks` buffer is ordered x, z, y. All from 0 up
    let blockIndex = 0

    // Coordinates relative to the chunk's origin
    const relativeX = 16 - (x % 16) - 1
    const relativeY = y % 16
    const relativeZ = z % 16
    blockIndex += relativeX
    blockIndex += 16 * relativeZ
    blockIndex += 16 * 16 * relativeY
    const bitsPerBlock = section.get('bitsPerBlock') as number
    const offset = bitsPerBlock * blockIndex // amount of bits before the block we want
    let blocks = section.get('blocks') as Buffer
    blocks = blocks.slice(new VarInt({ buffer: blocks }).buffer.length) // remove length
    let palette = section.get('palette') as Buffer
    const paletteLength = new VarInt({ buffer: palette })
    palette = palette.slice(paletteLength.buffer.length)
    const paletteIndex = getBits(blocks, offset, bitsPerBlock)
    if (paletteIndex >= paletteLength.value) {
      result.push({ id: 0 }) // if its not in the palette its air!
      continue
    }
    let id = new VarInt({ value: 0 })
    for (let i = -1; i < paletteIndex; i++) {
      id = new VarInt({ buffer: palette })
      palette = palette.slice(id.buffer.length)
    }
    // TODO: Fix paletteIndex, its still wrong af
    result.push({ id: id.value })
  }

  return result
}

/**
 * Create a world with the given name if it does not exist yet
 */
export async function createWorld (name: string, seed?: string) {
}
