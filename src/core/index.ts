import { EventEmitter } from 'events'
import handshake from './handshake'
import login from './login'

export default function core (user: EventEmitter) {
  handshake(user)
  login(user)
}
