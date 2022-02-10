import { EventHandler, EventPriority } from 'decorator-events';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { ChunkDataAndUpdateLight } from '../../packets/packets/client-bound/ChunkDataAndUpdateLight';

export class ChunkListener {
  @EventHandler({ priority: EventPriority.HIGHEST })
  sendChunks(packet: LoginStart) {
    const chunkX = Math.floor(packet.client.position.x / 16);
    const chunkZ = Math.floor(packet.client.position.z / 16);

    const diff = packet.client.renderDistance;
    for (let i = -diff; i <= diff; i++) {
      for (let j = -diff; j <= diff; j++) {
        packet.client.write(new ChunkDataAndUpdateLight(chunkX + i, chunkZ + j));
      }
    }
  }
}
