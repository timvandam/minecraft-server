import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class SpawnEntity extends createPacket(
  0x00,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(
    // TODO: Better types
    // TODO: New layer of events
    public readonly entityId: number,
    public readonly objectUuid: Buffer,
    public readonly type: number,
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly pitch: number,
    public readonly yaw: number,
    public readonly data: number,
    public readonly velocityX: number,
    public readonly velocityY: number,
    public readonly velocityZ: number,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: SpawnEntity): Buffer {
    const writer = new BufferWriter();
    writer
      .writeVarInt(packet.entityId)
      .writeUuid(packet.objectUuid)
      .writeVarInt(packet.type)
      .writeDouble(packet.x)
      .writeDouble(packet.y)
      .writeDouble(packet.z)
      .writeAngle(packet.pitch)
      .writeAngle(packet.yaw)
      .writeInt(packet.data)
      .writeShort(packet.velocityX)
      .writeShort(packet.velocityY)
      .writeShort(packet.velocityZ);
    return writer.getBuffer();
  }
}
