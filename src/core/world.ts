import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'
import { EBossBarColor } from '../enums/EBossBarColor'
import { EBossBarDivision } from '../enums/EBossBarDivision'
import logger from '../logger'

/**
 * Handles chunk loading, unloading and world modifications
 */
// TODO: Tick system. Somehow synchonize this across instances (cluster)
export default function world (user: EventEmitter, client: MinecraftClient) {
  // TODO: Make this better
  client.storage.on('position', async ([x, y, z]: number[]) => {
    // Send chunk 0, 0 position as sample)
    // await client.send.updateViewPosition(0, 0)
    // Player position
    // Send chunk
    if (!client.chunks.size) await client.send.playerPositionAndLook(x, y, z, 0, 0, 0, 0)
    await Promise.all([
      client.send.chunkData(x, z),
      client.send.chunkData(x, z + 16),
      client.send.chunkData(x, z - 16),
      client.send.chunkData(x + 16, z + 16),
      client.send.chunkData(x - 16, z + 16),
      client.send.chunkData(x + 16, z - 16),
      client.send.chunkData(x - 16, z - 16),
      client.send.chunkData(x + 16, z),
      client.send.chunkData(x - 16, z)]
    )
    logger.info('Chunk sent :)')
  })
}
