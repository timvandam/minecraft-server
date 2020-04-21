import { EventEmitter } from 'events'
import handshake from './handshake'
import login from './login'

/**
 * The core of the minecraft server. Without this the server would do nothing...
 */
export default function core (user: EventEmitter) {
  handshake(user)
  login(user)
}
