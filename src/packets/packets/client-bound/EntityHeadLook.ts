import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class EntityHeadLook extends createPacket(
  0x3e,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly entityId: number, public readonly yaw: number) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: EntityHeadLook): Buffer {
    const writer = new BufferWriter();
    writer.writeVarInt(packet.entityId).writeAngle(packet.yaw);
    return writer.getBuffer();
  }
}
