import { Writable } from 'stream'
import VarInt from '../DataTypes/VarInt'
import { ESocketState } from '../enums/ESocketState'

export default class PacketReader extends Writable {
  // The state of the connected socket
  private state: ESocketState = ESocketState.HANDSHAKING

  /**
   * Reads a packet
   */
  _write (packet: Buffer, encoding: string, callback: (error?: (Error | null)) => void): void {
    const packetLength = new VarInt(packet)
    packet = packet.slice(packetLength.buffer.length)
    const packetId = new VarInt(packet)
    packet = packet.slice(packetId.buffer.length)
    const data = packet
    // TODO: read packet
    callback()
  }
}
