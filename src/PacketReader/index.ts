import { Writable } from 'stream'
import VarInt from '../DataTypes/VarInt'
import { packets, Packet } from './packets'
import { DataType } from '../DataTypes/DataType'
import MinecraftClient from '../MinecraftClient'
import logger from '../logger'

export default class PacketReader extends Writable {
  private client: MinecraftClient

  constructor (client: MinecraftClient) {
    super()
    this.client = client
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
    const packetData: Packet = (await packets)?.[this.client.state]?.[packetId.value]
    if (packetData === undefined) {
      logger.warn(`Received unknown packet with ID ${packetId.value} (state=${this.client.state})`)
      return callback(new Error('No known packet structure for the received packet'))
    }

    const { name, struct } = packetData
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = []

    // Read the data in this packet
    for (const DT of struct) {
      if (packet.length === 0) {
        logger.warn(`Packet with ID ${packetId.value} was too short (state=${this.client.state})`)
        break
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const value: DataType<any> = new DT(packet)
      data.push(value.value)
      packet = packet.slice(value.buffer.length)
    }

    // Emit this packet + client + data
    this.emit(name, this.client, ...data)
    callback()
  }
}
