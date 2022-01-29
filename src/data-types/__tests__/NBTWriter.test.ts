import { nbt, short, byte, int, list, float, double, byteArray } from '../NBTWriter';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';

const inflate = promisify(zlib.inflate);
const gunzip = promisify(zlib.gunzip);

const decompress = (buf: Buffer) => {
  return inflate(buf)
    .catch(() => gunzip(buf))
    .catch(() => buf);
};

describe('https://wiki.vg/NBT#Examples', () => {
  it('TAG_Short', () => {
    expect(nbt('shortTest', short(32767))).toEqual(
      Buffer.of(0x02, 0x00, 0x09, 0x73, 0x68, 0x6f, 0x72, 0x74, 0x54, 0x65, 0x73, 0x74, 0x7f, 0xff),
    );
  });

  it.each([
    { fileName: 'hello_world.nbt', nbt: nbt('hello world', { name: 'Bananrama' }) },
    {
      fileName: 'level.nbt',
      nbt: nbt('', {
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
            Motion: list.double(
              -2.9778325794951344e-11,
              -0.078400001525878907,
              1.1763942772801152e-11,
            ),
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
      }),
    },
    {
      fileName: 'bigtest.nbt',
      nbt: nbt('Level', {
        longTest: 9223372036854775807n,
        shortTest: short(32767),
        stringTest: 'HELLO WORLD THIS IS A TEST STRING \xc5\xc4\xd6!',
        floatTest: float(0.49823147058486938),
        intTest: int(2147483647),
        'nested compound test': {
          ham: {
            name: 'Hampus',
            value: float(0.75),
          },
          egg: {
            name: 'Eggbert',
            value: float(0.5),
          },
        },
        'listTest (long)': list.long(11n, 12n, 13n, 14n, 15n),
        'listTest (compound)': list.compound(
          {
            name: 'Compound tag #0',
            'created-on': 1264099775885n,
          },
          {
            name: 'Compound tag #1',
            'created-on': 1264099775885n,
          },
        ),
        byteTest: byte(127),
        'byteArrayTest (the first 1000 values of (n*n*255+n*7)%100, starting with n=0 (0, 62, 34, 16, 8, ...))':
          byteArray(Array.from({ length: 1000 }, (_, i) => (i * i * 255 + i * 7) % 100)),
        doubleTest: double(0.49312871321823148),
      }),
    },
  ])('$fileName', async ({ fileName, nbt }) => {
    const file = await readFile(resolve(__dirname, '../__fixtures__/', fileName));
    const buf = await decompress(file);
    expect(nbt).toEqual(buf);
  });
});
