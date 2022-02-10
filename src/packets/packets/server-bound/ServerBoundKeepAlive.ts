import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export class ServerBoundKeepAlive extends createPacket(
  0x0f,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly keepAliveId: bigint) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): ServerBoundKeepAlive {
    const reader = new BufferReader(buf);
    return new ServerBoundKeepAlive(reader.readLong());
  }
}
