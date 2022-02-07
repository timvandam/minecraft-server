import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export class PlayerRotation extends createPacket(
  0x13,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly yaw: number,
    public readonly pitch: number,
    public readonly onGround: boolean,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): PlayerRotation {
    const reader = new BufferReader(buf);
    return new PlayerRotation(reader.readFloat(), reader.readFloat(), reader.readBoolean());
  }
}
