import path from 'path'
import { promises as fs } from 'fs'
import logger from '../logger'

const WORLD_PATH = path.resolve(__dirname, '../../world')

/**
 * Create a new world if no world is present
 */
export async function createWorld (seed?: string) {
  try {
    await fs.access(WORLD_PATH)
    logger.debug('World already exists - not creating it again')
    return
  } catch (error) {
    logger.debug(`Could not access world directory - it likely does not exist - creating a new one - ${error.message}`)
    logger.verbose(error.stack)
  }

  try {
    await fs.mkdir(WORLD_PATH)
    await Promise.all([
      fs.mkdir(path.resolve(WORLD_PATH, 'DIM-1', 'region'), { recursive: true }), // nether chunks
      fs.mkdir(path.resolve(WORLD_PATH, 'DIM1', 'region'), { recursive: true }), // end chunks
      fs.mkdir(path.resolve(WORLD_PATH, 'players')),
      fs.mkdir(path.resolve(WORLD_PATH, 'region')) // overworld
    ])
  } catch (error) {
    logger.error(`Could not create world - ${error.message}`)
    logger.verbose(error.stack)
  }
}

createWorld()
