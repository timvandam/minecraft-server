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
    location: Buffer // X-Y-Z. Double-Double-Double
  }, { strict: false })),
  [EStorageType.CHUNK_SECTION]: mongoose.model('chunk_section', new Schema({
    // TODO: Compound index on x, y, z
    x: Number,
    z: Number,
    y: Number,
    blocks: Buffer // An array of Chunk Sections (like the Chunk Data packet)
    // TODO: Store biomes somewhere
  }).index({ x: 1, z: 1, y: 1 }))
}

// Create indices
models[EStorageType.PLAYER].createIndexes()
models[EStorageType.CHUNK_SECTION].createIndexes()

/**
 * Storage that will emit events whenever an element is set or unset
 * This will replace the storage used by MinecraftClient
 *
 * @todo: make set easier. client.storage.set should automatically use the client's username
 */
export default class Storage extends EventEmitter {
  private readonly cache = new Map<unknown, object>()

  // TODO: Option to pass & update default selector
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
  async set (selector: object, data: object): Promise<void> {
    await connected
    // If consistent: update first, then emit
    if (this.consistent) {
      const updated: object = await models[this.schema].findOneAndUpdate(
        selector,
        data,
        { new: true, lean: true, upsert: true })
      if (this.useCache) this.cache.set(selector, updated)
      this.emit(EStorageType[this.schema], updated)
    } else {
      // If non-consistent: emit predicted if available, update, emit
      const cached = this.useCache && this.cache.has(selector)
        ? this.cache.get(selector)
        : undefined
      if (cached) this.emit(EStorageType[this.schema], { ...cached, data })
      models[this.schema].findOneAndUpdate(
        selector,
        data,
        { new: true, lean: true, upsert: true })
        .then((updated: object) => {
          if (this.useCache) this.cache.set(selector, updated)
          this.emit(EStorageType[this.schema], { ...cached, data })
        })
    }
  }

  /**
   * Gets a value or multiple values
   */
  async get (selector: object): Promise<unknown> {
    await connected
    const value = this.cache.has(selector)
      ? this.cache.get(selector) as object
      : await models[this.schema].find(selector).lean(true).exec()
    if (!this.cache.has(selector)) this.cache.set(selector, value)
    return value
  }
}
