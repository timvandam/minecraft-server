import Storage from '../Storage'
import { EStorageType } from '../enums/EStorageType'

// Chunk storage without caching (it's expensive for chunks!)
const chunkStorage = new Storage(EStorageType.CHUNK_SECTION, false, false)

// Load from central chunk storage
export async function loadChunk (x: number, z: number) {
  // TODO: Compose a Chunk object which includes mask and stuff
}

/**
 * Create a world with the given name if it does not exist yet
 */
export async function createWorld (name: string, seed?: string) {
}
