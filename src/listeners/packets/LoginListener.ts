import { EventHandler, EventPriority } from 'decorator-events';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { SetCompression } from '../../packets/packets/client-bound/SetCompression';
import { LoginSuccess } from '../../packets/packets/client-bound/LoginSuccess';
import { ClientState } from '../../packets/ClientState';
import { v3 as uuid } from 'uuid';
import { Gamemode, JoinGame } from '../../packets/packets/client-bound/JoinGame';
import { ClientBoundPluginMessage } from '../../packets/packets/client-bound/ClientBoundPluginMessage';
import {
  clientStateBox,
  compressionBox,
  playerEntityIdBox,
  positionBox,
  uuidBox,
} from '../../box/ClientBoxes';
import { clientsBox } from '../../box/ServerBoxes';
import { SpawnPlayer } from '../../packets/packets/client-bound/SpawnPlayer';

// TODO: Fix
let entityId = 0;

export class LoginListener {
  @EventHandler({ priority: EventPriority.LOWEST })
  async loginStart({ client, username }: LoginStart) {
    const threshold = 1;
    await client.write(new SetCompression(threshold));
    client.storage.put(compressionBox, { threshold });

    const userUuid = uuid(`OfflinePlayer:${username}`, Buffer.alloc(16), Buffer.alloc(16));
    client.storage.put(uuidBox, userUuid);
    await client.write(new LoginSuccess(userUuid, username));
    client.storage.put(clientStateBox, ClientState.PLAY);

    await client.write(
      new JoinGame(
        entityId,
        false,
        Gamemode.SURVIVAL,
        undefined,
        client.server.config.dimensionCodec['minecraft:dimension_type'].value.map(
          ({ name }) => name,
        ), // TODO: better types
        client.dimension.element,
        client.dimension.name,
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
    client.storage.put(playerEntityIdBox, entityId);
    entityId++;

    await client.write(
      new ClientBoundPluginMessage(
        'minecraft:brand',
        Buffer.concat([Buffer.of(3), Buffer.from('tim', 'utf8')]),
      ),
    );
  }
}
