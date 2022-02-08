import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class ClientBoundPluginMessage extends createPacket(
  0x18,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(
    // TODO: Enum | string
    public readonly channel: string,
    public readonly data: Buffer,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: ClientBoundPluginMessage): Buffer {
    const writer = new BufferWriter();
    writer.writeIdentifier(packet.channel).writeBlob(packet.data);
    return writer.getBuffer();
  }
}
