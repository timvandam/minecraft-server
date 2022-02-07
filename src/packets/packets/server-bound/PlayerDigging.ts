import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export enum DiggingStatus {
  STARTED_DIGGING = 0,
  CANCELLED_DIGGING = 1,
  FINISHED_DIGGING = 2,
  DROP_ITEM_STACK = 3,
  DROP_ITEM = 4,
  SHOOT_ARROW = 5,
  FINISH_EATING = 5,
  SWAP_ITEM_IN_HAND = 6,
}

export enum BlockFace {
  BOTTOM = 0,
  TOP = 1,
  NORTH = 2,
  SOUTH = 3,
  WEST = 4,
  EAST = 5,
}

export class PlayerDigging extends createPacket(
  0x1a,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly status: DiggingStatus,
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly face: BlockFace,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): PlayerDigging {
    const reader = new BufferReader(buf);
    const status = reader.readVarInt();

    if (!Object.values(DiggingStatus).includes(status)) {
      throw new Error(`Invalid digging status ${status}`);
    }

    const { x, y, z } = reader.readPosition();
    const face = reader.readByte();
    if (!Object.values(BlockFace).includes(face)) {
      throw new Error(`Invalid digging block face ${face}`);
    }

    return new PlayerDigging(status, x, y, z, face);
  }
}
