import { EventHandler } from 'decorator-events';
import { ClientSettings } from '../../packets/packets/server-bound/ClientSettings';
import { UpdateViewDistance } from '../../packets/packets/client-bound/UpdateViewDistance';
import { ChunkDataAndUpdateLight } from '../../packets/packets/client-bound/ChunkDataAndUpdateLight';
import { PlayerPositionAndLook } from '../../packets/packets/client-bound/PlayerPositionAndLook';

export class PlayerSettingsListener {
  @EventHandler
  async clientSettings(packet: ClientSettings) {
    console.log('Got client settings', packet.viewDistance, 'sending it back');
    packet.client.renderDistance = packet.viewDistance;
    packet.client.write(new UpdateViewDistance(packet.viewDistance));

    const diff = packet.client.renderDistance;
    console.log('distance', diff);
    const chunkX = Math.floor(packet.client.position.x / 16);
    const chunkZ = Math.floor(packet.client.position.z / 16);
    for (let i = -diff; i <= diff; i++) {
      for (let j = -diff; j <= diff; j++) {
        packet.client.write(new ChunkDataAndUpdateLight(chunkX + i, chunkZ + j));
      }
    }

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
}
