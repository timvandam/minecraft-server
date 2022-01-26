import { EventHandler } from 'decorator-events';
import { Handshake } from '../../packets/packets/server-bound/Handshake';
import { Request } from '../../packets/packets/server-bound/Request';
import { Ping } from '../../packets/packets/server-bound/Ping';
import { Response } from '../../packets/packets/client-bound/Response';
import { Pong } from '../../packets/packets/client-bound/Pong';
import { chat } from '../../data-types/Chat';

export class StatusListener {
  @EventHandler
  handshake(packet: Handshake) {
    packet.client.state = packet.nextState;
  }

  @EventHandler
  request(packet: Request) {
    const jsonResponse: Response['jsonResponse'] = {
      version: {
        name: '1.18.1',
        protocol: 757,
      },
      description: chat`${chat.red.obfuscated`A`} ${chat.brightGreen`Node.js`} ${chat.bold
        .blue`TS`} minecraft server ${chat.red.obfuscated`A`}`,
      players: {
        max: 420,
        online: 69,
        sample: [],
      },
    };

    packet.client.write(new Response(jsonResponse));
  }

  @EventHandler
  ping(packet: Ping) {
    packet.client.write(new Pong(packet.num));
  }
}
