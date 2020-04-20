import { Writable } from 'stream'
import VarInt from '../DataTypes/VarInt'
import { ESocketState } from '../enums/ESocketState'
import { packets, Packet } from './packets'
import { DataType } from '../DataTypes/DataType'

export default class PacketReader extends Writable {
  // The state of the connected socket
  private state: ESocketState = ESocketState.HANDSHAKING

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
    const packetData: Packet = (await packets)?.[this.state]?.[packetId.value]
    if (packetData === undefined) return callback(new Error('No known packet structure for the received packet'))

    const { name, struct } = packetData
    const data: any[] = []

    // Read the data in this packet
    for (const DT of struct) {
      const value: DataType<any> = new DT(packet)
      data.push(value.value)
      packet = packet.slice(value.buffer.length)
    }

    // Emit this packet
    this.emit(name, data)
    callback()
  }
}
