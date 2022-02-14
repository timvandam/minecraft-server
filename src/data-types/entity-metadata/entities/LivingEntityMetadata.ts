import { EntityMetadata } from '../EntityMetadata';
import { EntityFieldType, EntityMetadataField } from '../EntityMetadataField';

export enum HandState {
  HAND_ACTIVE = 0x01,
  OFFHAND_ACTIVE = 0x02,
  RIPTIDE_SPIN_ATTACK = 0x04,
}

export class LivingEntityMetadata extends EntityMetadata {
  // TODO: also include parent
  constructor(
    public readonly handState: HandState = 0,
    public readonly health: number = 1,
    public readonly potionEffectColor: number = 0,
    public readonly potionEffectAmbient: boolean = false,
    public readonly arrowCount: number = 0,
    public readonly beeStingerCount = 0,
    public readonly currentBedLocation?: [x: number, y: number, z: number],
  ) {
    super();
  }

  toArray(): EntityMetadataField[] {
    return [
      ...super.toArray(),
      [EntityFieldType.BYTE, this.handState],
      [EntityFieldType.FLOAT, this.health],
      [EntityFieldType.VARINT, this.potionEffectColor],
      [EntityFieldType.BOOLEAN, this.potionEffectAmbient],
      [EntityFieldType.VARINT, this.arrowCount],
      [EntityFieldType.VARINT, this.beeStingerCount],
      [EntityFieldType.OPT_POSITION, this.currentBedLocation],
    ];
  }
}
