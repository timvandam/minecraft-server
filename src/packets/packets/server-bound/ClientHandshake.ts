import { ClientState } from '../../ClientState';
import { registerPacket } from '../../PacketRegistry';
import { PacketDirection } from '../../PacketDirection';

// TODO: Program to automatically generate all packets

export class ClientHandshake {
  public static readonly packetId = 0x00;
  public static readonly packetState = ClientState.HANDSHAKING;
  public static readonly packetDirection = PacketDirection.SERVER_BOUND;

  static {
    registerPacket(this);
  }

  // TODO: Eslint allow
  protected constructor() {}

  public static fromBuffer(buffer: Buffer): ClientHandshake {
    // TODO
    return new ClientHandshake();
  }
}
