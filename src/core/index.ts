import { EventEmitter } from 'events'
import { MinecraftClient, SocketState } from '../index'

export default function core (user: EventEmitter) {
  user.on('handshake', (
    socket: MinecraftClient,
    protocolVersion: number,
    address: string,
    port: number,
    nextState: number) => {
    socket[SocketState] = nextState
  })

  user.on('status', (socket: MinecraftClient) => {
  //  TODO: Elaborate MinecraftClient class
  })
}
