import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types';

export class EncryptionResponse extends createPacket(
  0x01,
  PacketDirection.SERVER_BOUND,
  ClientState.LOGIN,
) {
  constructor(public readonly sharedSecret: Buffer, public readonly verityToken: Buffer) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): EncryptionResponse {
    const reader = new BufferReader(buf);
    return new EncryptionResponse(reader.readVarIntLenByteArray(), reader.readVarIntLenByteArray());
  }
}
