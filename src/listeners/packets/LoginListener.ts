import { EventHandler } from 'decorator-events';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { SetCompression } from '../../packets/packets/client-bound/SetCompression';
import { LoginSuccess } from '../../packets/packets/client-bound/LoginSuccess';
import { ClientState } from '../../packets/ClientState';

export class LoginListener {
  @EventHandler
  async loginStart(packet: LoginStart) {
    console.log('loginstart by', packet.username);
    // packet.client.write(new EncryptionRequest());
    await packet.client.write(new SetCompression(1));
    packet.client.compressionThreshold = 1;
    // TODO
    await packet.client.write(new LoginSuccess(123n, packet.username));
    packet.client.state = ClientState.PLAY;
  }
}
