import { EventHandler } from 'decorator-events';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { SetCompression } from '../../packets/packets/client-bound/SetCompression';
import { LoginSuccess } from '../../packets/packets/client-bound/LoginSuccess';
import { ClientState } from '../../packets/ClientState';
import { v3 as uuid } from 'uuid';
import { Disconnect } from '../../packets/packets/client-bound/Disconnect';
import { chat } from '../../data-types/Chat';

export class LoginListener {
  @EventHandler
  async loginStart(packet: LoginStart) {
    console.log('loginstart by', packet.username);

    packet.client.write(new Disconnect(chat.red`${chat.bold`Work in progress!`} Come back later`));
    return;

    // packet.client.write(new EncryptionRequest());
    await packet.client.write(new SetCompression(1));
    packet.client.compressionThreshold = 1;

    // TODO: Store in the client
    const userUuid = uuid(`OfflinePlayer:${packet.username}`, Buffer.alloc(16), Buffer.alloc(16));
    await packet.client.write(new LoginSuccess(userUuid, packet.username));
    packet.client.state = ClientState.PLAY;
  }
}
