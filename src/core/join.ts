import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'
import logger from '../logger'

/**
 * Handles packets sent while joining
 */
export default async function join (user: EventEmitter) {
  user.on('clientSettings', (client: MinecraftClient,
    locale: string,
    renderDistance: number,
    chatMode: number,
    chatColors: boolean,
    skinParts: number,
    mainHand: number) => {
    // TODO: Handle this/store it in the client. Client.setState?
  })

  user.on('pluginMessage', (client: MinecraftClient, channel: string, data: any[]) => {
    // Emit the message to be handled elsewhere
    if (client.pluginMessage.listenerCount(channel) === 0) logger.warn(`Received an unhandled plugin message on channel ${channel}`)
    else client.pluginMessage.emit(channel, data)
  })
}
