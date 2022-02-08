import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export type Recipe = {
  type: string;
  id: string;
  data: unknown; // TODO
};

export class DeclareRecipes extends createPacket(
  0x66,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(
    // TODO
    public readonly recipes: [],
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: DeclareRecipes): Buffer {
    const writer = new BufferWriter();
    writer.writeVarInt(packet.recipes.length);
    //TODO:Write recipes
    return writer.getBuffer();
  }
}
