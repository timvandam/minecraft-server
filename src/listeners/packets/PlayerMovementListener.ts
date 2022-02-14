import { EventHandler, EventPriority } from 'decorator-events';
import { PlayerPosition } from '../../packets/packets/server-bound/PlayerPosition';
import { PlayerPositionAndRotation } from '../../packets/packets/server-bound/PlayerPositionAndRotation';
import { PlayerRotation } from '../../packets/packets/server-bound/PlayerRotation';
import { PlayerMovement } from '../../packets/packets/server-bound/PlayerMovement';
import { UpdateViewPosition } from '../../packets/packets/client-bound/UpdateViewPosition';
import { MinecraftClient } from '../../MinecraftClient';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { PlayerPositionAndLook } from '../../packets/packets/client-bound/PlayerPositionAndLook';
import { playerEntityIdBox, positionBox, uuidBox } from '../../box/ClientBoxes';
import { clientsBox } from '../../box/ServerBoxes';
import { SpawnPlayer } from '../../packets/packets/client-bound/SpawnPlayer';
import { PlayerEntityMetadata } from '../../data-types/entity-metadata/entities/PlayerEntityMetadata';
import { SetEntityMetadata } from '../../packets/packets/client-bound/SetEntityMetadata';
import { Hand } from '../../packets/packets/server-bound/ClientSettings';

export type Position = {
  x: number;
  y: number;
  z: number;
  onGround: boolean;
  yaw: number;
  pitch: number;
};

export class PlayerMovementListener {
  protected updatePosition(client: MinecraftClient, current: Position) {
    const prev = client.storage.getOrThrow(positionBox);

    if (!prev.onGround && current.onGround) {
      // TODO: Apply fall damage in different listener
    }

    const prevChunkX = Math.floor(prev.x / 16);
    const prevChunkZ = Math.floor(prev.z / 16);
    const currentChunkX = Math.floor(current.x / 16);
    const currentChunkZ = Math.floor(current.z / 16);
    if (prevChunkX !== currentChunkX || prevChunkZ !== currentChunkZ) {
      client.write(new UpdateViewPosition(currentChunkX, currentChunkZ));
    }

    client.storage.put(positionBox, current);
  }

  @EventHandler({ priority: EventPriority.HIGHEST })
  spawnPlayer({ client }: LoginStart) {
    const x = 10;
    const y = 25;
    const z = 10;
    const yaw = 0;
    const pitch = 0;
    const onGround = true;
    client.storage.put(positionBox, { x, y, z, yaw, pitch, onGround });
    client.write(
      new PlayerPositionAndLook(x, y, z, yaw, pitch, false, false, false, false, false, 0, false),
    );

    // TODO: Do this elsewhere
    for (const otherClient of client.server.storage.getOrThrow(clientsBox)) {
      if (otherClient === client) continue;
      console.log('other player!!', otherClient);

      const otherEntityId = otherClient.storage.getOrThrow(playerEntityIdBox);
      const otherUuid = otherClient.storage.getOrThrow(uuidBox);
      const otherPosition = otherClient.storage.getOrThrow(positionBox);

      client.write(
        new SpawnPlayer(
          otherEntityId,
          otherUuid,
          otherPosition.x,
          otherPosition.y,
          otherPosition.z,
          otherPosition.yaw,
          otherPosition.pitch,
        ),
      );
      client.write(
        new SetEntityMetadata(otherEntityId, new PlayerEntityMetadata(0, 0, 0, Hand.LEFT)),
      );
      otherClient.write(
        new SpawnPlayer(
          client.storage.getOrThrow(playerEntityIdBox),
          client.storage.getOrThrow(uuidBox),
          x,
          y,
          z,
          yaw,
          pitch,
        ),
      );
      otherClient.write(
        new SetEntityMetadata(
          client.storage.getOrThrow(playerEntityIdBox),
          new PlayerEntityMetadata(0, 0, 0, Hand.LEFT),
        ),
      );
    }
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
