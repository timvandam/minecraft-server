import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class LoginSuccess extends createPacket(
  0x02,
  PacketDirection.CLIENT_BOUND,
  ClientState.LOGIN,
) {
  constructor(public readonly uuid: Buffer, public readonly user: string) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: LoginSuccess): Buffer {
    return new BufferWriter().writeUuid(packet.uuid).writeString(packet.user).getBuffer();
  }
}
