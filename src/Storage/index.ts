import { EventEmitter } from 'events'
import logger from '../logger'
import { EStorageType } from '../enums/EStorageType'
import mongoose, { Document, Model, Schema } from 'mongoose'

// TODO: Make this configurable
const connected = mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
  useFindAndModify: false
})

// Maps Storage Types with their respective mongoose models
const models: Record<EStorageType, Model<Document>> = {
  [EStorageType.PLAYER]: mongoose.model('player', new Schema({
    username: { type: String, unique: true },
    position: [Schema.Types.Decimal128] // x-y-z
  }, { strict: false })),
  [EStorageType.CHUNK_SECTION]: mongoose.model('chunk_section', new Schema({
    x: Number,
    z: Number,
    y: Number,
    blocks: Buffer // An array of blocks (currently 14 bits/block)
    // TODO: Store biomes somewhere
  }).index({ x: 1, y: 1, z: 1 }))
}

// Create indices
models[EStorageType.PLAYER].createIndexes()
models[EStorageType.CHUNK_SECTION].createIndexes()

/**
 * Storage that will emit events whenever an element is set or unset
 * This will replace the storage used by MinecraftClient
 */
export default class Storage extends EventEmitter {
  private readonly cache = new Map<unknown, Document>()

  constructor (private readonly schema: EStorageType, private useCache = false, private consistent = true) {
    super()
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
   * Adds data pairs to the storage. When non-consistent will emit predicted updated values
   */
  async set (selector: Record<string, unknown>, data: Record<string, unknown>): Promise<void> {
    await connected

    const emit = (data: object): void => {
      for (const [k, v] of Object.entries(data)) {
        this.emit(k, v, selector)
      }
    }

    const record = await models[this.schema].findOne(selector) ?? await new models[this.schema](selector).save()
    const rollback: Record<string, unknown> = {} // create an object that reverses the update given in `data`
    for (const k of Object.keys(data)) {
      rollback[k] = record.get(k) ?? undefined // if no previous data is present, set it to undefined to remove it
    }

    // Emit and update cache if non-consistent
    if (!this.consistent) {
      emit(data)
      if (this.useCache && this.cache.has(selector)) {
        const doc = this.cache.get(selector) as Document
        for (const [k, v] of Object.entries(data)) doc.set(k, v)
      }
    }

    await record?.updateOne(data)
      .then(() => {
        // Update cache. If non-consistent emit new data
        if (this.useCache) this.cache.set(selector, record)
        if (this.consistent) emit(data)
      })
      .catch(() => {
        emit(rollback)
        // Undo changes when it failed
        if (!this.consistent && this.useCache && this.cache.has(selector)) {
          const doc = this.cache.get(selector) as Document
          for (const [k, v] of Object.entries(rollback)) doc.set(k, v)
        }
      })
  }

  /**
   * Gets a value or multiple values
   */
  async get (selector: object): Promise<Document|undefined> {
    await connected
    const value = this.cache.has(selector)
      ? this.cache.get(selector)
      : await models[this.schema].findOne(selector) ?? undefined
    if (!this.cache.has(selector) && value) this.cache.set(selector, value)
    return value
  }
}
