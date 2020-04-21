import { Socket } from 'net'
import { ESocketState } from '../enums/ESocketState'
import PacketReader from '../PacketReader'
import PacketDeserializer from '../PacketDeserializer'
import core from '../core'

// List of connected clients
export const clients: Set<MinecraftClient> = new Set()

/**
 * Represents a user currently connected to the server
 */
export default class MinecraftClient {
  private readonly socket: Socket
  public state: ESocketState = ESocketState.HANDSHAKING
  public readonly packets: PacketReader

  constructor (socket: Socket) {
    this.socket = socket
    this.packets = new PacketReader(this)

    // Deserialize incoming packets and emit them with PacketReader
    socket
      .pipe(new PacketDeserializer())
      .pipe(this.packets)

    // Have the core plugin handle incoming packets
    core(this.packets)

    // Keep track of connected clients
    clients.add(this)
    socket.once('close', () => clients.delete(this))
  }
}
