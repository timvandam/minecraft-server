import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';

export class Explosion extends createPacket(0x1c, PacketDirection.CLIENT_BOUND, ClientState.PLAY) {
  constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly z: number,
    public readonly strength: number,
    public readonly affectedBlockPositions: {
      relativeX: number;
      relativeY: number;
      relativeZ: number;
    }[],
    public readonly playerMotionX: number,
    public readonly playerMotionY: number,
    public readonly playerMotionZ: number,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  static toBuffer(packet: Explosion): Buffer {
    const writer = new BufferWriter();
    writer
      .writeFloat(packet.x)
      .writeFloat(packet.y)
      .writeFloat(packet.z)
      .writeFloat(packet.strength)
      .writeVarInt(packet.affectedBlockPositions.length);

    for (const { relativeX, relativeY, relativeZ } of packet.affectedBlockPositions) {
      writer.writeUByte(relativeX);
      writer.writeUByte(relativeY);
      writer.writeUByte(relativeZ);
    }

    writer
      .writeFloat(packet.playerMotionX)
      .writeFloat(packet.playerMotionY)
      .writeFloat(packet.playerMotionZ);

    return writer.getBuffer();
  }
}
