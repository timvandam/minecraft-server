/*
This project is structured into a few modules
- Server Storage (Memory Store with server data)
- World Loader (Loads and writes worlds)
- Packet Serializer (Duplex stream. Buffers -> Stream -> Individual packets)
- Packet Reader (Writable EventEmitter that emits packet events). These can be used to write plugins
- Plugin Loader (Loads plugins somehow)
- The core minecraft server (it is a plugin!)
 */

import { Server } from 'net'
import * as config from './config'
import PacketReader from './PacketReader'
import PacketSerializer from './PacketSerializer'
import logger from './logger'

export const server = new Server()

server.on('connection', socket => {
  logger.verbose('Socket connected')
  socket.once('close', () => logger.verbose('Socket disconnected'))
  socket.on('error', error => logger.verbose(`An unexpected socket error occurred - ${error.message}`))
  socket
    .pipe(new PacketSerializer()) // serialize incoming packets
    .pipe(new PacketReader()) // then read them
  // TODO: Attach plugins to PacketReader
})

server.on('error', error => logger.error(`An unexpected server error occurred - ${error.message}`))

server.listen({
  port: config.server.port
}, () => logger.info(`Server listening on port ${config.server.port}`))
