import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';
import { Chat } from '../../../data-types/Chat';

export class Disconnect extends createPacket(
  0x00,
  PacketDirection.CLIENT_BOUND,
  ClientState.LOGIN,
) {
  constructor(public readonly reason: Chat | string) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: Disconnect): Buffer {
    const str = typeof packet.reason === 'string' ? packet.reason : JSON.stringify(packet.reason);
    return new BufferWriter().writeString(str).getBuffer();
  }
}
