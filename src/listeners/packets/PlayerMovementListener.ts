import { EventHandler } from 'decorator-events';
import { PlayerPosition } from '../../packets/packets/server-bound/PlayerPosition';
import { PlayerPositionAndRotation } from '../../packets/packets/server-bound/PlayerPositionAndRotation';
import { PlayerRotation } from '../../packets/packets/server-bound/PlayerRotation';
import { PlayerMovement } from '../../packets/packets/server-bound/PlayerMovement';

export class PlayerMovementListener {
  @EventHandler
  playerPosition(packet: PlayerPosition) {
    packet.client.position.x = packet.x;
    packet.client.position.y = packet.y;
    packet.client.position.z = packet.z;
  }

  @EventHandler
  playerPositionAndRotation(packet: PlayerPositionAndRotation) {
    packet.client.position.x = packet.x;
    packet.client.position.y = packet.y;
    packet.client.position.z = packet.z;
    packet.client.position.yaw = packet.yaw;
    packet.client.position.pitch = packet.pitch;
  }

  @EventHandler
  playerRotation(packet: PlayerRotation) {
    packet.client.position.yaw = packet.yaw;
    packet.client.position.pitch = packet.pitch;
  }

  @EventHandler
  playerMovement(packet: PlayerMovement) {
    //
  }
}
