import { Duplex } from 'stream'
import VarInt from '../DataTypes/VarInt'

export default class PacketSerializer extends Duplex {
  // The packet currently being read
  private receivedBytes: Buffer

  // The amount of bytes needed to finish the current packet
  private remainingBytes: number

  // A list of read packets that have not yet been read
  private buffer: Buffer[]

  constructor () {
    super()
    this.receivedBytes = Buffer.allocUnsafe(0)
    this.remainingBytes = 0
    this.buffer = []
  }

  /**
   * Handles incoming packets and serializes them
   */
  _write (chunk: Buffer, encoding: string, callback: (error?: (Error | null)) => void): void {
    /* Packet Format:
    * Length   - VarInt
    * PacketId - VarInt
    * Data     - Buffer
    * */
    // If we are currently still reading a packet, read the amount of bytes it still needs
    if (this.remainingBytes !== 0) {
      const wantedChunk = chunk.slice(0, this.remainingBytes)
      chunk = chunk.slice(this.remainingBytes)
      this.receivedBytes = Buffer.concat([this.receivedBytes, wantedChunk])
      this.remainingBytes -= wantedChunk.length
      // If the packet has been fully read, add it to the buffer
      if (this.remainingBytes === 0) this.addPacket()
    }
    // If the whole buffer has been processed, fire the callback
    if (chunk.length === 0) {
      callback()
      return
    }
    // If there is still data left, read it
    const packetLength = new VarInt(chunk)
    chunk = chunk.slice(packetLength.buffer.length)
    this.receivedBytes = packetLength.buffer
    this.remainingBytes = packetLength.value
    this._write(chunk, encoding, callback)
  }

  /**
   * Adds the current packet to the buffer
   */
  private addPacket (): void {
    this.buffer.push(this.receivedBytes)
    this.receivedBytes = Buffer.allocUnsafe(0)
    this.remainingBytes = 0
  }

  /**
   * Pushes data from the buffer when needed
   */
  _read (): void {
    let reading = true
    while (reading && this.buffer.length) {
      reading = this.push(this.buffer.shift())
    }

    // If the writable stream has finished and the buffer is empty, end the readable stream
    if (this.buffer.length === 0 && this.writableFinished) this.push(null)
  }

  /**
   * Closes the readable stream after the writable stream has finished
   */
  _final (callback: (error?: (Error | null)) => void): void {
    // If the writable stream has finished and the read buffer is empty, also end the readable stream
    if (this.buffer.length === 0) this.push(null)
    callback()
  }
}
