import { createPacket } from '../createPacket';
import { PacketDirection } from '../PacketDirection';
import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { BufferReader } from '../../../data-types';

export class PlayerPosition extends createPacket(
  0x11,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly onGround: boolean,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buffer: Buffer): PlayerPosition {
    const reader = new BufferReader(buffer);
    return new PlayerPosition(
      reader.readDouble(),
      reader.readDouble(),
      reader.readDouble(),
      reader.readBoolean(),
    );
  }
}
