import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class ClientBoundKeepAlive extends createPacket(
  0x21,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly keepAliveId: bigint) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: ClientBoundKeepAlive): Buffer {
    const writer = new BufferWriter();
    writer.writeLong(packet.keepAliveId);
    return writer.getBuffer();
  }
}
