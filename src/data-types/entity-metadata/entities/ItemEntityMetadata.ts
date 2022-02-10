import { EntityMetadata } from '../EntityMetadata';
import { EntityFieldType, EntityMetadataField } from '../EntityMetadataField';
import { NBTCompound } from '../../nbt';

export class ItemEntityMetadata extends EntityMetadata {
  // TODO: also include parent
  constructor(
    public readonly itemId: number,
    public readonly itemCount: number,
    public readonly nbt?: NBTCompound,
  ) {
    super();
  }

  toArray(): EntityMetadataField[] {
    return [
      ...super.toArray(),
      [EntityFieldType.SLOT, { itemId: this.itemId, itemCount: this.itemCount, nbt: this.nbt }],
    ];
  }
}
