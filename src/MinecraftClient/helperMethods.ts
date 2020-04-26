// This file consists of helper methods which can be used if sending regular packets is not convenient
// For example packets whose format changes depending on some variable

/**
 * Add a player to the TAB player menu
 */
import MinecraftClient from './index'
import LString from '../DataTypes/LString'
import Bool from '../DataTypes/Bool'
import { DataTypeConstructor } from '../DataTypes/DataType'
import { EPlayerInfoAction } from '../enums/EPlayerInfoAction'

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
export function addPlayerInfo (this: MinecraftClient, players: PlayerToAdd[]) {
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
  this.write({
    name: 'playerInfoAddPlayers',
    data: [EPlayerInfoAction.ADD_PLAYER, playerArr]
  })
}
