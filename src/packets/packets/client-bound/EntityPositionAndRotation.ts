import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class EntityPositionAndRotation extends createPacket(
  0x2a,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly entityId: number,
    public readonly deltaX: number,
    public readonly deltaY: number,
    public readonly deltaZ: number,
    public readonly yaw: number,
    public readonly pitch: number,
    public readonly onGround: boolean,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: EntityPositionAndRotation): Buffer {
    const writer = new BufferWriter();
    writer
      .writeVarInt(packet.entityId)
      .writeShort(packet.deltaX)
      .writeShort(packet.deltaY)
      .writeShort(packet.deltaZ)
      .writeAngle(packet.yaw) // TODO: writeYaw, writeAngle if needed
      .writeAngle(packet.pitch);
    return writer.getBuffer();
  }
}
