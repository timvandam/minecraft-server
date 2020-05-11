import { EventEmitter } from 'events'
import handshake from './handshake'
import login from './login'
import join from './join'
import world from './world'
import MinecraftClient from '../MinecraftClient'
import movement from './movement'
import chat from './chat'

/**
 * The core of the minecraft server. Without this the server would do nothing...
 */
export default function core (...args: [EventEmitter, MinecraftClient]) {
  handshake(...args)
  login(...args)
  join(...args)
  world(...args)
  movement(...args)
  chat(...args)
}
