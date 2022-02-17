import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';
import { Chat } from '../../../data-types/Chat';
import * as Buffer from 'buffer';
import { Gamemode } from './JoinGame';

enum PlayerInfoAction {
  ADD_PLAYER = 0,
  UPDATE_GAMEMODE = 1,
  UPDATE_LATENCY = 2,
  UPDATE_DISPLAY_NAME = 3,
  REMOVE_PLAYER = 4,
}

type Player = { uuid: Buffer };

export type AddPlayer = Player & {
  name: string;
  properties: Record<string, { value: string; signature?: string }>;
  gamemode: number;
  ping: number;
} & UpdateDisplayName;

export type UpdateGamemode = Player & { gamemode: Gamemode };
export type UpdateLatency = Player & { ping: number };
export type UpdateDisplayName = Player & { displayName?: string | Chat };
export type RemovePlayer = Player;

// TODO: Allow multiple classes for one ID ONLY IF A FLAG IS FLAGGED! (in createPacket just give a true value optional)
export class PlayerInfo extends createPacket(0x36, PacketDirection.CLIENT_BOUND, ClientState.PLAY) {
  public addPlayers?: AddPlayer[];
  public updateGamemodePlayers?: UpdateGamemode[];
  public updateLatencyPlayers?: UpdateLatency[];
  public updateDisplayNamePlayers?: UpdateDisplayName[];
  public removePlayers?: RemovePlayer[];

  /**
   * This class can not be constructed directly. Please use one of the following:
   * - {@link PlayerInfo.addPlayers}
   * - {@link PlayerInfo.updateGamemode}
   * - {@link PlayerInfo.updateLatency}
   * - {@link PlayerInfo.updateDisplayName}
   * - {@link PlayerInfo.removePlayer}
   */
  protected constructor(public readonly action: PlayerInfoAction) {
    super();
  }

  static addPlayers(players: AddPlayer[]) {
    const playerInfo = new PlayerInfo(PlayerInfoAction.ADD_PLAYER);
    playerInfo.addPlayers = players;
    return playerInfo;
  }

  static updateGamemode(players: UpdateGamemode[]) {
    const playerInfo = new PlayerInfo(PlayerInfoAction.UPDATE_GAMEMODE);
    playerInfo.updateGamemodePlayers = players;
    return playerInfo;
  }

  static updateLatency(players: UpdateLatency[]) {
    const playerInfo = new PlayerInfo(PlayerInfoAction.UPDATE_LATENCY);
    playerInfo.updateLatencyPlayers = players;
    return playerInfo;
  }

  static updateDisplayName(players: UpdateDisplayName[]) {
    const playerInfo = new PlayerInfo(PlayerInfoAction.UPDATE_DISPLAY_NAME);
    playerInfo.updateDisplayNamePlayers = players;
    return playerInfo;
  }

  static removePlayer(players: RemovePlayer[]) {
    const playerInfo = new PlayerInfo(PlayerInfoAction.REMOVE_PLAYER);
    playerInfo.removePlayers = players;
    return playerInfo;
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: PlayerInfo): Buffer {
    const writer = new BufferWriter();

    writer.writeVarInt(packet.action);

    // sorry
    switch (packet.action) {
      case PlayerInfoAction.ADD_PLAYER:
        if (packet.addPlayers === undefined) {
          throw new Error('No players to add! This property should be set during construction');
        }

        writer.writeVarInt(packet.addPlayers.length);

        for (const { uuid, name, properties, gamemode, ping, displayName } of packet.addPlayers) {
          const propertyEntries = Object.entries(properties);

          writer.writeUuid(uuid).writeString(name).writeVarInt(propertyEntries.length);

          for (const [name, { value, signature }] of propertyEntries) {
            const isSigned = signature !== undefined;
            writer.writeString(name).writeString(value).writeBoolean(isSigned);
            if (isSigned) writer.writeString(signature);
          }

          const hasDisplayName = displayName !== undefined;
          writer.writeVarInt(gamemode).writeVarInt(ping).writeBoolean(hasDisplayName);
          if (hasDisplayName) writer.writeChat(displayName);
        }

        break;

      case PlayerInfoAction.UPDATE_GAMEMODE:
        if (packet.updateGamemodePlayers === undefined) {
          throw new Error(
            'No players to update the gamemode for! This property should be set during construction',
          );
        }

        writer.writeVarInt(packet.updateGamemodePlayers.length);

        for (const { uuid, gamemode } of packet.updateGamemodePlayers) {
          writer.writeUuid(uuid).writeVarInt(gamemode);
        }

        break;

      case PlayerInfoAction.UPDATE_LATENCY:
        if (packet.updateLatencyPlayers === undefined) {
          throw new Error(
            'No players to update the latency for! This property should be set during construction',
          );
        }

        writer.writeVarInt(packet.updateLatencyPlayers.length);

        for (const { uuid, ping } of packet.updateLatencyPlayers) {
          writer.writeUuid(uuid).writeVarInt(ping);
        }

        break;

      case PlayerInfoAction.UPDATE_DISPLAY_NAME:
        if (packet.updateDisplayNamePlayers === undefined) {
          throw new Error(
            'No players to update the display name for! This property should be set during construction',
          );
        }

        writer.writeVarInt(packet.updateDisplayNamePlayers.length);

        for (const { uuid, displayName } of packet.updateDisplayNamePlayers) {
          const hasDisplayName = displayName !== undefined;
          writer.writeUuid(uuid).writeBoolean(hasDisplayName);
          if (hasDisplayName) writer.writeChat(displayName);
        }

        break;

      case PlayerInfoAction.REMOVE_PLAYER:
        if (packet.removePlayers === undefined) {
          throw new Error('No players to remove! This property should be set during construction');
        }

        writer.writeVarInt(packet.removePlayers.length);

        for (const { uuid } of packet.removePlayers) {
          writer.writeUuid(uuid);
        }

        break;
    }

    return writer.getBuffer();
  }
}
