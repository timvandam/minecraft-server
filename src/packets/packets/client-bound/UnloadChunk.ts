import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class UnloadChunk extends createPacket(
  0x1d,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly chunkX: number, public readonly chunkZ: number) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: UnloadChunk): Buffer {
    const writer = new BufferWriter();
    writer.writeInt(packet.chunkX).writeInt(packet.chunkZ);
    return writer.getBuffer();
  }
}
