/**
 * Add a player to the TAB player menu
 */
import MinecraftClient from './index'
import LString from '../DataTypes/LString'
import Bool from '../DataTypes/Bool'
import { DataTypeConstructor } from '../DataTypes/DataType'
import { EPlayerInfoAction } from '../enums/EPlayerInfoAction'

// Properties that are sent
interface Property {
  name: string;
  value: string;
  signed: boolean;
  signature?: string; // only present when signed is true
}

interface Player {
  UUID: string;
}

interface AddPlayer extends Player {
  uuid: string;
  name: string;
  properties: AddPlayerProperty[];
  gamemode: number;
  ping: number;
  hasDisplayName: boolean;
  displayName?: string;
}

interface AddPlayerProperty {
  name: string;
  value: string;
  signed: boolean;
  signature?: string;
}

// Check whether this actually works
export function addPlayerInfo (this: MinecraftClient, players: AddPlayer[]) {
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
    name: 'playerInfoAddPlayer',
    data: [EPlayerInfoAction.ADD_PLAYER, playerArr]
  })
}
