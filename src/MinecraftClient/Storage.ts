import { EventEmitter } from 'events'

/**
 * Storage that will emit events whenever an element is set or unset
 * @todo try using redis for this. static methods to get data for all players
 */
export default class Storage extends EventEmitter {
  private _storage = new Map<any, any>()

  /**
   * Adds n key-value pairs to the storage
   */
  set (...data: any[]): void {
    if (data.length % 2 !== 0) throw new Error('You must provide a key and value!')
    for (let i = 0; i < data.length; i += 2) {
      const key = data[i]
      const value = data[i + 1]
      this._storage.set(key, value)
      this.emit(key, value)
    }
  }

  /**
   * Gets a value or multiple values
   */
  get (...keys: unknown[]) {
    if (keys.length === 0) throw new Error('You must provide a key!')
    if (keys.length === 1) return this._storage.get(keys[0])
    return keys.map(key => this._storage.get(key))
  }
}
