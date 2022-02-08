import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class UpdateViewPosition extends createPacket(
  0x49,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly chunkX: number, public readonly chunkZ: number) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: UpdateViewPosition): Buffer {
    const writer = new BufferWriter();
    writer.writeVarInt(packet.chunkX).writeVarInt(packet.chunkZ);
    return writer.getBuffer();
  }
}
