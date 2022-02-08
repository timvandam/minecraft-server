import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class ClientBoundHeldItemChange extends createPacket(
  0x48,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly slot: number) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: ClientBoundHeldItemChange): Buffer {
    const writer = new BufferWriter();
    writer.writeByte(packet.slot);
    return writer.getBuffer();
  }
}
