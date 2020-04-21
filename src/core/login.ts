import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'

export default function login (user: EventEmitter) {
  user.on('loginStart', (client: MinecraftClient) => {
  //  TODO: Login routine
  })
}
