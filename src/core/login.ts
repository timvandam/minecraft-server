import { EventEmitter } from 'events'
import crypto from 'crypto'
import MinecraftClient from '../MinecraftClient'
import logger from '../logger'
import { fetchJoinedUser, generateHexDigest } from './auth'
import { ESocketState } from '../enums/ESocketState'
import LString from '../DataTypes/LString'
import { EPlayerAbilityFlag } from '../enums/EPlayerAbilityFlag'

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
export default async function login (user: EventEmitter, client: MinecraftClient) {
  user.on('loginStart', (username: string) => {
    // Request encryption
    crypto.randomBytes(4, (error, verifyToken) => {
      if (error) {
        logger.error(`Could not generate random bytes - ${error.message}`)
        // Disconnect
        client.send.disconnect('&cAn error occurred while initializing encryption. Please try again')
        return
      }
      client.setVerifyToken(verifyToken)
      client.username = username
      client.store({ username })
      client.send.encryptionRequest('', der, verifyToken)
    })
  })

  user.on('encryptionResponse', async (sharedSecret, verifyToken) => {
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
      const username = client.username as string
      const profile = await fetchJoinedUser(username, hexdigest)
      const uuid = profile.id.replace(/(\w{8})(\w{4})(\w{4})(\w{4})(\w{12})/, '$1-$2-$3-$4-$5')
      await client.store({ uuid, username })
      // TODO: Allow different thresholds
      await client.send.setCompression(0)
      client.enableCompression()
      await client.send.loginSuccess(uuid, profile.name)
      client.state = ESocketState.PLAY
      client.send.joinGame(0, 0, 0, 1230981723n, 100, 'default', 32, false, true)
      client.send.pluginMessage('minecraft:brand', new LString({ value: 'tim' }).buffer) // the brand of this server is tim, nice
      const { position = [] } = await client.get('position') as Record<string, number[]>
      const [x = 0, y = 180, z = 0] = position
      client.store({ position: [x, y, z] })
      client.send.playerAbilities(EPlayerAbilityFlag.ALLOW_FLYING | EPlayerAbilityFlag.CREATIVE_MODE, 0.05, 0.1)
      // TODO: Send this to all players
      client.send.addPlayerInfo([{
        uuid,
        properties: [],
        name: profile.name,
        gamemode: 0,
        ping: 0,
        hasDisplayName: true,
        displayName: profile.name
      }])
    } catch (error) {
      logger.error(`Could not check whether ${client.username} has joined - ${error.message}`)
      logger.verbose(error.message)
      client.close()
    }
  })
}
