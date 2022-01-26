import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class EncryptionRequest extends createPacket(
  0x01,
  PacketDirection.CLIENT_BOUND,
  ClientState.LOGIN,
) {
  constructor(
    public readonly serverId: string,
    public readonly pubKeyBytes: Buffer,
    public readonly tokenBytes: Buffer,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: EncryptionRequest): Buffer {
    return new BufferWriter()
      .writeString(packet.serverId)
      .writeVarIntLenByteArray(packet.pubKeyBytes)
      .writeVarIntLenByteArray(packet.tokenBytes)
      .getBuffer();
  }
}
