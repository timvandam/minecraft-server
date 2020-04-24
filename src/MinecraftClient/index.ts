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
import { Profile } from '../core/auth'
import zlib from 'zlib'
import * as helpers from './helperMethods'

// List of connected clients
export const clients: Set<MinecraftClient> = new Set()

// Interface representing what you can fetch from the client.send proxy
interface PacketMethods {
  [methodName: string]: (...data: any[]) => void;
}

/**
 * Represents a user currently connected to the server. Also acts as a packet serializer
 */
export default class MinecraftClient extends Duplex {
  private readonly socket: Socket
  public state: ESocketState = ESocketState.HANDSHAKING
  public verifyToken: Buffer = Buffer.alloc(0)
  private cipher: Cipher|undefined
  private decipher: Decipher|undefined
  private readonly deserializer: PacketDeserializer = new PacketDeserializer(this)
  public readonly packets: PacketReader = new PacketReader(this)
  public username = ''
  public profile: Profile|undefined
  public uuid = ''
  public compression = false
  // TODO: Provide an object with some convenience methods (e.g. Player Info with action bound)
  public send: PacketMethods = new Proxy<PacketMethods>(helpers ?? {}, {
    get: (target, property: string) => {
      if (target[property]) return target[property].bind(this)
      return (...data: any[]): void => {
        let callback = data.pop()
        if (typeof callback !== 'function') {
          data.push(callback)
          callback = undefined
        }
        this.write({ name: property, data }, callback)
      }
    }
  })

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
      .pipe(this.packets)

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
   * Enables compression
   */
  enableCompression () {
    this.compression = true
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
  private async serializePacket (name: string|undefined, ...data: any[]): Promise<Buffer> {
    /* Packet Structure:
     * Length   - VarInt
     * PacketID - VarInt
     * Data     - ByteArray
     */
    const packetDetails = (await outgoingPackets)?.[this.state]?.[name ?? '']
    if (packetDetails === undefined) throw new Error('Invalid packet name!')

    const { struct, packetId: id } = packetDetails
    const packetId = new VarInt({ value: id })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataArray: DataType<any>[] = []

    for (const DT of struct) {
      if (data.length === 0) throw new Error(`Invalid data (missing a ${DT.name})`)
      dataArray.push(new DT({ value: data.shift() }))
    }

    const dataBuffer = Buffer.concat(dataArray.map(d => d.buffer))
    let packetLength = new VarInt({ value: packetId.buffer.length + dataBuffer.length })

    if (!this.compression) {
      return Buffer.concat([
        packetLength.buffer,
        packetId.buffer,
        dataBuffer
      ])
    }

    return new Promise((resolve, reject) => {
      zlib.deflate(Buffer.concat([packetId.buffer, dataBuffer]), (error, compressed) => {
        if (error) {
          logger.error(`Something went wrong while compressing a packet - ${error.message}`)
          logger.verbose(error.stack ?? 'This error doesnt even have a stack.. WEAK')
          reject(error)
          return
        }
        const dataLength = packetLength
        packetLength = new VarInt({ value: compressed.length + dataLength.buffer.length })
        const packet = Buffer.concat([
          packetLength.buffer,
          dataLength.buffer,
          compressed
        ])
        resolve(packet)
      })
    })
  }

  /**
   * Receives a Packet and pushes a buffer
   */
  async _write (packetData: PacketData, encoding: string, callback: (error?: (Error | null)) => void): Promise<void> {
    try {
      const { name, data } = packetData
      const buffer = await this.serializePacket(name, ...data)

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
        const { name, data } = packetData
        const buffer = await this.serializePacket(name, ...data)

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
