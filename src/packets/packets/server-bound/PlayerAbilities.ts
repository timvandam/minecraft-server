import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export class PlayerAbilities extends createPacket(
  0x19,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly fly: boolean) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): PlayerAbilities {
    const reader = new BufferReader(buf);
    const bits = reader.readUByte();
    return new PlayerAbilities((bits & 0x02) !== 0);
  }
}
