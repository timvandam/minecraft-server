import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export enum Gamemode {
  SURVIVAL = 0,
  CREATIVE = 1,
  ADVENTURE = 2,
  SPECTATOR = 3,
}

type Dimension = {};

// TODO
type NBT = {};

export class JoinGame extends createPacket(0x26, PacketDirection.CLIENT_BOUND, ClientState.PLAY) {
  constructor(
    public readonly entityId: number,
    public readonly isHardcore: boolean,
    public readonly gamemode: Gamemode,
    public readonly previousGamemode: Gamemode | undefined,
    public readonly dimensions: Dimension[],
    // public readonly dimensionCodec: NBT.Compound,
    // public readonly dimension: NBT.Compound,
    public readonly dimensionName: string,
    public readonly hashedSeed: bigint,
    public readonly maxPlayers: number,
    public readonly viewDistance: number,
    public readonly simulationDistance: number,
    public readonly reducedDebugInfo: boolean,
    public readonly enableRespawnScreen: boolean,
    public readonly isDebug: boolean,
    public readonly isFlat: boolean,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: JoinGame): Buffer {
    // TODO
    return new BufferWriter().getBuffer();
  }
}
