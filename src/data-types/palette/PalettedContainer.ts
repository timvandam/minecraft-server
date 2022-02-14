// import { Block } from '../../world/Block';
// import { BufferWriter } from '../BufferWriter';
// import { CompactLongArray } from './CompactLongArray';
//
// export class PalettedContainer {
//   public readonly palette: Block[];
//   public readonly type: 'chunk' | 'biome';
//
//   protected get bitsPerEntry(): number {
//     // TODO
//     return -1;
//   }
//
//   serialize(writer: BufferWriter) {
//     const bitsPerEntry = this.bitsPerEntry;
//     writer.writeUByte(bitsPerEntry);
//
//     //  TODO: If palette
//     writer.writeVarInt(this.palette.length);
//     for (const id of this.palette) {
//       // TODO: Get actual block id
//       writer.writeVarInt(id);
//     }
//
//     const data = new CompactLongArray(bitsPerEntry, false, true, false);
//     // TODO: Loop through blocks in the correct order
//     // for (const num of dataArray) data.addData(num);
//     writer.writeVarInt(data.length).writeBlob(data.getBuffer());
//   }
// }
