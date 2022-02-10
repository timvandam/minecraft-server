import { EventHandler, EventPriority } from 'decorator-events';
import { PlayerPosition } from '../../packets/packets/server-bound/PlayerPosition';
import { PlayerPositionAndRotation } from '../../packets/packets/server-bound/PlayerPositionAndRotation';
import { PlayerRotation } from '../../packets/packets/server-bound/PlayerRotation';
import { PlayerMovement } from '../../packets/packets/server-bound/PlayerMovement';
import { UpdateViewPosition } from '../../packets/packets/client-bound/UpdateViewPosition';
import { MinecraftClient } from '../../MinecraftClient';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { PlayerPositionAndLook } from '../../packets/packets/client-bound/PlayerPositionAndLook';
import { ClientSettings } from '../../packets/packets/server-bound/ClientSettings';

export class PlayerMovementListener {
  protected updateViewPosition(client: MinecraftClient) {
    const chunkX = Math.floor(client.position.x / 16);
    const chunkZ = Math.floor(client.position.z / 16);

    client.write(new UpdateViewPosition(chunkX, chunkZ));
  }

  protected sendChunks(client: MinecraftClient) {
    //
  }

  @EventHandler({ priority: EventPriority.HIGHEST })
  spawnPlayer(packet: LoginStart) {
    packet.client.write(
      new PlayerPositionAndLook(
        packet.client.position.x,
        packet.client.position.y,
        packet.client.position.z,
        packet.client.position.yaw,
        packet.client.position.pitch,
        false,
        false,
        false,
        false,
        false,
        0,
        false,
      ),
    );
  }

  @EventHandler
  playerPosition(packet: PlayerPosition) {
    packet.client.position.x = packet.x;
    packet.client.position.y = packet.y;
    packet.client.position.z = packet.z;
    packet.client.position.onGround = packet.onGround;
    this.updateViewPosition(packet.client);
  }

  @EventHandler
  playerPositionAndRotation(packet: PlayerPositionAndRotation) {
    packet.client.position.x = packet.x;
    packet.client.position.y = packet.y;
    packet.client.position.z = packet.z;
    packet.client.position.yaw = packet.yaw;
    packet.client.position.pitch = packet.pitch;
    packet.client.position.onGround = packet.onGround;
    this.updateViewPosition(packet.client);
  }

  @EventHandler
  playerRotation(packet: PlayerRotation) {
    packet.client.position.yaw = packet.yaw;
    packet.client.position.pitch = packet.pitch;
    packet.client.position.onGround = packet.onGround;
    this.updateViewPosition(packet.client);
  }

  @EventHandler
  playerMovement(packet: PlayerMovement) {
    packet.client.position.onGround = packet.onGround;
  }
}
