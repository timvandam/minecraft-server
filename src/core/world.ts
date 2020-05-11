import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'
import { EBossBarColor } from '../enums/EBossBarColor'
import { EBossBarDivision } from '../enums/EBossBarDivision'
import logger from '../logger'

/**
 * Computes the coordinates of nearby chunks given the initial coordinate and render distance.
 *
 * `x` and `z` are block coordinates.
 */
function getNearbyChunks (x: number, z: number, renderDistance: number): number[][] {
  const coordinates: number[][] = []

  for (let dx = -renderDistance; dx < renderDistance + 1; dx++) {
    for (let dz = -renderDistance; dz < renderDistance + 1; dz++) {
      coordinates.push([x + dx * 16, z + dz * 16])
    }
  }

  return coordinates
}

/**
 * Handles chunk loading, unloading and world modifications
 */
// TODO: Tick system. Somehow synchonize this across instances (cluster)
// TODO: Chunk unloading (only nearbyChunks)
export default function world (user: EventEmitter, client: MinecraftClient) {
  // TODO: Make this better
  client.storage.on('position', async ([x, y, z]: number[]) => {
    // Send chunk 0, 0 position as sample)
    // Player position
    const chunkX = Math.floor(x / 16)
    const chunkZ = Math.floor(z / 16)
    client.send.updateViewPosition(chunkX, chunkZ)
    // Send chunk
    if (!client.chunks.size) await client.send.playerPositionAndLook(x, y, z, 0, 0, 0, 0)
    // TODO: Use render distance for this

    const { renderDistance = 10 } = await client.get('renderDistance') as Record<string, number>

    const chunkCoords = getNearbyChunks(x, z, renderDistance)
    // TODO: Unload all chunks outside of this range that are in client.chunks
    await Promise.all(chunkCoords.map(([x, z]) => client.send.chunkData(x, z)))
    // logger.info('Chunks sent :)')
  })
}
