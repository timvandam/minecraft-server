import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export enum EEntityAction {
  START_SNEAKING = 0,
  STOP_SNEAKING = 1,
  LEAVE_BED = 2,
  START_SPRINTING = 3,
  STOP_SPRINTING = 4,
  START_HORSE_JUMP = 5,
  STOP_HORSE_JUMP = 6,
  OPEN_HORSE_INVENTORY = 7,
  START_ELYTRA_FLYING = 8,
}

export class EntityAction extends createPacket(
  0x1b,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly entityId: number,
    public readonly actionId: EEntityAction,
    public readonly jumpBoost: number,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): EntityAction {
    const reader = new BufferReader(buf);
    const entityId = reader.readVarInt();
    const actionId = reader.readVarInt();

    if (!Object.values(EEntityAction).includes(actionId)) {
      throw new Error(`Invalid entity action ${actionId}`);
    }

    const jumpBoost = reader.readVarInt();
    return new EntityAction(entityId, actionId, jumpBoost);
  }
}
