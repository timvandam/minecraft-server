import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class SpawnPlayer extends createPacket(
  0x04,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly entityId: number,
    public readonly playerUuid: Buffer,
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly yaw: number,
    public readonly pitch: number,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: SpawnPlayer): Buffer {
    const writer = new BufferWriter();
    writer
      .writeVarInt(packet.entityId)
      .writeUuid(packet.playerUuid)
      .writeDouble(packet.x)
      .writeDouble(packet.y)
      .writeDouble(packet.z)
      .writeAngle(packet.yaw)
      .writeAngle(packet.pitch);
    return writer.getBuffer();
  }
}
