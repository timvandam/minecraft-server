import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export class TeleportConfirm extends createPacket(
  0x00,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly teleportId: number) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): TeleportConfirm {
    const reader = new BufferReader(buf);
    return new TeleportConfirm(reader.readVarInt());
  }
}
