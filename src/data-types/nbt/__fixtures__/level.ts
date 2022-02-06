import { readFile } from 'fs/promises';
import { byte, compound, float, int, list, short } from '../NBTSerialize';
import { resolve } from 'path';

export const name = 'level';

export const getActualNbtBuffer = () => readFile(resolve(__dirname, './nbt/level.nbt'));

export const nbtValue = compound({
  '': {
    Data: {
      raining: byte(0),
      RandomSeed: 3142388825013346304n,
      SpawnX: int(0),
      SpawnZ: int(0),
      LastPlayed: 1323133681772n,
      GameType: int(1),
      SpawnY: int(63),
      MapFeatures: byte(1),
      Player: {
        XpTotal: int(0),
        abilities: {
          instabuild: int(1),
          flying: int(1),
          mayfly: int(1),
          invulnerable: int(1),
        },
        XpLevel: int(0),
        Score: int(0),
        Health: short(20),
        Inventory: list.compound(
          {
            Count: byte(1),
            Slot: byte(0),
            id: short(24),
            Damage: short(0),
          },
          {
            Count: byte(1),
            Slot: byte(1),
            id: short(25),
            Damage: short(0),
          },
          {
            Count: byte(1),
            Slot: byte(2),
            id: short(326),
            Damage: short(0),
          },
          {
            Count: byte(1),
            Slot: byte(3),
            id: short(29),
            Damage: short(0),
          },
          {
            Count: byte(10),
            Slot: byte(4),
            id: short(69),
            Damage: short(0),
          },
          {
            Count: byte(3),
            Slot: byte(5),
            id: short(33),
            Damage: short(0),
          },
          {
            Count: byte(43),
            Slot: byte(6),
            id: short(356),
            Damage: short(0),
          },
          {
            Count: byte(64),
            Slot: byte(7),
            id: short(331),
            Damage: short(0),
          },
          {
            Count: byte(20),
            Slot: byte(8),
            id: short(76),
            Damage: short(0),
          },
          {
            Count: byte(64),
            Slot: byte(9),
            id: short(331),
            Damage: short(0),
          },
          {
            Count: byte(1),
            Slot: byte(10),
            id: short(323),
            Damage: short(0),
          },
          {
            Count: byte(16),
            Slot: byte(11),
            id: short(331),
            Damage: short(0),
          },
          {
            Count: byte(1),
            Slot: byte(12),
            id: short(110),
            Damage: short(0),
          },
        ),
        HurtTime: short(0),
        Fire: short(-20),
        foodExhaustionLevel: float(0),
        foodSaturationLevel: float(5),
        foodTickTimer: int(0),
        SleepTimer: short(0),
        DeathTime: short(0),
        Rotation: list.float(1151.9342041015625, 32.249679565429688),
        XpP: float(0),
        FallDistance: float(0),
        Air: short(300),
        Motion: list.double(-2.9778325794951344e-11, -0.078400001525878907, 1.1763942772801152e-11),
        Dimension: int(0),
        OnGround: byte(1),
        Pos: list.double(256.87499499518492, 112.62000000476837, -34.578128612797634),
        Sleeping: byte(0),
        AttackTime: short(0),
        foodLevel: int(20),
      },
      thunderTime: int(2724),
      version: int(19132),
      rainTime: int(5476),
      Time: 128763n,
      thundering: byte(1),
      hardcore: byte(0),
      SizeOnDisk: 0n,
      LevelName: 'Sandstone Test World',
    },
  },
});
