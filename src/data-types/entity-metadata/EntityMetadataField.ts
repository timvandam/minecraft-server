import { Chat } from '../Chat';
import { NBTCompound } from '../nbt';

export enum EntityFieldType {
  BYTE = 0,
  VARINT = 1,
  FLOAT = 2,
  STRING = 3,
  CHAT = 4,
  OPT_CHAT = 5,
  SLOT = 6,
  BOOLEAN = 7,
  ROTATION = 8,
  POSITION = 9,
  OPT_POSITION = 10,
  DIRECTION = 11,
  OPT_UUID = 12,
  OPT_BLOCKID = 13,
  NBT = 14,
  PARTICLE = 15,
  VILLAGER_DATA = 16,
  OPT_VARINT = 17,
  POSE = 18,
}

export type EntityMetadataField =
  | [EntityFieldType.BYTE, number]
  | [EntityFieldType.VARINT, number]
  | [EntityFieldType.FLOAT, number]
  | [EntityFieldType.STRING, string]
  | [EntityFieldType.CHAT, string | Chat]
  | [EntityFieldType.OPT_CHAT, string | Chat | undefined]
  | [EntityFieldType.SLOT, undefined | { itemId: number; itemCount: number; nbt?: NBTCompound }] // TODO: Maybe NBTValue
  | [EntityFieldType.BOOLEAN, boolean]
  | [EntityFieldType.ROTATION, [x: number, y: number, z: number]]
  | [EntityFieldType.POSITION, [x: number, y: number, z: number]]
  | [EntityFieldType.OPT_POSITION, [x: number, y: number, z: number] | undefined]
  | [EntityFieldType.DIRECTION, Direction]
  | [EntityFieldType.OPT_UUID, Buffer | undefined]
  | [EntityFieldType.OPT_BLOCKID, number | undefined]
  | [EntityFieldType.NBT, NBTCompound] // TODO: Maybe NBTValue
  | [EntityFieldType.PARTICLE, { id: number; data: Buffer }] // TODO: class Particle { private id: number; toBuffer() {} }
  | [EntityFieldType.VILLAGER_DATA, [type: number, profession: number, level: number]]
  | [EntityFieldType.OPT_VARINT, number | undefined]
  | [EntityFieldType.POSE, Pose];

export enum Direction {
  DOWN = 0,
  UP = 1,
  NORTH = 2,
  SOUTH = 3,
  WEST = 4,
  EAST = 5,
}

export enum Pose {
  STANDING = 0,
  FALL_FLYING = 1,
  SLEEPING = 2,
  SWIMMING = 3,
  SPIN_ATTACK = 4,
  SNEAKING = 5,
  LONG_JUMPING = 6,
  DYING = 7,
}
