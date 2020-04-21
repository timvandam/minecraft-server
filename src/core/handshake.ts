import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'
import { status } from '../config'

/**
 * Handles handshake and status
 */
export default function handshake (user: EventEmitter) {
  user.on('handshake', (
    client: MinecraftClient,
    protocolVersion: number,
    address: string,
    port: number,
    nextState: number): void => {
    client.state = nextState
  })

  user.on('status', (client: MinecraftClient): void => {
    const json = JSON.stringify(status)
    client.write({
      packetId: 0,
      data: [json]
    })
  })

  user.on('ping', (client: MinecraftClient, num: bigint): void => {
    client.write({
      packetId: 1,
      data: [num]
    })
  })
}
