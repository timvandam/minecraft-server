import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'

/**
 * Handles chat
 */
export default function chat (user: EventEmitter, client: MinecraftClient) {
  user.on('chatMessage', (message: string): void => {
    if (message.charAt(0) === '/') {
      const parts = message.split(' ')
      user.emit(`command#${parts.shift()?.slice(1)}`, ...parts)
      // TODO: If no handler say invalid command
      return
    }
  })

  user.on('command#spawn', () => {
    client.send.playerPositionAndLook(0, 180, 0, 0, 0, 0, 0)
  })
}
