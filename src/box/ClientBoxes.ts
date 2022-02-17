import { Box } from './Box';
import { ChatMode, SkinPart } from '../packets/packets/server-bound/ClientSettings';
import { Position } from '../listeners/packets/PlayerMovementListener';
import { ChunkRange } from '../listeners/packets/ChunkListener';
import { ClientState } from '../packets/ClientState';

export const playerSettingsBox = Box<{
  renderDistance: number;
  chatMode: ChatMode;
  allowServerListing: boolean;
  skinParts: SkinPart;
}>(Symbol('PlayerSettings'));

export const keepAliveBox = Box<{ keepAliveId: bigint }>(Symbol('KeepAlive'));

export const positionBox = Box<Position>(Symbol('PlayerMovement'));

export const loadedChunksBox = Box<ChunkRange>(Symbol('LoadedChunks'));

export const clientStateBox = Box<ClientState>(Symbol('ClientState'));

export const compressionBox = Box<{ threshold: number }>(Symbol('Compression'));

export const uuidBox = Box<Buffer>(Symbol('PlayerUUID'));

export const playerEntityIdBox = Box<number>(Symbol('PlayerEntityId'));

/**
 * The entity IDs of spawned players
 */
export const spawnedPlayersBox = Box<Set<number>>(Symbol('SpawnedPlayers'));
