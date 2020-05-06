import { EventEmitter } from 'events'
// TODO: Use mongodb
import { Pool } from 'pg'
import logger from '../logger'
import { EStorageType } from '../enums/EStorageType'

// Database pool to be used
// TODO: Configuration
const pool = new Pool()

pool.on('error', (error) => {
  logger.error(`An unexpected database pool error occurred - ${error.message}`, () => {
    logger.verbose(error.stack ?? 'No error stack found', () => {
      process.exit(1)
    })
  })
})

/**
 * Storage that will emit events whenever an element is set or unset
 * This will replace the storage used by MinecraftClient
 */
export default class Storage extends EventEmitter {
  private readonly cache = new Map<string, unknown>()
  private readonly tableCreated: PromiseLike<unknown>

  constructor (private readonly schema: EStorageType, private useCache = false) {
    super()
    this.tableCreated = pool
      .connect()
      .then(client =>
        client.query(schemas[schema])
          .finally(() => client.release())
      )
  }

  /**
   * Will cache every write
   */
  enableCache () {
    this.useCache = true
  }

  /**
   * Will no longer cache all writes
   */
  disableCache () {
    this.useCache = false
  }

  /**
   * Will remove everything from the cache
   */
  clearCache () {
    this.cache.clear()
  }

  /**
   * Adds n key-value pairs to the storage in one transaction
   */
  async set (data: Record<string, unknown>): Promise<void> {
    const client = await pool.connect()
    for (const [key, value] of Object.entries(data)) {
      // TODO: Try catch
      await client.query('')
      this.cache.set(key, value)
      this.emit(key, value)
    }
  }

  /**
   * Gets a value or multiple values
   */
  async get (...keys: unknown[]): Promise<unknown> {
    if (keys.length === 0) throw new Error('You must provide a key!')
    if (keys.length === 1) return this.cache.get(keys[0])
    return keys.map(key => this.cache.get(key))
  }
}
