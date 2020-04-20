import { Duplex } from 'stream'

export default class PacketSerializer extends Duplex {
  private reading: boolean;

  constructor () {
    super()
    this.reading = false // whether we can currently push data
  }

  /**
   * Handles incoming packets and serializes them
   */
  _write (chunk: any, encoding: string, callback: (error?: (Error | null)) => void): void {
  }
}
