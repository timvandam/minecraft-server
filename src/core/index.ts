import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'

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
  })
}
