import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'
import { EClickStatus } from '../enums/EClickStatus'
import { EBlockFace } from '../enums/EBlockFace'
import { getBlocks } from '../WorldLoader'

/**
 * Computes the coordinates of nearby chunks given the initial coordinate and render distance.
 * The order of the result in a circle around the original chunk starting at the top. Every iteration its radius increases.
 */
const offsets = [[0, 1], [1, 0], [0, -1], [-1, 0]]
function getNearbyChunks (client: MinecraftClient, chunkX: number, chunkZ: number, renderDistance: number): number[][] {
  const maxChunks = (renderDistance + 1) ** 2

  const known: Map<number, Set<number>> = new Map() // x => { z }
  const queue: Set<number[]> = new Set([])
  const result: number[][] = []

  queue.add([chunkX, chunkZ])

  for (const [x, z] of queue) {
    if (!client.hasChunk(x, z)) {
      client.addChunk(x, z)
      result.push([x, z])
    }

    for (const [dx, dz] of offsets) {
      if (queue.size >= maxChunks) break
      const nx = x + dx
      const nz = z + dz
      if (known.get(nx)?.has(nz)) continue
      let set: Set<number> = new Set()
      if (!known.has(nx)) known.set(nx, set)
      else set = known.get(nx) as Set<number>
      set.add(nz)
      queue.add([nx, nz])
    }
  }

  return result
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
    await client.send.updateViewPosition(chunkX, chunkZ)
    // Send chunk
    if (!client.chunks.size) await client.send.playerPositionAndLook(x, y, z, 0, 0, 0, 0)

    const { renderDistance = 10 } = await client.get('renderDistance') as Record<string, number>

    const chunkCoords = getNearbyChunks(client, chunkX, chunkZ, renderDistance)
    // TODO: Unload all chunks outside of this range that are in client.chunks
    for (const [x, z] of chunkCoords) {
      await client.send.chunkData(x, z)
    }
  })

  user.on('playerDigging', async (status: EClickStatus, [x, y, z]: number[], face: EBlockFace) => {
    if (status === EClickStatus.FINISHED_DIGGING) {
      const [block] = await getBlocks([[x, y, z]])
      console.log('broke block', block)
      client.send.acknowledgePlayerDigging([x, y, z], block, status, true)
      client.send.blockChange([x, y, z], 0)
      // TODO: Drop block and update chunk
    }
  })
}
