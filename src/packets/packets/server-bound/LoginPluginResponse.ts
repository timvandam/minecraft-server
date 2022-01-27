import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types';

export class LoginPluginResponse extends createPacket(
  0x02,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly messageId: number,
    public readonly successful: boolean,
    public readonly data: Buffer,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buffer: Buffer): LoginPluginResponse {
    const reader = new BufferReader(buffer);
    return new LoginPluginResponse(reader.readVarInt(), reader.readBoolean(), reader.buffer);
  }
}
