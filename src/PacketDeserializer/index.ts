import { Duplex } from 'stream'
import VarInt from '../DataTypes/VarInt'
import MinecraftClient from '../MinecraftClient'
import zlib from 'zlib'
import logger from '../logger'

export default class PacketDeserializer extends Duplex {
  // The packet currently being read
  private receivedBytes: Buffer = Buffer.allocUnsafe(0)

  // The amount of bytes needed to finish the current packet
  private remainingBytes = 0

  // A list of read incoming that have not yet been read
  private buffer: Buffer[] = []

  // Whether we should push data live
  private reading = false

  private readonly client: MinecraftClient

  constructor (client: MinecraftClient) {
    super()
    this.client = client
  }

  /**
   * Handles incoming incoming and serializes them
   */
  async _write (chunk: Buffer, encoding: string, callback: (error?: (Error | null)) => void): Promise<void> {
    /* Packet Format:
    * Length   - VarInt
    * PacketId - VarInt
    * Data     - Buffer
    *
    * Compressed:
    * Length      - VarInt
    * Data Length - VarInt
    * Compressed PacketID + Data - VarInt & DataArray
    * */
    // If we are currently still reading a packet, read the amount of bytes it still needs
    if (this.remainingBytes !== 0) {
      const wantedChunk = chunk.slice(0, this.remainingBytes)
      chunk = chunk.slice(this.remainingBytes)
      this.receivedBytes = Buffer.concat([this.receivedBytes, wantedChunk])
      this.remainingBytes -= wantedChunk.length
      // If the packet has been fully read, add it to the buffer
      if (this.remainingBytes === 0) await this.addPacket()
    }
    // If the whole buffer has been processed, fire the callback
    if (chunk.length === 0) {
      callback()
      return
    }
    // If there is still data left, read it
    const packetLength = new VarInt({ buffer: chunk })
    chunk = chunk.slice(packetLength.buffer.length)
    this.receivedBytes = packetLength.buffer
    this.remainingBytes = packetLength.value
    await this._write(chunk, encoding, callback)
  }

  /**
   * Adds the current packet to the buffer
   */
  private async addPacket (): Promise<void> {
    try {
      if (this.client.usesCompression()) {
        // Decompress if the packet was compressed
        const packetLength = new VarInt({ buffer: this.receivedBytes })
        const dataLength = new VarInt({ buffer: this.receivedBytes.slice(packetLength.buffer.length) })
        const compressed = this.receivedBytes.slice(packetLength.buffer.length + dataLength.buffer.length)
        const decompressed: Buffer = await new Promise((resolve, reject) =>
          zlib.inflate(compressed, (error, decompressed) =>
            error
              ? reject(error)
              : resolve(decompressed)))
        const newPacketLength = new VarInt({ value: packetLength.value - dataLength.buffer.length })
        this.receivedBytes = Buffer.concat([newPacketLength.buffer, decompressed])
      }

      if (this.reading) this.reading = this.push(this.receivedBytes)
      else this.buffer.push(this.receivedBytes)
    } catch (error) {
      logger.error(`Could not decompress a packet, discarding it - ${error.message}`)
      logger.verbose(error.stack ?? 'No stack found for error')
    } finally {
      this.receivedBytes = Buffer.allocUnsafe(0)
      this.remainingBytes = 0
    }
  }

  /**
   * Pushes data from the buffer when needed
   */
  _read (): void {
    this.reading = true
    while (this.reading && this.buffer.length) {
      this.reading = this.push(this.buffer.shift())
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
