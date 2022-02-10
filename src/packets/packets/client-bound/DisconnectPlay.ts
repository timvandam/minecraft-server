import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';
import { Chat } from '../../../data-types/Chat';

export class DisconnectPlay extends createPacket(
  0x1a,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly chat: Chat | string) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: DisconnectPlay): Buffer {
    const writer = new BufferWriter();
    writer.writeChat(packet.chat);
    return writer.getBuffer();
  }
}
