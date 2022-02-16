import { EntityFieldType, EntityMetadataField } from '../EntityMetadataField';
import { NBTCompound } from '../../nbt';
import { LivingEntityMetadata } from './LivingEntityMetadata';
import { Hand, SkinPart } from '../../../packets/packets/server-bound/ClientSettings';

export class PlayerEntityMetadata extends LivingEntityMetadata {
  // TODO: also include parent
  constructor(
    public readonly additionalHearts: number = 0,
    public readonly score: number = 0,
    public readonly displayedSkinParts: SkinPart,
    public readonly mainHand: Hand, //TODO:Only 1 hand enum
    public readonly leftShoulderEntityData: NBTCompound = new NBTCompound({}),
    public readonly rightShoulderEntityData: NBTCompound = new NBTCompound({}),
  ) {
    super();
  }

  toArray(): EntityMetadataField[] {
    return [
      ...super.toArray(),
      [EntityFieldType.FLOAT, this.additionalHearts],
      [EntityFieldType.VARINT, this.score],
      [EntityFieldType.BYTE, this.displayedSkinParts],
      [EntityFieldType.BYTE, this.mainHand],
      // TODO: Refactor all of the entity stuff. Don't require these fields
      [EntityFieldType.NBT, this.leftShoulderEntityData],
      [EntityFieldType.NBT, this.rightShoulderEntityData],
    ];
  }
}
