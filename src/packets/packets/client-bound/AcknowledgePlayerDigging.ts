import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';
import { DiggingStatus } from '../server-bound/PlayerDigging';

export class AcknowledgePlayerDigging extends createPacket(
  0x08,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly block: number,
    public readonly status: DiggingStatus,
    public readonly successful: boolean,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: AcknowledgePlayerDigging): Buffer {
    const writer = new BufferWriter();

    if (
      ![
        DiggingStatus.STARTED_DIGGING,
        DiggingStatus.CANCELLED_DIGGING,
        DiggingStatus.FINISHED_DIGGING,
      ].includes(packet.status)
    ) {
      throw new Error(`Invalid digging status ${DiggingStatus[packet.status]} (${packet.status})`);
    }

    writer
      .writePosition(packet.x, packet.y, packet.z)
      .writeVarInt(packet.block)
      .writeVarInt(packet.status)
      .writeBoolean(packet.successful);
    return writer.getBuffer();
  }
}
