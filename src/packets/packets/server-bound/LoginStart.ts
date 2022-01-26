import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types';

export class LoginStart extends createPacket(
  0x00,
  PacketDirection.SERVER_BOUND,
  ClientState.LOGIN,
) {
  constructor(public readonly username: string) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buffer: Buffer): LoginStart {
    const reader = new BufferReader(buffer);
    return new LoginStart(reader.readString());
  }
}
