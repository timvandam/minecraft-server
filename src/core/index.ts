import { EventEmitter } from 'events'
import handshake from './handshake'
import login from './login'
import join from './join'
import world from './world'

/**
 * The core of the minecraft server. Without this the server would do nothing...
 */
export default function core (user: EventEmitter) {
  handshake(user)
  login(user)
  join(user)
  world(user)
}
