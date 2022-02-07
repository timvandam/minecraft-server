import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export enum Hand {
  MAIN_HAND = 0,
  OFF_HAND = 1,
}

export class Animation extends createPacket(0x2c, PacketDirection.SERVER_BOUND, ClientState.PLAY) {
  constructor(public readonly hand: Hand) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): Animation {
    const reader = new BufferReader(buf);
    const hand = reader.readVarInt();
    if (!Object.values(Hand).includes(hand)) {
      throw new Error(`Invalid hand: ${hand}`);
    }
    return new Animation(hand);
  }
}
