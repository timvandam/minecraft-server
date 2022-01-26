import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class Pong extends createPacket(0x01, PacketDirection.CLIENT_BOUND, ClientState.STATUS) {
  constructor(public readonly num: bigint) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: Pong): Buffer {
    return new BufferWriter().writeLong(packet.num + 321n).getBuffer();
  }
}
