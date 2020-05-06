import path from 'path'
import { promises as fs } from 'fs'
import logger from '../logger'

// All loaded chunks
export interface Chunk {
  x: number;
  y: number;
}

// Load from central chunk storage
export async function loadChunk (x: number, y: number): Chunk {
}

/**
 * Create a world with the given name if it does not exist yet
 */
export async function createWorld (name: string, seed?: string) {
}
