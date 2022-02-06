import { EventHandler } from 'decorator-events';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { SetCompression } from '../../packets/packets/client-bound/SetCompression';
import { LoginSuccess } from '../../packets/packets/client-bound/LoginSuccess';
import { ClientState } from '../../packets/ClientState';
import { v3 as uuid } from 'uuid';
import { Gamemode, JoinGame } from '../../packets/packets/client-bound/JoinGame';
import { byte, compound, double, float, int, list } from '../../data-types/nbt';

export class LoginListener {
  @EventHandler
  async loginStart(packet: LoginStart) {
    console.log('loginstart by', packet.username);

    // return packet.client.write(
    //   new Disconnect(chat.red`${chat.bold`Work in progress!`} Come back later`),
    // );

    // packet.client.write(new EncryptionRequest());
    await packet.client.write(new SetCompression(1));
    packet.client.compressionThreshold = 1;

    // TODO: Store in the client
    const userUuid = uuid(`OfflinePlayer:${packet.username}`, Buffer.alloc(16), Buffer.alloc(16));
    await packet.client.write(new LoginSuccess(userUuid, packet.username));
    packet.client.state = ClientState.PLAY;

    await packet.client.write(
      new JoinGame(
        227,
        false,
        Gamemode.CREATIVE,
        undefined,
        ['minecraft:overworld'], // TODO: better types
        // TODO: Don't provide this as compound but just as objects
        packet.client.server.config.dimensionCodec['minecraft:dimension_type'].value[0].element,
        'minecraft:overworld',
        123n,
        420,
        16,
        16,
        false,
        true,
        true,
        false,
      ),
    );
  }
}
