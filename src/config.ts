import { parseChatString } from './DataTypes/Chat'

export const server = {
  port: parseInt(process.env.PORT ?? '25565')
}

export const logger = {
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'verbose'
}

// MinecraftClient uses logger so we must import it after logger export
// eslint-disable-next-line import/first
import { clients } from './MinecraftClient'

export const status = () => {
  const players = Array.from(clients.keys())
    .map(player => ({ name: player.username, id: player.uuid }))
    .filter(client => client.id) // only show logged in users

  return {
    version: {
      name: '1.15.2',
      protocol: 578
    },
    players: {
      max: parseInt(process.env.MAX_PLAYERS ?? '100'),
      online: players.length,
      sample: players
    },
    description: parseChatString(process.env.DESCRIPTION ?? '&a&lHello world && stuff!')
  }
}
