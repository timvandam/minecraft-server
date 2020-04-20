import { Writable } from 'stream'
import VarInt from '../DataTypes/VarInt'
import { ESocketState } from '../enums/ESocketState'
import { packets, Packet } from './packets'
import { DataType } from '../DataTypes/DataType'
import { MinecraftClient, SocketState } from '../index'
import logger from '../logger'

export default class PacketReader extends Writable {
  // The connected socket
  public socket: MinecraftClient;

  constructor (socket: MinecraftClient) {
    super()
    this.socket = socket
    this.socket[SocketState] = ESocketState.HANDSHAKING
  }

  /**
   * Reads a packet and emits it with its data
   */
  async _write (packet: Buffer, encoding: string, callback: (error?: (Error | null)) => void): Promise<void> {
    // Read packet length, packet id, packet data
    const packetLength = new VarInt(packet)
    packet = packet.slice(packetLength.buffer.length)

    const packetId = new VarInt(packet)
    packet = packet.slice(packetId.buffer.length)

    // Fetch this packet's structure
    const packetData: Packet = (await packets)?.[this.socket[SocketState]]?.[packetId.value]
    if (packetData === undefined) {
      logger.warn(`Received unknown packet with ID ${packetId.value} (state=${this.socket[SocketState]})`)
      return callback(new Error('No known packet structure for the received packet'))
    }

    const { name, struct } = packetData
    const data: any[] = [this.socket] // we also send the socket to plugins

    // Read the data in this packet
    for (const DT of struct) {
      if (packet.length === 0) {
        logger.warn(`Packet with ID ${packetId.value} was too short (state=${this.socket[SocketState]})`)
        break
      }
      const value: DataType<any> = new DT(packet)
      data.push(value.value)
      packet = packet.slice(value.buffer.length)
    }

    // Emit this packet
    this.emit(name, ...data)
    callback()
  }
}
