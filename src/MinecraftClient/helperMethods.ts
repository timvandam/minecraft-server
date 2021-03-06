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
import { loadChunk } from '../WorldLoader'
import { longarray } from 'eznbt/lib/DataTypes/LongArray'
import { EBiome } from '../enums/EBiome'
import { Int } from '../DataTypes/Int'

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
 * This overwrites the default behavior of the chunkData packet.
 *
 * @todo only send the nearest chunk section for faster loading. replace any ores with stone to prevent xray
 */
export async function chunkData (this: MinecraftClient, x: number, z: number): Promise<void> {
  const chunk = await loadChunk(x, z)

  // Research whether this is actually needed/what for
  const heightmap = {
    MOTION_BLOCKING: longarray(...Array(36).fill(0n)),
    [Symbol.for('NBTRootTagName')]: 'Heightmaps'
  }

  // No actual biomes are stored right now
  const biomes = Buffer.concat(Array(1024).fill(EBiome.HELL).map(value => new Int({ value }).buffer))

  const sections = chunk.sections.map(({ blockCount, bitsPerBlock, palette, data }) => ([blockCount, bitsPerBlock, palette, data]))
  const blockEntities: any[] = [] // compound tags

  return this.write({
    name: 'chunkData',
    data: [chunk.x, chunk.z, true, chunk.bitMask, heightmap, biomes, sections, blockEntities]
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
