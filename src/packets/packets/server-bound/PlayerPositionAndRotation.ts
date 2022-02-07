import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export class PlayerPositionAndRotation extends createPacket(
  0x12,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly yaw: number,
    public readonly pitch: number,
    public readonly onGround: boolean,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): PlayerPositionAndRotation {
    const reader = new BufferReader(buf);
    return new PlayerPositionAndRotation(
      reader.readDouble(),
      reader.readDouble(),
      reader.readDouble(),
      reader.readFloat(),
      reader.readFloat(),
      reader.readBoolean(),
    );
  }
}
