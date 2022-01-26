import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';

export class Request extends createPacket(0x00, PacketDirection.SERVER_BOUND, ClientState.STATUS) {
  constructor() {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(): Request {
    return new Request();
  }
}
