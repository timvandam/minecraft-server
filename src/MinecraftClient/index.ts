import { Socket } from 'net'
import { ESocketState } from '../enums/ESocketState'
import PacketReader from '../PacketReader'
import PacketDeserializer from '../PacketDeserializer'
import core from '../core'
import { Duplex } from 'stream'
import { outgoingPackets, PacketData } from '../packets'
import logger from '../logger'
import VarInt from '../DataTypes/VarInt'
import { DataType } from '../DataTypes/DataType'
import { Cipher, createCipheriv, createDecipheriv, Decipher } from 'crypto'
import { EventEmitter } from 'events'
import { Profile } from '../core/auth'

// List of connected clients
export const clients: Set<MinecraftClient> = new Set()

/**
 * Represents a user currently connected to the server. Also acts as a packet serializer
 * @todo compression
 * @todo easy methods for plugins to use
 * @todo write() with packet name instead of id
 */
export default class MinecraftClient extends Duplex {
  private readonly socket: Socket
  public state: ESocketState = ESocketState.HANDSHAKING
  public readonly packets: EventEmitter
  public verifyToken: Buffer = Buffer.alloc(0)
  private cipher: Cipher|undefined
  private decipher: Decipher|undefined
  private deserializer: PacketDeserializer = new PacketDeserializer()
  public username = ''
  public profile: Profile|undefined
  public uuid = ''

  // Whether we can currently push data
  private reading = false

  // Array of buffers still have to be sent
  private buffer: Buffer[] = []

  constructor (socket: Socket) {
    super({ writableObjectMode: true })
    this.socket = socket

    // Send emitted incoming the the socket
    this.packets = this.pipe(socket)
      // Read incoming incoming
      .pipe(this.deserializer)
      .pipe(new PacketReader(this))

    // Have the core plugin handle incoming packets
    core(this.packets)

    // Keep track of connected clients
    clients.add(this)
    socket.once('close', () => {
      clients.delete(this)
      this.end() // this should finish the writable
    })
  }

  /**
   * Creates ciphers and enables encryption
   */
  enableEncryption (secret: Buffer) {
    // Create cipher & decipher
    this.cipher = createCipheriv('AES-128-CFB8', secret, secret)
    this.decipher = createDecipheriv('AES-128-CFB8', secret, secret)
    // Insert decipher
    this.socket.unpipe(this.deserializer)
    this.socket.pipe(this.decipher).pipe(this.deserializer)
    // Insert cipher
    this.unpipe(this.socket)
    this.pipe(this.cipher).pipe(this.socket)
  }

  /**
   * Closes the socket
   */
  close () {
    this.socket.end()
  }

  /**
   * Transforms a Packet into a buffer
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async serializePacket (id: number, ...data: any[]): Promise<Buffer> {
    /* Packet Structure:
     * Length   - VarInt
     * PacketID - VarInt
     * Data     - ByteArray
     */
    const packetDetails = (await outgoingPackets)?.[this.state]?.[id]
    if (packetDetails === undefined) throw new Error('Invalid packet!')

    const { struct } = packetDetails
    const packetId = new VarInt({ value: id })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataArray: DataType<any>[] = []

    for (const DT of struct) {
      if (data.length === 0) throw new Error(`Invalid data (missing a ${DT.name})`)
      dataArray.push(new DT({ value: data.shift() }))
    }

    const dataBuffer = Buffer.concat(dataArray.map(d => d.buffer))
    const packetLength = new VarInt({ value: packetId.buffer.length + dataBuffer.length })

    return Buffer.concat([
      packetLength.buffer,
      packetId.buffer,
      dataBuffer
    ])
  }

  /**
   * Receives a Packet and pushes a buffer
   */
  async _write (packetData: PacketData, encoding: string, callback: (error?: (Error | null)) => void): Promise<void> {
    try {
      const { packetId, data } = packetData
      const buffer = await this.serializePacket(packetId, ...data)

      if (this.reading) this.reading = this.push(buffer)
      else this.buffer.push(buffer)
      callback()
    } catch (error) {
      logger.error(`Could not send packet (state=${this.state}) - ${error.message}`)
      logger.verbose(error.stack)
      callback(error)
    }
  }

  /**
   * Receives multiple packets to push (in one buffer)
   */
  async _writev (chunks: Array<{ chunk: PacketData; encoding: string }>, callback: (error?: (Error | null)) => void): Promise<void> {
    try {
      let result = Buffer.allocUnsafe(0)
      for (const { chunk: packetData } of chunks) {
        const { packetId, data } = packetData
        const buffer = await this.serializePacket(packetId, ...data)

        result = Buffer.concat([result, buffer])
      }
      if (this.reading) this.reading = this.push(result)
      else this.buffer.push(result)
      callback()
    } catch (error) {
      logger.error(`Could not send multiple packets (state=${this.state}) - ${error.message}`)
      logger.verbose(error.stack)
      callback(error)
    }
  }

  /**
   * Clears the buffer and turns on data pushing
   */
  _read (): void {
    this.reading = true
    while (this.reading && this.buffer.length) {
      this.reading = this.push(this.buffer.shift())
    }
  }
}
