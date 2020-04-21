export const server = {
  port: parseInt(process.env.PORT ?? '25565')
}

export const logger = {
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'verbose'
}

import { clients } from './MinecraftClient'

export const status = {
  version: {
    name: '1.15.2',
    protocol: 578
  },
  players: {
    max: parseInt(process.env.MAX_PLAYERS ?? '100'),
    online: clients.size,
    sample: []
  },
  description: {
    text: process.env.DESCRIPTION ?? 'Hello world!'
  }
}
