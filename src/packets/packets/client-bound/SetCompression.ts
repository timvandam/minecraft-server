import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class SetCompression extends createPacket(
  0x03,
  PacketDirection.CLIENT_BOUND,
  ClientState.LOGIN,
) {
  constructor(public readonly threshold: number) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: SetCompression): Buffer {
    return new BufferWriter().writeVarInt(packet.threshold).getBuffer();
  }
}
