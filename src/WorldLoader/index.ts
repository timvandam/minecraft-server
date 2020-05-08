import Storage from '../Storage'
import { EStorageType } from '../enums/EStorageType'

// Chunk storage without caching (it's expensive for chunks!)
const chunkStorage = new Storage(EStorageType.CHUNK_SECTION, false, false)

interface ChunkSection {
  blockCount: number;
  bitsPerBlock: number;
  palette: number[][];
  data: bigint[][];
}

interface Chunk {
  bitMask: number;
  sections: ChunkSection[];
}

// Load from central chunk storage
export async function loadChunk (x: number, z: number): Promise<Chunk> {
  // Convert coordinates to chunk coordinates
  x %= 16
  z %= 16
  // TODO: Compose a Chunk object which includes mask and stuff
  // Fetch all chunk sections
  const sections = await Promise.all(Array(16).fill(0).map((e, y) => chunkStorage.get({ x, y, z })))

  // Compose a bitmask. 1-bits indicate that a section is present (where LSB: y = 0, MSB: y = 15)
  let bitMask = 0b0
  // Reverse so we start at y = 15 (MSB)
  sections.forEach((section, y) => {
    bitMask |= (section ? 1 : 0) << y // 1 if section is present, 0 otherwise
  })

  return {
    bitMask
  }
}

/**
 * Create a world with the given name if it does not exist yet
 */
export async function createWorld (name: string, seed?: string) {
}
