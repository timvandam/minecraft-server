import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'

/**
 * Handles chunk loading, unloading and world modifications
 */
// TODO: Tick system. Somehow synchonize this across instances (cluster)
export default function world (user: EventEmitter, client: MinecraftClient) {
  client.storage.on('position', async () => {
    // Send chunk 0, 0 position as sample
    await client.send.updateViewPosition(0, 0)
    // Player position
    await client.send.playerPositionAndLook(0, 0, 0, 0, 0, 0, 0)
    client.send.addBossBar(Buffer.allocUnsafe(16).toString('hex'), 'welcome x)')
    // Send chunk
  })
}
