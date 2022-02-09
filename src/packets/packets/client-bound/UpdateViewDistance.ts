import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class UpdateViewDistance extends createPacket(
  0x4a,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly viewDistance: number) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: UpdateViewDistance): Buffer {
    const writer = new BufferWriter();
    writer.writeVarInt(packet.viewDistance);
    return writer.getBuffer();
  }
}
