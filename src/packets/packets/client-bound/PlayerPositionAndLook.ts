import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class PlayerPositionAndLook extends createPacket(
  0x38,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly yaw: number,
    public readonly pitch: number,
    public readonly xRelative: boolean,
    public readonly yRelative: boolean,
    public readonly zRelative: boolean,
    public readonly yawRelative: boolean,
    public readonly pitchRelative: boolean,
    public readonly teleportId: number,
    public readonly dismountVehicle: boolean,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: PlayerPositionAndLook): Buffer {
    const writer = new BufferWriter();
    writer
      .writeDouble(packet.x)
      .writeDouble(packet.y)
      .writeDouble(packet.z)
      .writeFloat(packet.yaw)
      .writeFloat(packet.pitch)
      .writeUByte(
        (+packet.xRelative << 0) |
          (+packet.yRelative << 1) |
          (+packet.zRelative << 2) |
          (+packet.pitchRelative << 3) |
          (+packet.yawRelative << 4),
      )
      .writeVarInt(packet.teleportId)
      .writeBoolean(packet.dismountVehicle);
    return writer.getBuffer();
  }
}
