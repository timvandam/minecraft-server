import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class ChunkDataAndUpdateLight extends createPacket(
  0x22,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly chunkX: number,
    public readonly chunkY: number,
    public readonly heightmaps: number[],
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  getHeightMapLongArray() {
    const entries = Array.from({ length: 256 }, () => 0);
    // TODO: Make it depend on the current dimension type
    const bitsPerEntry = Math.ceil(Math.log2(this.client.dimension.element.height));
    // TODO: compress(bitsPerElement, ...elements): number[]
    // TODO: compressBigInt(bitsPerElement, ...elements): bigint[]
  }

  static toBuffer(packet: ChunkDataAndUpdateLight): Buffer {
    const writer = new BufferWriter();
    /** TODO: write */
    return writer.getBuffer();
  }
}
