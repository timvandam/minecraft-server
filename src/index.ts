/*
This project is structured into a few modules
- Server Storage (Memory Store with server data)
- World Loader (Loads and writes worlds)
- Packet (De)Serializer (Duplex stream. Buffers -> Stream -> Individual incoming)
- Packet Reader (Writable EventEmitter that emits packet events). These can be used to write plugins
- Plugin Loader (Loads plugins somehow)
- The core of the minecraft server (it is a plugin!)
 */

import { Server, Socket } from 'net'
import * as config from './config'
import logger from './logger'
import MinecraftClient, { clients } from './MinecraftClient'
import { ESocketState } from './enums/ESocketState'

export const server = new Server()

server.on('connection', (socket: Socket) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const client = new MinecraftClient(socket)
  logger.verbose('Client connected')
  socket.once('close', () => logger.verbose('Client disconnected'))
  socket.on('error', error => logger.verbose(`An unexpected client error occurred - ${error.message}`))
})

server.on('error', error => logger.error(`An unexpected server error occurred - ${error.message}`))

server.listen({
  port: config.server.port
}, () => logger.info(`Server listening on port ${config.server.port}`))

// Send time updates to all players every second
let time = 0n
let d = 20n
// TODO: Per client
setInterval(() => {
  time += d
  const tod = time % 24000n
  clients.forEach((player: MinecraftClient) => {
    if (player.state !== ESocketState.PLAY) return
    player.send.timeUpdate(time, tod)
  })
}, 10)
