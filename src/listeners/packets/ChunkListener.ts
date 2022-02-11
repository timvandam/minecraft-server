import { EventHandler, EventPriority } from 'decorator-events';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { ChunkDataAndUpdateLight } from '../../packets/packets/client-bound/ChunkDataAndUpdateLight';
import { loadedChunksBox, playerSettingsBox, positionBox } from '../../box';
import { MinecraftClient } from '../../MinecraftClient';
import { UnloadChunk } from '../../packets/packets/client-bound/UnloadChunk';
import { ClientSettings } from '../../packets/packets/server-bound/ClientSettings';
import { PlayerPosition } from '../../packets/packets/server-bound/PlayerPosition';
import { PlayerPositionAndRotation } from '../../packets/packets/server-bound/PlayerPositionAndRotation';

export type ChunkRange = {
  min: { x: number; z: number };
  max: { x: number; z: number };
};

export class ChunkListener {
  /**
   * Gets the chunk coordinates of chunks that *should* be loaded for this client
   */
  protected getChunkRangeForClient(client: MinecraftClient) {
    const position = client.storage.getOrThrow(positionBox);
    const chunkX = Math.floor(position.x / 16);
    const chunkZ = Math.floor(position.z / 16);

    const { renderDistance = 2 } = client.storage.get(playerSettingsBox) ?? {};

    return {
      min: {
        x: chunkX - renderDistance,
        z: chunkZ - renderDistance,
      },
      max: {
        x: chunkX + renderDistance,
        z: chunkZ + renderDistance,
      },
    };
  }

  protected pointInRange({ x, z }: { x: number; z: number }, range: ChunkRange): boolean {
    return x >= range.min.x && x <= range.max.x && z >= range.min.z && z <= range.max.z;
  }

  protected xorChunkRange(a: ChunkRange, b: ChunkRange): [a: ChunkRange[], b: ChunkRange[]] {
    // These are starting points of squares. This explains the +1, as we always want to start after some max to prevent overlapping
    const xLines = [...new Set([a.min.x, b.min.x, a.max.x + 1, b.max.x + 1])].sort((a, b) => a - b);
    const zLines = [...new Set([a.min.z, b.min.z, a.max.z + 1, b.max.z + 1])].sort((a, b) => a - b);
    const A: ChunkRange[] = [];
    const B: ChunkRange[] = [];

    for (let i = 0; i < xLines.length - 1; i++) {
      const xMin = xLines[i];
      const xMax = xLines[i + 1] - 1; // -1 so we end just before the next start

      for (let j = 0; j < zLines.length - 1; j++) {
        const zMin = zLines[j];
        const zMax = zLines[j + 1] - 1;

        const min = { x: xMin, z: zMin };
        const max = { x: xMax, z: zMax };

        const inA = this.pointInRange(min, a) && this.pointInRange(max, a);
        const inB = this.pointInRange(min, b) && this.pointInRange(max, b);

        if (inA && !inB) {
          A.push({ min, max });
        } else if (!inA && inB) {
          B.push({ min, max });
        }
      }
    }

    return [A, B];
  }

  protected loadChunks(client: MinecraftClient, chunksToLoad: ChunkRange[]) {
    for (const chunkRange of chunksToLoad) {
      // TODO: First render the ones in front of the user
      for (let x = chunkRange.min.x; x <= chunkRange.max.x; x++) {
        for (let z = chunkRange.min.z; z <= chunkRange.max.z; z++) {
          client.write(new ChunkDataAndUpdateLight(x, z));
        }
      }
    }
  }

  protected unloadChunks(client: MinecraftClient, chunksToUnload: ChunkRange[]) {
    for (const chunkRange of chunksToUnload) {
      for (let x = chunkRange.min.x; x <= chunkRange.max.x; x++) {
        for (let z = chunkRange.min.z; z <= chunkRange.max.z; z++) {
          client.write(new UnloadChunk(x, z));
        }
      }
    }
  }

  protected updateChunks(client: MinecraftClient) {
    const chunkRange = this.getChunkRangeForClient(client);
    const currentChunkRange = client.storage.getOrThrow(loadedChunksBox);
    const [chunksToLoad, chunksToUnload] = this.xorChunkRange(chunkRange, currentChunkRange);
    this.loadChunks(client, chunksToLoad);
    this.unloadChunks(client, chunksToUnload);
    client.storage.put(loadedChunksBox, chunkRange);
  }

  @EventHandler
  sendSpawnChunks({ client }: LoginStart) {
    const chunkRange = this.getChunkRangeForClient(client);
    this.loadChunks(client, [chunkRange]);
    client.storage.put(loadedChunksBox, chunkRange);
  }

  @EventHandler({ priority: EventPriority.HIGHEST })
  sendSettingChangeChunks({ client }: ClientSettings) {
    this.updateChunks(client);
  }

  @EventHandler({ priority: EventPriority.HIGHEST })
  playerPosition({ client }: PlayerPosition) {
    this.updateChunks(client);
  }

  @EventHandler({ priority: EventPriority.HIGHEST })
  playerPositionAndRotation({ client }: PlayerPositionAndRotation) {
    this.updateChunks(client);
  }
}
