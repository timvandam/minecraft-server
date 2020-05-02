import { EventEmitter } from 'events'
import crypto from 'crypto'
import MinecraftClient from '../MinecraftClient'
import logger from '../logger'
import { fetchJoinedUser, generateHexDigest } from './auth'
import { ESocketState } from '../enums/ESocketState'

const { RSA_PKCS1_PADDING } = crypto.constants

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 1024 })
const pk = publicKey.export({
  type: 'spki',
  format: 'pem'
})
const der = Buffer.from((pk as string).trim().split('\n').slice(1, -1).join(''), 'base64')

/**
 * Handles login packets
 */
export default async function login (user: EventEmitter) {
  user.on('loginStart', (client: MinecraftClient, username: string) => {
    // Request encryption
    crypto.randomBytes(4, (error, verifyToken) => {
      if (error) {
        logger.error(`Could not generate random bytes - ${error.message}`)
        // Disconnect
        client.send.disconnect('&cAn error occurred while initializing encryption. Please try again')
        return
      }
      client.setVerifyToken(verifyToken)
      client.storage.set('username', username)
      client.send.encryptionRequest('', der, verifyToken)
    })
  })

  user.on('encryptionResponse', async (client: MinecraftClient, sharedSecret, verifyToken) => {
    verifyToken = crypto.privateDecrypt({ key: privateKey, padding: RSA_PKCS1_PADDING }, verifyToken)
    const verified = client.verifyTokenMatches(verifyToken)
    if (!verified) {
      logger.warn('Received an invalid verify token')
      client.close()
      return
    }
    const secret = crypto.privateDecrypt({ key: privateKey, padding: RSA_PKCS1_PADDING }, sharedSecret)
    client.enableEncryption(secret)
    try {
      const hexdigest = generateHexDigest(secret, der)
      const profile = await fetchJoinedUser(client.storage.get('username'), hexdigest)
      const uuid = profile.id.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5')
      await client.storage.set(
        'uuid', uuid,
        'username', profile.name,
        'profile', profile
      )
      // TODO: Allow different thresholds
      await client.send.setCompression(0)
      client.enableCompression()
      await client.send.loginSuccess(uuid, profile.name)
      client.state = ESocketState.PLAY
      client.send.joinGame(0, 0, 0, 1230981723n, 100, 'default', 32, false, true)
      client.send.pluginMessage('minecraft:brand', Buffer.from('tim', 'utf8')) // the brand of this server is tim, nice
      user.emit('sendChunk', client)
      // TODO: Send this to all players
      client.send.addPlayerInfo([{
        uuid,
        properties: [],
        name: profile.name,
        gamemode: 0,
        ping: 0,
        hasDisplayName: true,
        displayName: 'hello'
      }])
    } catch (error) {
      logger.error(`Could not check whether ${await client.storage.get('username')} has joined - ${error.message}`)
      logger.verbose(error.message)
      client.close()
    }
  })
}
