import { EventHandler, EventPriority } from 'decorator-events';
import { PlayerPosition } from '../../packets/packets/server-bound/PlayerPosition';
import { PlayerPositionAndRotation } from '../../packets/packets/server-bound/PlayerPositionAndRotation';
import { PlayerRotation } from '../../packets/packets/server-bound/PlayerRotation';
import { PlayerMovement } from '../../packets/packets/server-bound/PlayerMovement';
import { UpdateViewPosition } from '../../packets/packets/client-bound/UpdateViewPosition';
import { MinecraftClient } from '../../MinecraftClient';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { PlayerPositionAndLook } from '../../packets/packets/client-bound/PlayerPositionAndLook';
import {
  playerEntityIdBox,
  playerSettingsBox,
  positionBox,
  spawnedPlayersBox,
  uuidBox,
} from '../../box/ClientBoxes';
import { clientsBox } from '../../box/ServerBoxes';
import { EntityPositionAndRotation } from '../../packets/packets/client-bound/EntityPositionAndRotation';
import { SpawnPlayer } from '../../packets/packets/client-bound/SpawnPlayer';
import { AddPlayer, PlayerInfo } from '../../packets/packets/client-bound/PlayerInfo';
import { Gamemode } from '../../packets/packets/client-bound/JoinGame';
import { chat } from '../../data-types/Chat';
import { EntityHeadLook } from '../../packets/packets/client-bound/EntityHeadLook';
import { getChunkCoords, playerIsInRange } from '../../util/players';
import { DestroyEntities } from '../../packets/packets/client-bound/DestroyEntities';

export type Position = {
  x: number;
  y: number;
  z: number;
  onGround: boolean;
  yaw: number;
  pitch: number;
};

export class PlayerMovementListener {
  protected getNearbyPlayers(client: MinecraftClient) {
    const players = client.server.storage.getOrThrow(clientsBox);
    return [...players].filter((player) => player !== client && playerIsInRange(player, client));
  }

  protected updatePosition(client: MinecraftClient, current: Position) {
    const prev = client.storage.getOrThrow(positionBox);

    if (!prev.onGround && current.onGround) {
      // TODO: Apply fall damage in different listener
    }

    const [prevChunkX, prevChunkZ] = getChunkCoords(client);
    const currentChunkX = Math.floor(current.x / 16);
    const currentChunkZ = Math.floor(current.z / 16);
    if (prevChunkX !== currentChunkX || prevChunkZ !== currentChunkZ) {
      client.write(new UpdateViewPosition(currentChunkX, currentChunkZ));
    }

    const clientEntityId = client.storage.getOrThrow(playerEntityIdBox);
    const deltaX = (current.x - prev.x) * 4096;
    const deltaY = (current.y - prev.y) * 4096;
    const deltaZ = (current.z - prev.z) * 4096;
    // TODO: Make this a teleport if delta y is too large. Make this all happen in an abstract layer above this
    const entityPositionAndRotationPacket = new EntityPositionAndRotation(
      clientEntityId,
      deltaX,
      deltaY,
      deltaZ,
      current.yaw,
      current.pitch,
      current.onGround,
    );
    const entityHeadLookPacket = new EntityHeadLook(clientEntityId, current.yaw);
    for (const otherClient of client.server.storage.getOrThrow(clientsBox)) {
      if (otherClient === client) continue;
      const otherClientEntityId = otherClient.storage.getOrThrow(playerEntityIdBox);
      const clientSpawnedEntityIds = client.storage.getOrThrow(spawnedPlayersBox);
      const otherClientIsSpawned = clientSpawnedEntityIds.has(otherClientEntityId);
      if (playerIsInRange(client, otherClient)) {
        otherClient.write(entityPositionAndRotationPacket);
        otherClient.write(entityHeadLookPacket);
        // TODO: Update entity spawns periodically (every second is fine)
        if (!otherClientIsSpawned) {
          const { x, y, z, yaw, pitch } = otherClient.storage.getOrThrow(positionBox);
          client.write(
            new SpawnPlayer(
              otherClientEntityId,
              otherClient.storage.getOrThrow(uuidBox),
              x,
              y,
              z,
              yaw,
              pitch,
            ),
          );
          clientSpawnedEntityIds.add(otherClientEntityId);
        }
      } else if (otherClientIsSpawned) {
        client.write(new DestroyEntities([otherClientEntityId]));
        clientSpawnedEntityIds.delete(otherClientEntityId);
      }
    }

    client.storage.put(positionBox, current);
  }

  @EventHandler({ priority: EventPriority.HIGHEST })
  async spawnPlayer({ client }: LoginStart) {
    const x = 10;
    const y = 18;
    const z = 10;
    const yaw = 0;
    const pitch = 0;
    const onGround = true;
    client.storage.put(positionBox, { x, y, z, yaw, pitch, onGround });

    client.write(
      new PlayerPositionAndLook(x, y, z, yaw, pitch, false, false, false, false, false, 0, false),
    );

    client.write(
      PlayerInfo.addPlayers(
        [...client.server.storage.getOrThrow(clientsBox)].map((otherClient) => ({
          name: otherClient === client ? 'you' : 'other_player',
          displayName: otherClient === client ? chat.red`you` : 'other_player',
          ping: 0,
          gamemode: Gamemode.SURVIVAL,
          properties: {},
          uuid: otherClient.storage.getOrThrow(uuidBox),
        })),
      ),
    );

    client.storage.put(spawnedPlayersBox, new Set());

    client.server.broadcast(
      PlayerInfo.addPlayers([
        {
          name: 'other_player',
          displayName: 'other_player',
          ping: 0,
          gamemode: Gamemode.SURVIVAL,
          properties: {},
          uuid: client.storage.getOrThrow(uuidBox),
        },
      ]),
      client,
    );
  }

  @EventHandler
  playerPosition({ x, y, z, onGround, client }: PlayerPosition) {
    const current = client.storage.getOrThrow(positionBox);
    this.updatePosition(client, { ...current, x, y, z, onGround });
  }

  @EventHandler
  playerPositionAndRotation({ client, x, y, z, yaw, pitch, onGround }: PlayerPositionAndRotation) {
    const current = client.storage.getOrThrow(positionBox);
    this.updatePosition(client, { ...current, x, y, z, onGround, yaw, pitch });
  }

  @EventHandler
  playerRotation({ client, yaw, pitch, onGround }: PlayerRotation) {
    const current = client.storage.getOrThrow(positionBox);
    this.updatePosition(client, { ...current, onGround, yaw, pitch });
  }

  @EventHandler
  playerMovement({ client, onGround }: PlayerMovement) {
    const current = client.storage.getOrThrow(positionBox);
    this.updatePosition(client, { ...current, onGround });
  }
}
