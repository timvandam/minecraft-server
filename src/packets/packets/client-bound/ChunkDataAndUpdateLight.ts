import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';
import { compound, longArray, NBTCompound } from '../../../data-types/nbt';
import { NBTValue } from '../../../data-types/nbt/NBTValue';
import { NBTType } from '../../../data-types/nbt/NBTType';
import { CompactLongArray } from '../../../data-types/palette/CompactLongArray';
import { BitSet } from '../../../data-types/BitSet';

type ChunkData = ChunkSection[];
// sent bottom to top
type ChunkSection = {
  blockCount: number; // short, excluding air
  blockStates: PalettedContainer;
  biomes: PalettedContainer;
};
type PalettedContainer = {
  bitsPerEntry: number; // ubyte
  palette?: number[]; // varies
  dataArray: number[]; // prepended with varint length
};

export class ChunkDataAndUpdateLight extends createPacket(
  0x22,
  PacketDirection.CLIENT_BOUND,
  ClientState.PLAY,
) {
  constructor(public readonly chunkX: number, public readonly chunkZ: number) {
    super();
  }

  static {
    registerPacket(this);
  }

  protected getHeightMap(): NBTCompound {
    return compound({
      '': {
        MOTION_BLOCKING: this.getHeightMapLongArray(),
      },
    });
  }

  protected getHeightMapLongArray(): NBTValue<NBTType.LONG_ARRAY> {
    const bitsPerEntry = Math.ceil(Math.log2(this.client.dimension.element.height + 1));
    const data = new CompactLongArray(bitsPerEntry, false, true, false);
    for (let i = 0; i < 256; i++) {
      data.addData(this.getHeight(i));
    }

    return longArray(data.getLongArray());
  }

  protected getHeight(index: number): number {
    // TODO: Take this from world data
    return 60;
  }

  protected getChunkData(): Buffer {
    const writer = new BufferWriter();

    const blockCount = 4096;
    const chunkSections: ChunkData = [];

    const grass = 1;
    for (let i = 0; i < grass; i++) {
      chunkSections.push({
        blockCount,
        blockStates: {
          // A random palette
          // TODO: Make indirect palette work
          palette: [0, 1, 2, 3, 4, 5, 6, 7, 9],
          bitsPerEntry: 4,
          dataArray: Array(blockCount)
            .fill(8)
            .concat(Array(4096 - blockCount).fill(0)),
          // palette: [2],
          // bitsPerEntry: 0,
          // dataArray: [],
        },
        biomes: {
          // Another random palette
          palette: [0], // TODO: Make biome be an enum with codec
          bitsPerEntry: 0,
          dataArray: [],
        },
      });
    }
    for (
      let i = 0;
      i < (this.client.dimension.element.height - this.client.dimension.element.min_y) / 16 - grass;
      i++
    ) {
      chunkSections.push({
        blockCount: 0,
        blockStates: {
          // A random palette
          palette: [0],
          bitsPerEntry: 0,
          dataArray: [],
        },
        biomes: {
          // Another random palette
          palette: [0],
          bitsPerEntry: 0,
          dataArray: [],
        },
      });
    }

    for (const { blockCount, blockStates, biomes } of chunkSections) {
      writer.writeShort(blockCount);
      this.writePalettedContainer(writer, blockStates);
      this.writePalettedContainer(writer, biomes);
    }

    return writer.getBuffer();
  }

  protected writePalettedContainer(
    writer: BufferWriter,
    { palette, dataArray, bitsPerEntry }: PalettedContainer,
  ): void {
    // TODO: Direct palettes
    // TODO: Thresholds (different for biomes/blocks!)

    writer.writeUByte(bitsPerEntry);

    if (palette === undefined) {
      // throw new Error('Expected palette, but not present');
    } else {
      if (bitsPerEntry !== 0) writer.writeVarInt(palette.length);
      for (const id of palette) {
        writer.writeVarInt(id);
      }
    }

    const data = new CompactLongArray(bitsPerEntry, false, true, false);
    for (const num of dataArray) data.addData(num);
    writer.writeVarInt(data.length).writeBlob(data.getBuffer());
  }

  static toBuffer(packet: ChunkDataAndUpdateLight): Buffer {
    const writer = new BufferWriter();
    const chunkSections = Math.floor(
      (packet.client.dimension.element.height - packet.client.dimension.element.min_y) / 16,
    );
    writer
      .writeInt(packet.chunkX)
      .writeInt(packet.chunkZ)
      .writeNbt(packet.getHeightMap())
      .writeVarIntLenByteArray(packet.getChunkData())
      .writeVarInt(0)
      .writeBoolean(true)
      .writeBitSet(new BitSet())
      .writeBitSet(new BitSet())
      .writeBitSet(new BitSet())
      .writeBitSet(new BitSet())
      .writeVarInt(0)
      .writeVarInt(0);

    return writer.getBuffer();
  }
}
