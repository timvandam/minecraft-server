import { EventHandler } from 'decorator-events';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { SetCompression } from '../../packets/packets/client-bound/SetCompression';
import { LoginSuccess } from '../../packets/packets/client-bound/LoginSuccess';
import { ClientState } from '../../packets/ClientState';
import { v3 as uuid } from 'uuid';
import { Gamemode, JoinGame } from '../../packets/packets/client-bound/JoinGame';
import { ClientBoundPluginMessage } from '../../packets/packets/client-bound/ClientBoundPluginMessage';

export class LoginListener {
  @EventHandler
  async loginStart(packet: LoginStart) {
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
        Gamemode.SURVIVAL,
        undefined,
        packet.client.server.config.dimensionCodec['minecraft:dimension_type'].value.map(
          ({ name }) => name,
        ), // TODO: better types
        packet.client.dimension.element,
        packet.client.dimension.name,
        123n,
        420,
        16,
        16,
        false,
        true,
        false,
        false,
      ),
    );

    await packet.client.write(
      new ClientBoundPluginMessage(
        'minecraft:brand',
        Buffer.concat([Buffer.of(3), Buffer.from('tim', 'utf8')]),
      ),
    );
  }
}
