import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';
import { EntityMetadata } from '../../../data-types/entity-metadata/EntityMetadata';

export class SetEntityMetadata extends createPacket(
  0x4d,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly entityId: number, public readonly entityMetadata: EntityMetadata) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: SetEntityMetadata): Buffer {
    const writer = new BufferWriter();
    writer.writeVarInt(packet.entityId).writeEntityMetadata(packet.entityMetadata);
    return writer.getBuffer();
  }
}
