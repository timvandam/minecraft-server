import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'

export default function movement (user: EventEmitter, client: MinecraftClient) {
  user.on('playerPosition', (x: number, y: number, z: number, onGround: boolean) => {
    // TODO: Instead of removing the listener just do a proper position listener
    // client.storage.removeAllListeners('position')
    client.store({
      position: [x, y, z]
    })
  })
}
