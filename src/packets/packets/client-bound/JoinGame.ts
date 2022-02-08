import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
import { BufferWriter } from '../../../data-types/BufferWriter';
import { byte, compound, double, float, int, list, NBTCompound } from '../../../data-types/nbt';
import { BiomeEffects, BiomeProperties, DimensionType } from '../../../config/data/DimensionCodec';

export enum Gamemode {
  SURVIVAL = 0,
  CREATIVE = 1,
  ADVENTURE = 2,
  SPECTATOR = 3,
}

export class JoinGame extends createPacket(0x26, PacketDirection.CLIENT_BOUND, ClientState.PLAY) {
  constructor(
    public readonly entityId: number,
    public readonly isHardcore: boolean,
    public readonly gamemode: Gamemode,
    public readonly previousGamemode: Gamemode | undefined,
    public readonly dimensionNames: string[],
    public readonly dimension: DimensionType,
    public readonly dimensionName: string,
    public readonly hashedSeed: bigint,
    public readonly maxPlayers: number,
    public readonly viewDistance: number,
    public readonly simulationDistance: number,
    public readonly reducedDebugInfo: boolean,
    public readonly enableRespawnScreen: boolean,
    public readonly isDebug: boolean,
    public readonly isFlat: boolean,
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

  protected getDimensionCodec(): NBTCompound {
    return compound({
      '': {
        'minecraft:dimension_type': this.getDimensionTypeRegistryCompound(),
        'minecraft:worldgen/biome': this.getBiomeRegistryCompound(),
      },
    });
  }

  protected getDimensionTypeRegistryCompound(): NBTCompound {
    return compound({
      type: 'minecraft:dimension_type',
      value: list.compound(
        ...this.client.server.config.dimensionCodec['minecraft:dimension_type'].value.map(
          ({ name, id, element }) => ({
            name,
            id: int(id),
            element: this.getDimensionTypeRegistryEntryCompound(element),
          }),
        ),
      ),
    });
  }

  protected getDimensionTypeRegistryEntryCompound(element: DimensionType): NBTCompound {
    const obj: Parameters<typeof compound>[0] & Partial<Record<keyof DimensionType, unknown>> = {
      piglin_safe: byte(element.piglin_safe),
      natural: byte(element.natural),
      ambient_light: float(element.ambient_light),
      infiniburn: element.infiniburn,
      respawn_anchor_works: byte(element.respawn_anchor_works),
      has_skylight: byte(element.has_skylight),
      bed_works: byte(element.bed_works),
      effects: element.effects,
      has_raids: byte(element.has_raids),
      min_y: int(element.min_y),
      height: int(element.height),
      logical_height: int(element.logical_height),
      coordinate_scale: float(element.coordinate_scale),
      ultrawarm: byte(element.ultrawarm),
      has_ceiling: byte(element.has_ceiling),
    };

    if (element.fixed_time !== undefined) {
      obj.fixed_time = element.fixed_time;
    }

    return compound(obj);
  }

  protected getBiomeRegistryCompound(): NBTCompound {
    return compound({
      type: 'minecraft:worldgen/biome',
      value: list.compound(
        ...this.client.server.config.dimensionCodec['minecraft:worldgen/biome'].value.map(
          ({ name, id, element }) => ({
            name,
            id: int(id),
            element: this.getBiomePropertiesCompound(element),
          }),
        ),
      ),
    });
  }

  protected getBiomePropertiesCompound(element: BiomeProperties): NBTCompound {
    const obj: Parameters<typeof compound>[0] & Partial<Record<keyof BiomeProperties, unknown>> = {
      precipitation: element.precipitation,
      depth: float(element.depth),
      temperature: float(element.temperature),
      scale: float(element.scale),
      downfall: float(element.downfall),
      category: element.category,
      effects: this.getBiomeEffectsCompound(element.effects),
    };

    if (element.temperature_modifier !== undefined) {
      obj.temperature_modifier = element.temperature_modifier;
    }

    return compound(obj);
  }

  protected getBiomeEffectsCompound(element: BiomeEffects): NBTCompound {
    const obj: Parameters<typeof compound>[0] & Partial<Record<keyof BiomeEffects, unknown>> = {
      sky_color: int(element.sky_color),
      water_fog_color: int(element.water_fog_color),
      fog_color: int(element.fog_color),
      water_color: int(element.water_color),
    };

    if (element.foliage_color !== undefined) {
      obj.foliage_color = int(element.foliage_color);
    }

    if (element.grass_color !== undefined) {
      obj.grass_color = int(element.grass_color);
    }

    if (element.grass_color_modifier !== undefined) {
      obj.grass_color_modifier = element.grass_color_modifier;
    }

    if (element.music !== undefined) {
      obj.music = {
        replace_current_music: byte(element.music.replace_current_music),
        sound: element.music.sound,
        max_delay: int(element.music.max_delay),
        min_delay: int(element.music.min_delay),
      };
    }

    if (element.ambient_sound !== undefined) {
      obj.ambient_sound = element.ambient_sound;
    }

    if (element.additions_sound !== undefined) {
      obj.additions_sound = {
        sound: element.additions_sound.sound,
        tick_chance: double(element.additions_sound.tick_chance),
      };
    }

    if (element.mood_sound !== undefined) {
      obj.mood_sound = {
        sound: element.mood_sound.sound,
        tick_delay: int(element.mood_sound.tick_delay),
        offset: double(element.mood_sound.offset),
        block_search_extent: int(element.mood_sound.block_search_extent),
      };
    }

    if (element.particle !== undefined) {
      obj.particle = {
        probability: float(element.particle.probability),
        options: { type: element.particle.options.type },
      };
    }

    return compound(obj);
  }

  static toBuffer(packet: JoinGame): Buffer {
    const writer = new BufferWriter();
    writer
      .writeInt(packet.entityId)
      .writeBoolean(packet.isHardcore)
      .writeUByte(packet.gamemode)
      .writeByte(packet.previousGamemode ?? -1)
      .writeVarInt(packet.dimensionNames.length);

    for (const name of packet.dimensionNames) writer.writeString(name);

    writer
      .writeNbt(packet.getDimensionCodec())
      .writeNbt(compound({ '': packet.getDimensionTypeRegistryEntryCompound(packet.dimension) }))
      .writeString(packet.dimensionName)
      .writeLong(packet.hashedSeed)
      .writeVarInt(packet.maxPlayers)
      .writeVarInt(packet.viewDistance)
      .writeVarInt(packet.simulationDistance)
      .writeBoolean(packet.reducedDebugInfo)
      .writeBoolean(packet.enableRespawnScreen)
      .writeBoolean(packet.isDebug)
      .writeBoolean(packet.isFlat);

    return writer.getBuffer();
  }
}
