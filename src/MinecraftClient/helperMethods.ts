// This file consists of helper methods which can be used if sending regular packets is not convenient
// For example packets whose format changes depending on some variable

// TODO: Create many files instead of just this one

/**
 * Add a player to the TAB player menu
 */
import MinecraftClient from './index'
import { EPlayerInfoAction } from '../enums/EPlayerInfoAction'
import { EBossBarColor } from '../enums/EBossBarColor'
import { EBossBarDivision } from '../enums/EBossBarDivision'
import { EBossBarFlag } from '../enums/EBossBarFlag'
import { NBTTag, NBTTagConstructor } from 'eznbt/lib/DataTypes/NBTTag'
import { LongArray, longarray } from 'eznbt/lib/DataTypes/LongArray'
import Short from '../DataTypes/Short'
import { UByte } from '../DataTypes/UByte'
import LArray from '../DataTypes/LArray'
import Long from '../DataTypes/Long'

interface Player {
  UUID: string;
}

interface PlayerToAdd extends Player {
  uuid: string;
  name: string;
  properties: PlayerToAddProperty[];
  gamemode: number;
  ping: number;
  hasDisplayName: boolean;
  displayName?: string;
}

interface PlayerToAddProperty {
  name: string;
  value: string;
  signed: boolean;
  signature?: string;
}

// Check whether this actually works
export function addPlayerInfo (this: MinecraftClient, players: PlayerToAdd[]): Promise<void> {
  const playerArr: any[] = []
  players.forEach(player => playerArr.push([
    player.uuid,
    player.name,
    player.properties.map(property => {
      const prop = [property.name, property.value, property.signed]
      if (property.signed && property.signature) prop.push(property.signature)
      return prop
    }),
    player.gamemode,
    player.ping,
    player.hasDisplayName,
    player.displayName
  ]))
  return this.write({
    name: 'playerInfoAddPlayers',
    data: [EPlayerInfoAction.ADD_PLAYER, playerArr]
  })
}

/**
 * This overwrites the default behavior of the chunkData packet. This is needed as its schema
 * depends on its arguments
 */
export function chunkData (this: MinecraftClient, x: number, y: number): Promise<void> {
  const chunkX = Math.floor(x / 16)
  const chunkY = Math.floor(y / 16)

  // TODO: Load world
  /*
  What we need:
  - Heightmap (NBT Compound with MOTION_BLOCKING)
    - MOTION_BLOCKING: 256 9-bit entries as a LongArray. Has y of the highest solid block.
      - LongArray = Length<Int> + ...Longs
  - Biomes? (1024 biome IDs ordered by x, z, y. Each one is a 4x4x4 area)
  - Chunk data (array of Chunk Sections)
  - Block entities
   */

  const heightmap = {
    MOTION_BLOCKING: longarray(...Array(36).fill(0n))
  }

  const biomes = Buffer.alloc(0)

  const LongArray = LArray(Long)
  interface ChunkSection {
    0: Short; // block count
    1: UByte; // bits per block
    2: any; // pallette
    3: LongArray; // length + data array
  }

  const chunkData: ChunkSection = [] // length is equal to the amount of 1 bits in the mask (0b1)
  const blockEntities: NBTTag<any>[] = []

  return this.write({
    name: 'chunkData',
    data: [chunkX, chunkY, false, 0b1, heightmap, biomes, chunkData, blockEntities]
  })
}

/**
 * Adds a boss bar
 */
export function addBossBar (
  this: MinecraftClient,
  uuid: string,
  title: string,
  health: number,
  color: EBossBarColor,
  division: EBossBarDivision,
  darkSky = false,
  dragonBar = false,
  fog = false) {
  let flag = 0
  if (darkSky) flag |= EBossBarFlag.DARKEN_SKY
  if (dragonBar) flag |= EBossBarFlag.DRAGON_BAR
  if (fog) flag |= EBossBarFlag.CREATE_FOG
  return this.write({
    name: 'addBossBar',
    data: [uuid, 0, title, health, color, division, flag]
  })
}

/**
 * Updates the health of a boss bar
 */
export function updateBossBarHealth (this: MinecraftClient, uuid: string, health: number) {
  return this.write({
    name: 'updateBossBarHealth',
    data: [uuid, 2, health]
  })
}
