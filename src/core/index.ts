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
    const json = JSON.stringify({
      version: {
        name: '1.8.7',
        protocol: 47
      },
      players: {
        max: 100,
        online: 5,
        sample: []
      },
      description: {
        text: 'Hello world'
      }
    })
    client.write({
      packetId: 0,
      data: [json]
    })
  })
}
