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
import zlib from 'zlib'
import * as helpers from './helperMethods'
import { EventEmitter } from 'events'
import Storage from './Storage'
import LArray from '../DataTypes/LArray'
import { Chunk } from '../WorldLoader'

// TODO: Plugin injection
type Plugin = (packets: EventEmitter, client: MinecraftClient) => void

// List of connected clients
export const clients: Set<MinecraftClient> = new Set()

// Interface representing what you can fetch from the client.send proxy
type PacketMethod = (...data: any[]) => Promise<void>
interface PacketMethods {
  [methodName: string]: PacketMethod;
}

/**
 * Represents a user currently connected to the server. Also acts as a packet serializer
 */
export default class MinecraftClient extends Duplex {
  private readonly socket: Socket
  private readonly deserializer = new PacketDeserializer(this)
  private cipher: Cipher|undefined
  private decipher: Decipher|undefined
  private verifyToken = Buffer.alloc(0)
  private compression = false
  public readonly packets = new PacketReader(this)
  public pluginMessage = new EventEmitter() // emits data whenever a plugin message is received
  public readonly storage = new Storage()
  public state: ESocketState = ESocketState.HANDSHAKING
  // TODO: Provide an object with some convenience methods (e.g. Player Info with action bound)
  public send: PacketMethods = new Proxy<PacketMethods>(helpers ?? {}, {
    get: (target: PacketMethods, property: string): PacketMethod => {
      if (target[property]) return target[property].bind(this)
      return (...data: unknown[]) => this.write({ name: property, data })
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
    core(this.packets, this)

    // TODO: Set up storage
    this.storage.set(
      'chunks', new Set<Chunk>() // References to Chunks
    )

    // Keep track of connected clients
    clients.add(this)
    socket.once('close', () => {
      clients.delete(this)
      this.end() // this should finish the writable
    })
  }

  /**
   * Async version of writable.write (still supports callbacks tho)
   */
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  write (chunk: any, cb?: (error: (Error | null | undefined)) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket.destroyed) return resolve()
      super.write(chunk, (error) => {
        if (cb) cb(error)
        error ? reject(error) : resolve()
      })
    })
  }

  /**
   * Whether the verify token is correct
   */
  verifyTokenMatches (token: Buffer): boolean {
    return this.verifyToken.compare(token) === 0
  }

  /**
   * Sets the client's verify token
   */
  setVerifyToken (token: Buffer): void {
    this.verifyToken = token
  }

  /**
   * Enables compression
   */
  enableCompression (): void {
    this.compression = true
  }

  /**
   * Whether compression is currently in use
   */
  usesCompression (): boolean {
    return this.compression
  }

  /**
   * Creates ciphers and enables encryption
   */
  enableEncryption (secret: Buffer): void {
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
  close (): void {
    this.socket.end()
  }

  /**
   * Transforms a Packet into a buffer
   */
  private async serializePacket (name: string|undefined, ...data: any[]): Promise<Buffer> {
    /* Packet Structure:
     * Length   - VarInt
     * PacketID - VarInt
     * Data     - ByteArray
     */
    const packetDetails = (await outgoingPackets)?.[this.state]?.[name ?? '']
    if (packetDetails === undefined) throw new Error(`Invalid packet name '${name}'`)

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
