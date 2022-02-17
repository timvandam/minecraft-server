import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class DestroyEntities extends createPacket(
  0x3a,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly entityIds: number[]) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: DestroyEntities): Buffer {
    const writer = new BufferWriter();
    writer.writeVarInt(packet.entityIds.length);
    for (const entityId of packet.entityIds) writer.writeVarInt(entityId);
    return writer.getBuffer();
  }
}
