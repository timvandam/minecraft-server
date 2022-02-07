import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export class PlayerMovement extends createPacket(
  0x14,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly onGround: boolean) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): PlayerMovement {
    const reader = new BufferReader(buf);
    return new PlayerMovement(reader.readBoolean());
  }
}
