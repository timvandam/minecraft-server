import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types';

export class Ping extends createPacket(0x01, PacketDirection.SERVER_BOUND, ClientState.STATUS) {
  constructor(public readonly num: bigint) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buffer: Buffer): Ping {
    const reader = new BufferReader(buffer);
    return new Ping(reader.readLong());
  }
}
