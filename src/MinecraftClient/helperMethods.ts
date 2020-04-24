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
  name: string;
  propertyCount: number;
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

// TODO: Make this work (array datatype)
export function addPlayerInfo (this: MinecraftClient, players: AddPlayer[]) {
  this.write({
    name: 'playerInfoAddPlayer',
    data: [EPlayerInfoAction.ADD_PLAYER, players.length]
  })
}
