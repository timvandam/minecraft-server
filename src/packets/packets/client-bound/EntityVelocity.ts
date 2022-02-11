import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class EntityVelocity extends createPacket(
  0x4f,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly entityId: number,
    public readonly velocityX: number,
    public readonly velocityY: number,
    public readonly velocityZ: number,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: EntityVelocity): Buffer {
    const writer = new BufferWriter();
    writer
      .writeVarInt(packet.entityId)
      .writeShort(packet.velocityX)
      .writeShort(packet.velocityY)
      .writeShort(packet.velocityZ);
    return writer.getBuffer();
  }
}
