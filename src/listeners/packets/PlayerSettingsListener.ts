import { EventHandler } from 'decorator-events';
import { ClientSettings } from '../../packets/packets/server-bound/ClientSettings';
import { UpdateViewDistance } from '../../packets/packets/client-bound/UpdateViewDistance';
import { ChunkDataAndUpdateLight } from '../../packets/packets/client-bound/ChunkDataAndUpdateLight';
import { PlayerPositionAndLook } from '../../packets/packets/client-bound/PlayerPositionAndLook';
import { ClientBoundHeldItemChange } from '../../packets/packets/client-bound/ClientBoundHeldItemChange';
import { DeclareRecipes } from '../../packets/packets/client-bound/DeclareRecipes';
import { UpdateViewPosition } from '../../packets/packets/client-bound/UpdateViewPosition';
import { KeepAlive } from '../../packets/packets/client-bound/KeepAlive';

export class PlayerSettingsListener {
  @EventHandler
  async clientSettings(packet: ClientSettings) {
    packet.client.write(new ClientBoundHeldItemChange(1));
    packet.client.write(new DeclareRecipes([]));

    // packet.client.write(
    //   new PlayerPositionAndLook(
    //     packet.client.position.x,
    //     packet.client.position.y,
    //     packet.client.position.z,
    //     packet.client.position.yaw,
    //     packet.client.position.pitch,
    //     false,
    //     false,
    //     false,
    //     false,
    //     false,
    //     0,
    //     false,
    //   ),
    // );

    const chunkX = Math.floor(packet.client.position.x / 16);
    const chunkZ = Math.floor(packet.client.position.z / 16);

    packet.client.write(new UpdateViewPosition(chunkX, chunkZ));

    setInterval(async () => {
      const chunkX = Math.floor(packet.client.position.x / 16);
      const chunkZ = Math.floor(packet.client.position.z / 16);

      packet.client.write(new UpdateViewPosition(chunkX, chunkZ));
      packet.client.write(new KeepAlive(BigInt(Math.floor(Math.random() * 10000000))));
    }, 1000);

    console.log('Got client settings', packet.viewDistance, 'sending it back');
    packet.client.renderDistance = packet.viewDistance;
    packet.client.write(new UpdateViewDistance(packet.viewDistance));

    const diff = packet.client.renderDistance;
    console.log('distance', diff);
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
