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
  // TODO: Make the storage send events like this again
  client.storage.on('position', async ([x, y, z]: number[]) => {
    // Send chunk 0, 0 position as sample)
    await client.send.updateViewPosition(0, 0)
    // Player position
    await client.send.playerPositionAndLook(x, y, z, 0, 0, 0, 0)
    const uuid = Buffer.allocUnsafe(16).toString('hex')
    let health = 0
    let d = 1
    client.send.addBossBar(uuid, '&bwelcome!', health, EBossBarColor.BLUE, EBossBarDivision.TWELVE, true, true, true)
    setInterval(() => {
      health += d
      if (health === 12 || health === 0) d = -d
      client.send.updateBossBarHealth(uuid, health / 12)
    }, 100)
    // Send chunk
    await client.send.chunkData(x, y, z)
    logger.info('Chunk sent :)')
  })
}
