import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types';

export enum Difficulty {
  PEACEFUL = 0,
  EASY = 1,
  NORMAL = 2,
  HARD = 3,
}

export class SetDifficulty extends createPacket(
  0x02,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly difficulty: Difficulty) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buffer: Buffer): SetDifficulty {
    const reader = new BufferReader(buffer);

    const difficulty = reader.readByte();

    if (!Object.values(Difficulty).includes(difficulty)) {
      throw new Error(`Received invalid difficulty ${difficulty}`);
    }

    return new SetDifficulty(difficulty);
  }
}
