import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types';

export class Handshake extends createPacket(
  0x00,
  PacketDirection.SERVER_BOUND,
  ClientState.HANDSHAKING,
) {
  constructor(
    public readonly protocolVersion: number,
    public readonly serverAddress: string,
    public readonly port: number,
    public readonly nextState: ClientState.STATUS | ClientState.LOGIN,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buffer: Buffer): Handshake {
    const reader = new BufferReader(buffer);

    const protocolVersion = reader.readVarInt();
    const serverAddress = reader.readString();
    const port = reader.readUShort();
    const nextState = reader.readVarInt();

    if (nextState !== ClientState.STATUS && nextState !== ClientState.LOGIN) {
      throw new Error('Incorrect next state');
    }

    return new Handshake(protocolVersion, serverAddress, port, nextState);
  }
}
