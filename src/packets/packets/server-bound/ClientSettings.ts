import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferReader } from '../../../data-types';

export enum ChatMode {
  ENABLED = 0,
  COMMANDS_ONLY = 1,
  HIDDEN = 2,
}

export enum Hand {
  LEFT = 0,
  RIGHT = 1,
}

export class ClientSettings extends createPacket(
  0x05,
  PacketDirection.SERVER_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly locale: string,
    public readonly viewDistance: number,
    public readonly chatMode: ChatMode,
    public readonly charColors: boolean,
    public readonly displayedSkinParts: number, // TODO enum?
    public readonly mainHand: Hand,
    public readonly textFiltering: boolean,
    public readonly allowServerListing: boolean,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static fromBuffer(buf: Buffer): ClientSettings {
    const reader = new BufferReader(buf);
    const locale = reader.readString();
    const viewDistance = reader.readByte();
    const chatMode = reader.readVarInt();

    if (!Object.values(ChatMode).includes(chatMode)) {
      throw new Error(`Invalid chat mode ${chatMode}`);
    }

    const chatColors = reader.readBoolean();
    const displayedSkinParts = reader.readUByte();
    const mainHand = reader.readVarInt();

    if (!Object.values(Hand).includes(mainHand)) {
      throw new Error(`Invalid main hand ${mainHand}`);
    }

    const enableTextFiltering = reader.readBoolean();
    const allowServerListings = reader.readBoolean();

    return new ClientSettings(
      locale,
      viewDistance,
      chatMode,
      chatColors,
      displayedSkinParts,
      mainHand,
      enableTextFiltering,
      allowServerListings,
    );
  }
}
