import { MinecraftClient } from '../MinecraftClient';
import { playerSettingsBox, positionBox } from '../box/ClientBoxes';

export function getChunkCoords(player: MinecraftClient): [x: number, z: number] {
  const position = player.storage.getOrThrow(positionBox);
  return [Math.floor(position.x / 16), Math.floor(position.z / 16)];
}

export function playerIsInRange(player1: MinecraftClient, player2: MinecraftClient) {
  if (!player1.storage.has(playerSettingsBox)) {
    console.log('this duded oesnt have settings', player1.storage);
    return false;
  }
  const { renderDistance } = player1.storage.getOrThrow(playerSettingsBox);
  const [player1ChunkX, player1ChunkZ] = getChunkCoords(player1);
  const [player2ChunkX, player2ChunkZ] = getChunkCoords(player2);
  const distance = Math.max(
    Math.abs(player1ChunkX - player2ChunkX),
    Math.abs(player1ChunkZ - player2ChunkZ),
  );
  return distance < renderDistance;
}
