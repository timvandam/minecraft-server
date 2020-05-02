import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'
import logger from '../logger'

/**
 * Handles packets sent while joining
 */
export default async function join (user: EventEmitter, client: MinecraftClient) {
  user.on('clientSettings', (
    locale: string,
    renderDistance: number,
    chatMode: number,
    chatColors: boolean,
    skinParts: number,
    mainHand: number) => {
    client.storage.set(
      'locale', locale,
      'renderDistance', renderDistance,
      'chatMode', chatMode,
      'chatColors', chatColors,
      'skinParts', skinParts,
      'mainHand', mainHand
    )
  })

  user.on('pluginMessage', (channel: string, data: any[]) => {
    // Emit the message to be handled elsewhere
    if (client.pluginMessage.listenerCount(channel) === 0) logger.warn(`Received an unhandled plugin message on channel ${channel}`)
    else client.pluginMessage.emit(channel, data)
  })
}
