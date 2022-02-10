import { EntityMetadataField, EntityFieldType, Pose } from './EntityMetadataField';
import { Chat } from '../Chat';

export enum EntityFeature {
  ON_FIRE = 0x01,
  CROUCHING = 0x02,
  SPRINTING = 0x04,
  SWIMMING = 0x08,
  INVISIBLE = 0x10,
  GLOWING = 0x20,
  ELYTRA_FLYING = 0x80,
}

export type EntityClass<T extends EntityMetadata> = {
  new (...args: any[]): T;
  fromArray(fields: EntityMetadataField[]): T;
};

export abstract class EntityMetadata {
  public features: EntityFeature = 0;
  public airTicks = 300;
  public customName?: string | Chat;
  public customNameVisible = false;
  public silent = false;
  public noGravity = false;
  public pose: Pose = Pose.STANDING;
  public frozenTicks = 0;

  toArray(): EntityMetadataField[] {
    return [
      [EntityFieldType.BYTE, this.features],
      [EntityFieldType.VARINT, this.airTicks],
      [EntityFieldType.OPT_CHAT, this.customName],
      [EntityFieldType.BOOLEAN, this.customNameVisible],
      [EntityFieldType.BOOLEAN, this.silent],
      [EntityFieldType.BOOLEAN, this.noGravity],
      [EntityFieldType.POSE, this.pose],
      [EntityFieldType.VARINT, this.frozenTicks],
    ];
  }
}
