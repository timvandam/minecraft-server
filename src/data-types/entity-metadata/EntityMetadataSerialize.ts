import { EntityMetadata } from './EntityMetadata';
import { EntityFieldType } from './EntityMetadataField';
import { BufferWriter } from '../BufferWriter';
import { NBTType } from '../nbt/NBTType';

export function serializeEntityMetadata(writer: BufferWriter, entity: EntityMetadata) {
  const rows = entity.toArray();
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const [type] = row;
    writer.writeUByte(i);
    writer.writeVarInt(type);
    // It is not possible to also destructure value. Its type isn't inferred correctly :/
    switch (type) {
      case EntityFieldType.BYTE:
        writer.writeByte(row[1]);
        break;
      case EntityFieldType.VARINT:
        writer.writeVarInt(row[1]);
        break;
      case EntityFieldType.FLOAT:
        writer.writeFloat(row[1]);
        break;
      case EntityFieldType.STRING:
        writer.writeString(row[1]);
        break;
      case EntityFieldType.CHAT:
        writer.writeChat(row[1]);
        break;
      case EntityFieldType.OPT_CHAT:
        if (row[1] === undefined) writer.writeBoolean(false);
        else writer.writeBoolean(true).writeChat(row[1]);
        break;
      case EntityFieldType.SLOT:
        if (row[1] === undefined) writer.writeBoolean(false);
        else {
          writer.writeBoolean(true).writeVarInt(row[1].itemId).writeByte(row[1].itemCount);
          if (row[1].nbt === undefined) writer.writeByte(NBTType.END);
          else writer.writeNbt(row[1].nbt);
        }
        break;
      case EntityFieldType.BOOLEAN:
        writer.writeBoolean(row[1]);
        break;
      case EntityFieldType.ROTATION:
        row[1].forEach((val) => writer.writeFloat(val));
        break;
      case EntityFieldType.POSITION:
        writer.writePosition(...row[1]);
        break;
      case EntityFieldType.OPT_POSITION:
        if (row[1] === undefined) writer.writeBoolean(false);
        else writer.writeBoolean(true).writePosition(...row[1]);
        break;
      case EntityFieldType.DIRECTION:
        writer.writeVarInt(row[1]);
        break;
      case EntityFieldType.OPT_UUID:
        if (row[1] === undefined) writer.writeBoolean(false);
        else writer.writeBoolean(true).writeUuid(row[1]);
        break;
      case EntityFieldType.OPT_BLOCKID:
        writer.writeVarInt(row[1] ?? 0);
        break;
      case EntityFieldType.NBT:
        writer.writeNbt(row[1]);
        break;
      case EntityFieldType.PARTICLE:
        writer.writeVarInt(row[1].id).writeBlob(row[1].data);
        break;
      case EntityFieldType.VILLAGER_DATA:
        row[1].forEach((val) => writer.writeVarInt(val));
        break;
      case EntityFieldType.OPT_VARINT:
        if (row[1] === undefined) writer.writeVarInt(0);
        else writer.writeVarInt(row[1] + 1);
        break;
      case EntityFieldType.POSE:
        writer.writeVarInt(row[1]);
        break;
    }
  }
  writer.writeUByte(0xff); // end of list
}
