import { EventEmitter } from 'events'
import crypto from 'crypto'
import MinecraftClient from '../MinecraftClient'
import logger from '../logger'
import { fetchJoinedUser, generateHexDigest } from './auth'
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
    // 128 byte/1024-bit DER(ASN.1 x.509) RSA pk
    crypto.randomBytes(4, (error, verifyToken) => {
      if (error) {
        logger.error(`Could not generate random bytes - ${error.message}`)
        // Disconnect
        client.write({
          name: 'loginDisconnect',
          data: ['&cAn error occurred while initializing encryption. Please try again']
        })
        return
      }
      client.verifyToken = verifyToken
      client.username = username
      // TODO: Proxy for sending packets. `client.send.encryptionRequest(data)`
      client.send.encryptionRequest('', der, verifyToken)
      // client.write({
      //   name: 'encryptionRequest',
      //   data: ['', der, verifyToken]
      // })
    })
  })

  user.on('encryptionResponse', async (client: MinecraftClient, sharedSecret, verifyToken) => {
    verifyToken = crypto.privateDecrypt({ key: privateKey, padding: RSA_PKCS1_PADDING }, verifyToken)
    if (verifyToken.compare(client.verifyToken) !== 0) {
      logger.warn('Received an invalid verify token')
      client.close()
      return
    }
    const secret = crypto.privateDecrypt({ key: privateKey, padding: RSA_PKCS1_PADDING }, sharedSecret)
    client.enableEncryption(secret)
    try {
      const hexdigest = generateHexDigest(secret, der)
      const profile = await fetchJoinedUser(client.username, hexdigest)
      client.uuid = profile.id.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5')
      client.username = profile.name
      client.profile = profile
      client.write({
        name: 'loginSuccess',
        data: [client.uuid, client.username]
      })
    } catch (error) {
      logger.error(`Could not check whether ${client.username} has joined - ${error.message}`)
      logger.verbose(error.message)
      client.close()
    }
  })
}
