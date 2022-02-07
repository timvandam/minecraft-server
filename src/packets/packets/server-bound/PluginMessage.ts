import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types/BufferReader';

export class PluginMessage extends createPacket(
  0x0a,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly channel: string, public readonly data: Buffer) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): PluginMessage {
    const reader = new BufferReader(buf);
    return new PluginMessage(reader.readIdentifier(), reader.buffer);
  }
}
