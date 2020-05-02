import { EventEmitter } from 'events'

/**
 * Handles chunk loading, unloading and world modifications
 */
export default function world (user: EventEmitter) {
  user.on('sendChunk', () => {
    console.log('send chunk')
  })
}
