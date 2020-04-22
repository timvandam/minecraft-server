import { EventEmitter } from 'events'
import crypto from 'crypto'
import MinecraftClient from '../MinecraftClient'
import logger from '../logger'

/**
 * Handles login packets
 */
export default function login (user: EventEmitter) {
  user.on('loginStart', (client: MinecraftClient) => {
    // Request encryption
    const serverId = ''
    const pubKey = Buffer.alloc(0)
    crypto.randomBytes(4, (error, buf) => {
      error = { name: 'asd', message: 'hello' }
      if (error) {
        logger.error(`Could not generate random bytes - ${error.message}`)
        // Disconnect
        client.write({
          packetId: 0,
          // TODO: Chat data type that allows for ez colors and stuff
          data: [JSON.stringify({ text: 'Could not start encryption' })]
        })
        return
      }
      const randomBytes = buf
      client.write({
        packetId: 1,
        data: [serverId, pubKey, randomBytes]
      })
    })
  })
}
