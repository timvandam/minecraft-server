import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import * as Buffer from 'buffer';
import { BufferWriter } from '../../../data-types/BufferWriter';
import { Chat } from '../../../data-types/Chat';

type JsonResponse = {
  version: {
    name: string;
    protocol: number;
  };
  players: {
    max: number;
    online: number;
    sample: Player[];
  };
  description: string | Chat;
  favicon?: string; // PNG base64 string (data:image/png;base64,<data>)
};

type Player = { name: string; id: string };

export class Response extends createPacket(0x00, PacketDirection.CLIENT_BOUND, ClientState.STATUS) {
  constructor(public readonly jsonResponse: JsonResponse) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: Response): Buffer {
    return new BufferWriter().writeString(JSON.stringify(packet.jsonResponse)).getBuffer();
  }
}
