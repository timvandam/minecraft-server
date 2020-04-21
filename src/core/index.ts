import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'
import { status } from '../config'

export default function core (user: EventEmitter) {
  user.on('handshake', (
    client: MinecraftClient,
    protocolVersion: number,
    address: string,
    port: number,
    nextState: number): void => {
    client.state = nextState
  })

  user.on('status', (client: MinecraftClient): void => {
  //  TODO: Elaborate MinecraftClient class
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
