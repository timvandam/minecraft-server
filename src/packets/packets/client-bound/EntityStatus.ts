import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

/**
 * @see {@link https://wiki.vg/Entity_statuses}
 */
export enum EEntityStatus {}

export class EntityStatus extends createPacket(
  0x1b,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly entityId: number, public readonly entityStatus: EEntityStatus) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: EntityStatus): Buffer {
    const writer = new BufferWriter();
    writer.writeInt(packet.entityId).writeUByte(packet.entityStatus);
    return writer.getBuffer();
  }
}
