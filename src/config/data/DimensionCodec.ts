import { Biome } from '../../world/Biome';

/**
 * @see {@link https://wiki.vg/Protocol#Join_Game}
 */
export type DimensionCodec = {
  'minecraft:dimension_type': {
    type: 'minecraft:dimension_type';
    value: DimensionTypeRegistryEntry[];
  };
  'minecraft:worldgen/biome': {
    type: 'minecraft:worldgen/biome';
    value: BiomeRegistryEntry[];
  };
};

export type DimensionTypeRegistryEntry = {
  name: string;
  id: number;
  element: DimensionType;
};

export type DimensionType = {
  piglin_safe: 1 | 0;
  natural: 1 | 0;
  /**
   * Float between 0 and 1
   */
  ambient_light: number;
  /**
   * Long between 0 and 24000
   */
  fixed_time?: bigint;
  infiniburn: string;
  respawn_anchor_works: 1 | 0;
  has_skylight: 1 | 0;
  bed_works: 1 | 0;
  effects: Dimension | string;
  has_raids: 1 | 0;
  min_y: number;
  height: number;
  /**
   * Int between 0 and 256
   */
  logical_height: number;
  /**
   * Float between 0.00001 and 30000000
   */
  coordinate_scale: number;
  ultrawarm: 1 | 0;
  has_ceiling: 1 | 0;
};

export type Dimension = 'minecraft:overworld' | 'minecraft:the_nether' | 'minecraft:the_end';

export type BiomeRegistryEntry = {
  name: string | `minecraft:${string}`;
  id: number;
  element: BiomeProperties;
};

export type BiomeProperties = {
  precipitation: 'rain' | 'snow' | 'none';
  depth: number;
  temperature: number;
  scale: number;
  downfall: number;
  category:
    | 'ocean'
    | 'plains'
    | 'desert'
    | 'forest'
    | 'extreme_hills'
    | 'taiga'
    | 'swamp'
    | 'river'
    | 'nether'
    | 'the_end'
    | 'icy'
    | 'mushroom'
    | 'beach'
    | 'jungle'
    | 'mesa'
    | 'savanna'
    | 'none'
    | string;
  temperature_modifier?: 'frozen' | string;
  effects: BiomeEffects;
};

export type BiomeEffects = {
  sky_color: number;
  water_fog_color: number;
  fog_color: number;
  water_color: number;
  foliage_color?: number;
  grass_color?: number;
  grass_color_modifier?: 'swamp' | 'dark_forest' | string;
  music?: {
    replace_current_music: 1 | 0;
    sound: `minecraft:ambient.${string}` | `minecraft:${string}` | string;
    max_delay: number;
    min_delay: number;
  };
  ambient_sound?: `minecraft:ambient.${string}` | `minecraft:${string}` | string;
  additions_sound?: {
    sound: string;
    tick_chance: number;
  };
  mood_sound?: {
    sound: string;
    tick_delay: number;
    offset: number;
    block_search_extent: number;
  };
  particle?: {
    probability: number;
    options: {
      type: `minecraft:${string}` | string;
    };
  };
};

export const dimensionCodec: DimensionCodec = {
  'minecraft:dimension_type': {
    type: 'minecraft:dimension_type',
    value: [
      {
        name: 'minecraft:overworld',
        id: 0,
        element: {
          piglin_safe: 0,
          natural: 1,
          ambient_light: 0.0,
          infiniburn: 'minecraft:infiniburn_overworld',
          respawn_anchor_works: 0,
          has_skylight: 1,
          bed_works: 1,
          effects: 'minecraft:overworld',
          has_raids: 1,
          min_y: 0,
          height: 256,
          logical_height: 256,
          coordinate_scale: 1.0,
          ultrawarm: 0,
          has_ceiling: 0,
        },
      },
      {
        name: 'minecraft:overworld_caves',
        id: 1,
        element: {
          piglin_safe: 0,
          natural: 1,
          ambient_light: 0.0,
          infiniburn: 'minecraft:infiniburn_overworld',
          respawn_anchor_works: 0,
          has_skylight: 1,
          bed_works: 1,
          effects: 'minecraft:overworld',
          has_raids: 1,
          min_y: 0,
          height: 256,
          logical_height: 256,
          coordinate_scale: 1.0,
          ultrawarm: 0,
          has_ceiling: 1,
        },
      },
      {
        name: 'minecraft:the_nether',
        id: 2,
        element: {
          piglin_safe: 1,
          natural: 0,
          ambient_light: 0.1,
          infiniburn: 'minecraft:infiniburn_nether',
          respawn_anchor_works: 1,
          has_skylight: 0,
          bed_works: 0,
          effects: 'minecraft:the_nether',
          fixed_time: 18000n,
          has_raids: 0,
          min_y: 0,
          height: 256,
          logical_height: 128,
          coordinate_scale: 8.0,
          ultrawarm: 1,
          has_ceiling: 1,
        },
      },
      {
        name: 'minecraft:the_end',
        id: 3,
        element: {
          piglin_safe: 0,
          natural: 0,
          ambient_light: 0.0,
          infiniburn: 'minecraft:infiniburn_end',
          respawn_anchor_works: 0,
          has_skylight: 0,
          bed_works: 0,
          effects: 'minecraft:the_end',
          fixed_time: 6000n,
          has_raids: 1,
          min_y: 0,
          height: 256,
          logical_height: 256,
          coordinate_scale: 1.0,
          ultrawarm: 0,
          has_ceiling: 0,
        },
      },
    ],
  },
  'minecraft:worldgen/biome': {
    type: 'minecraft:worldgen/biome',
    value: [
      {
        name: 'minecraft:ocean',
        id: Biome.OCEAN,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.0,
          temperature: 0.5,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
        },
      },
      {
        name: 'minecraft:plains',
        id: Biome.PLAINS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7907327,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.125,
          temperature: 0.8,
          scale: 0.05,
          downfall: 0.4,
          category: 'plains',
        },
      },
      {
        name: 'minecraft:desert',
        id: Biome.DESERT,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7254527,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.125,
          temperature: 2.0,
          scale: 0.05,
          downfall: 0.0,
          category: 'desert',
        },
      },
      {
        name: 'minecraft:mountains',
        id: Biome.MOUNTAINS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233727,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 1.0,
          temperature: 0.2,
          scale: 0.5,
          downfall: 0.3,
          category: 'extreme_hills',
        },
      },
      {
        name: 'minecraft:forest',
        id: Biome.FOREST,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7972607,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.7,
          scale: 0.2,
          downfall: 0.8,
          category: 'forest',
        },
      },
      {
        name: 'minecraft:taiga',
        id: Biome.TAIGA,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233983,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: 0.25,
          scale: 0.2,
          downfall: 0.8,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:swamp',
        id: Biome.SWAMP,
        element: {
          precipitation: 'rain',
          effects: {
            grass_color_modifier: 'swamp',
            sky_color: 7907327,
            foliage_color: 6975545,
            water_fog_color: 2302743,
            fog_color: 12638463,
            water_color: 6388580,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -0.2,
          temperature: 0.8,
          scale: 0.1,
          downfall: 0.9,
          category: 'swamp',
        },
      },
      {
        name: 'minecraft:river',
        id: Biome.RIVER,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -0.5,
          temperature: 0.5,
          scale: 0.0,
          downfall: 0.5,
          category: 'river',
        },
      },
      {
        name: 'minecraft:nether_wastes',
        id: Biome.NETHER_WASTES,
        element: {
          precipitation: 'none',
          effects: {
            music: {
              replace_current_music: 0,
              max_delay: 24000,
              sound: 'minecraft:music.nether.nether_wastes',
              min_delay: 12000,
            },
            sky_color: 7254527,
            ambient_sound: 'minecraft:ambient.nether_wastes.loop',
            additions_sound: {
              sound: 'minecraft:ambient.nether_wastes.additions',
              tick_chance: 0.0111,
            },
            water_fog_color: 329011,
            fog_color: 3344392,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.nether_wastes.mood',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 2.0,
          scale: 0.2,
          downfall: 0.0,
          category: 'nether',
        },
      },
      {
        name: 'minecraft:the_end',
        id: Biome.THE_END,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 0,
            water_fog_color: 329011,
            fog_color: 10518688,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.5,
          scale: 0.2,
          downfall: 0.5,
          category: 'the_end',
        },
      },
      {
        name: 'minecraft:frozen_ocean',
        id: Biome.FROZEN_OCEAN,
        element: {
          precipitation: 'snow',
          effects: {
            sky_color: 8364543,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 3750089,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.0,
          temperature: 0.0,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
          temperature_modifier: 'frozen',
        },
      },
      {
        name: 'minecraft:frozen_river',
        id: Biome.FROZEN_RIVER,
        element: {
          precipitation: 'snow',
          effects: {
            sky_color: 8364543,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 3750089,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -0.5,
          temperature: 0.0,
          scale: 0.0,
          downfall: 0.5,
          category: 'river',
        },
      },
      {
        name: 'minecraft:snowy_tundra',
        id: Biome.SNOWY_TUNDRA,
        element: {
          precipitation: 'snow',
          effects: {
            sky_color: 8364543,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.125,
          temperature: 0.0,
          scale: 0.05,
          downfall: 0.5,
          category: 'icy',
        },
      },
      {
        name: 'minecraft:snowy_mountains',
        id: Biome.SNOWY_MOUNTAINS,
        element: {
          precipitation: 'snow',
          effects: {
            sky_color: 8364543,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 0.0,
          scale: 0.3,
          downfall: 0.5,
          category: 'icy',
        },
      },
      {
        name: 'minecraft:mushroom_fields',
        id: Biome.MUSHROOM_FIELDS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7842047,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: 0.9,
          scale: 0.3,
          downfall: 1.0,
          category: 'mushroom',
        },
      },
      {
        name: 'minecraft:mushroom_field_shore',
        id: Biome.MUSHROOM_FIELD_SHORE,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7842047,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.0,
          temperature: 0.9,
          scale: 0.025,
          downfall: 1.0,
          category: 'mushroom',
        },
      },
      {
        name: 'minecraft:beach',
        id: Biome.BEACH,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7907327,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.0,
          temperature: 0.8,
          scale: 0.025,
          downfall: 0.4,
          category: 'beach',
        },
      },
      {
        name: 'minecraft:desert_hills',
        id: Biome.DESERT_HILLS,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7254527,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 2.0,
          scale: 0.3,
          downfall: 0.0,
          category: 'desert',
        },
      },
      {
        name: 'minecraft:wooded_hills',
        id: Biome.WOODED_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7972607,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 0.7,
          scale: 0.3,
          downfall: 0.8,
          category: 'forest',
        },
      },
      {
        name: 'minecraft:taiga_hills',
        id: Biome.TAIGA_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233983,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 0.25,
          scale: 0.3,
          downfall: 0.8,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:mountain_edge',
        id: Biome.MOUNTAIN_EDGE,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233727,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.8,
          temperature: 0.2,
          scale: 0.3,
          downfall: 0.3,
          category: 'extreme_hills',
        },
      },
      {
        name: 'minecraft:jungle',
        id: Biome.JUNGLE,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7842047,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.95,
          scale: 0.2,
          downfall: 0.9,
          category: 'jungle',
        },
      },
      {
        name: 'minecraft:jungle_hills',
        id: Biome.JUNGLE_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7842047,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 0.95,
          scale: 0.3,
          downfall: 0.9,
          category: 'jungle',
        },
      },
      {
        name: 'minecraft:jungle_edge',
        id: Biome.JUNGLE_EDGE,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7842047,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.95,
          scale: 0.2,
          downfall: 0.8,
          category: 'jungle',
        },
      },
      {
        name: 'minecraft:deep_ocean',
        id: Biome.DEEP_OCEAN,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.8,
          temperature: 0.5,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
        },
      },
      {
        name: 'minecraft:stone_shore',
        id: Biome.STONE_SHORE,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233727,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.2,
          scale: 0.8,
          downfall: 0.3,
          category: 'none',
        },
      },
      {
        name: 'minecraft:snowy_beach',
        id: Biome.SNOWY_BEACH,
        element: {
          precipitation: 'snow',
          effects: {
            sky_color: 8364543,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4020182,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.0,
          temperature: 0.05,
          scale: 0.025,
          downfall: 0.3,
          category: 'beach',
        },
      },
      {
        name: 'minecraft:birch_forest',
        id: Biome.BIRCH_FOREST,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8037887,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.6,
          scale: 0.2,
          downfall: 0.6,
          category: 'forest',
        },
      },
      {
        name: 'minecraft:birch_forest_hills',
        id: Biome.BIRCH_FOREST_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8037887,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 0.6,
          scale: 0.3,
          downfall: 0.6,
          category: 'forest',
        },
      },
      {
        name: 'minecraft:dark_forest',
        id: Biome.DARK_FOREST,
        element: {
          precipitation: 'rain',
          effects: {
            grass_color_modifier: 'dark_forest',
            sky_color: 7972607,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.7,
          scale: 0.2,
          downfall: 0.8,
          category: 'forest',
        },
      },
      {
        name: 'minecraft:snowy_taiga',
        id: Biome.SNOWY_TAIGA,
        element: {
          precipitation: 'snow',
          effects: {
            sky_color: 8625919,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4020182,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: -0.5,
          scale: 0.2,
          downfall: 0.4,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:snowy_taiga_hills',
        id: Biome.SNOWY_TAIGA_HILLS,
        element: {
          precipitation: 'snow',
          effects: {
            sky_color: 8625919,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4020182,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: -0.5,
          scale: 0.3,
          downfall: 0.4,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:giant_tree_taiga',
        id: Biome.GIANT_TREE_TAIGA,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8168447,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: 0.3,
          scale: 0.2,
          downfall: 0.8,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:giant_tree_taiga_hills',
        id: Biome.GIANT_TREE_TAIGA_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8168447,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 0.3,
          scale: 0.3,
          downfall: 0.8,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:wooded_mountains',
        id: Biome.WOODED_MOUNTAINS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233727,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 1.0,
          temperature: 0.2,
          scale: 0.5,
          downfall: 0.3,
          category: 'extreme_hills',
        },
      },
      {
        name: 'minecraft:savanna',
        id: Biome.SAVANNA,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7711487,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.125,
          temperature: 1.2,
          scale: 0.05,
          downfall: 0.0,
          category: 'savanna',
        },
      },
      {
        name: 'minecraft:savanna_plateau',
        id: Biome.SAVANNA_PLATEAU,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7776511,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 1.5,
          temperature: 1.0,
          scale: 0.025,
          downfall: 0.0,
          category: 'savanna',
        },
      },
      {
        name: 'minecraft:badlands',
        id: Biome.BADLANDS,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7254527,
            grass_color: 9470285,
            foliage_color: 10387789,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 2.0,
          scale: 0.2,
          downfall: 0.0,
          category: 'mesa',
        },
      },
      {
        name: 'minecraft:wooded_badlands_plateau',
        id: Biome.WOODED_BADLANDS_PLATEAU,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7254527,
            grass_color: 9470285,
            foliage_color: 10387789,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 1.5,
          temperature: 2.0,
          scale: 0.025,
          downfall: 0.0,
          category: 'mesa',
        },
      },
      {
        name: 'minecraft:badlands_plateau',
        id: Biome.BADLANDS_PLATEAU,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7254527,
            grass_color: 9470285,
            foliage_color: 10387789,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 1.5,
          temperature: 2.0,
          scale: 0.025,
          downfall: 0.0,
          category: 'mesa',
        },
      },
      {
        name: 'minecraft:small_end_islands',
        id: Biome.SMALL_END_ISLANDS,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 0,
            water_fog_color: 329011,
            fog_color: 10518688,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.5,
          scale: 0.2,
          downfall: 0.5,
          category: 'the_end',
        },
      },
      {
        name: 'minecraft:end_midlands',
        id: Biome.END_MIDLANDS,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 0,
            water_fog_color: 329011,
            fog_color: 10518688,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.5,
          scale: 0.2,
          downfall: 0.5,
          category: 'the_end',
        },
      },
      {
        name: 'minecraft:end_highlands',
        id: Biome.END_HIGHLANDS,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 0,
            water_fog_color: 329011,
            fog_color: 10518688,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.5,
          scale: 0.2,
          downfall: 0.5,
          category: 'the_end',
        },
      },
      {
        name: 'minecraft:end_barrens',
        id: Biome.END_BARRENS,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 0,
            water_fog_color: 329011,
            fog_color: 10518688,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.5,
          scale: 0.2,
          downfall: 0.5,
          category: 'the_end',
        },
      },
      {
        name: 'minecraft:warm_ocean',
        id: Biome.WARM_OCEAN,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 270131,
            fog_color: 12638463,
            water_color: 4445678,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.0,
          temperature: 0.5,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
        },
      },
      {
        name: 'minecraft:lukewarm_ocean',
        id: Biome.LUKEWARM_OCEAN,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 267827,
            fog_color: 12638463,
            water_color: 4566514,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.0,
          temperature: 0.5,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
        },
      },
      {
        name: 'minecraft:cold_ocean',
        id: Biome.COLD_OCEAN,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4020182,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.0,
          temperature: 0.5,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
        },
      },
      {
        name: 'minecraft:deep_warm_ocean',
        id: Biome.DEEP_WARM_OCEAN,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 270131,
            fog_color: 12638463,
            water_color: 4445678,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.8,
          temperature: 0.5,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
        },
      },
      {
        name: 'minecraft:deep_lukewarm_ocean',
        id: Biome.DEEP_LUKEWARM_OCEAN,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 267827,
            fog_color: 12638463,
            water_color: 4566514,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.8,
          temperature: 0.5,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
        },
      },
      {
        name: 'minecraft:deep_cold_ocean',
        id: Biome.DEEP_COLD_OCEAN,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4020182,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.8,
          temperature: 0.5,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
        },
      },
      {
        name: 'minecraft:deep_frozen_ocean',
        id: Biome.DEEP_FROZEN_OCEAN,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8103167,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 3750089,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -1.8,
          temperature: 0.5,
          scale: 0.1,
          downfall: 0.5,
          category: 'ocean',
          temperature_modifier: 'frozen',
        },
      },
      {
        name: 'minecraft:the_void',
        id: Biome.THE_VOID,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 8103167,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.5,
          scale: 0.2,
          downfall: 0.5,
          category: 'none',
        },
      },
      {
        name: 'minecraft:sunflower_plains',
        id: Biome.SUNFLOWER_PLAINS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7907327,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.125,
          temperature: 0.8,
          scale: 0.05,
          downfall: 0.4,
          category: 'plains',
        },
      },
      {
        name: 'minecraft:desert_lakes',
        id: Biome.DESERT_LAKES,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7254527,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.225,
          temperature: 2.0,
          scale: 0.25,
          downfall: 0.0,
          category: 'desert',
        },
      },
      {
        name: 'minecraft:gravelly_mountains',
        id: Biome.GRAVELLY_MOUNTAINS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233727,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 1.0,
          temperature: 0.2,
          scale: 0.5,
          downfall: 0.3,
          category: 'extreme_hills',
        },
      },
      {
        name: 'minecraft:flower_forest',
        id: Biome.FLOWER_FOREST,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7972607,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.7,
          scale: 0.4,
          downfall: 0.8,
          category: 'forest',
        },
      },
      {
        name: 'minecraft:taiga_mountains',
        id: Biome.TAIGA_MOUNTAINS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233983,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.3,
          temperature: 0.25,
          scale: 0.4,
          downfall: 0.8,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:swamp_hills',
        id: Biome.SWAMP_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            grass_color_modifier: 'swamp',
            sky_color: 7907327,
            foliage_color: 6975545,
            water_fog_color: 2302743,
            fog_color: 12638463,
            water_color: 6388580,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: -0.1,
          temperature: 0.8,
          scale: 0.3,
          downfall: 0.9,
          category: 'swamp',
        },
      },
      {
        name: 'minecraft:ice_spikes',
        id: Biome.ICE_SPIKES,
        element: {
          precipitation: 'snow',
          effects: {
            sky_color: 8364543,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.425,
          temperature: 0.0,
          scale: 0.45000002,
          downfall: 0.5,
          category: 'icy',
        },
      },
      {
        name: 'minecraft:modified_jungle',
        id: Biome.MODIFIED_JUNGLE,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7842047,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: 0.95,
          scale: 0.4,
          downfall: 0.9,
          category: 'jungle',
        },
      },
      {
        name: 'minecraft:modified_jungle_edge',
        id: Biome.MODIFIED_JUNGLE_EDGE,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7842047,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: 0.95,
          scale: 0.4,
          downfall: 0.8,
          category: 'jungle',
        },
      },
      {
        name: 'minecraft:tall_birch_forest',
        id: Biome.TALL_BIRCH_FOREST,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8037887,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: 0.6,
          scale: 0.4,
          downfall: 0.6,
          category: 'forest',
        },
      },
      {
        name: 'minecraft:tall_birch_hills',
        id: Biome.TALL_BIRCH_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8037887,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.55,
          temperature: 0.6,
          scale: 0.5,
          downfall: 0.6,
          category: 'forest',
        },
      },
      {
        name: 'minecraft:dark_forest_hills',
        id: Biome.DARK_FOREST_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            grass_color_modifier: 'dark_forest',
            sky_color: 7972607,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: 0.7,
          scale: 0.4,
          downfall: 0.8,
          category: 'forest',
        },
      },
      {
        name: 'minecraft:snowy_taiga_mountains',
        id: Biome.SNOWY_TAIGA_MOUNTAINS,
        element: {
          precipitation: 'snow',
          effects: {
            sky_color: 8625919,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4020182,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.3,
          temperature: -0.5,
          scale: 0.4,
          downfall: 0.4,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:giant_spruce_taiga',
        id: Biome.GIANT_SPRUCE_TAIGA,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233983,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: 0.25,
          scale: 0.2,
          downfall: 0.8,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:giant_spruce_taiga_hills',
        id: Biome.GIANT_SPRUCE_TAIGA_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233983,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.2,
          temperature: 0.25,
          scale: 0.2,
          downfall: 0.8,
          category: 'taiga',
        },
      },
      {
        name: 'minecraft:modified_gravelly_mountains',
        id: Biome.MODIFIED_GRAVELLY_MOUNTAINS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 8233727,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 1.0,
          temperature: 0.2,
          scale: 0.5,
          downfall: 0.3,
          category: 'extreme_hills',
        },
      },
      {
        name: 'minecraft:shattered_savanna',
        id: Biome.SHATTERED_SAVANNA,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7776767,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.3625,
          temperature: 1.1,
          scale: 1.225,
          downfall: 0.0,
          category: 'savanna',
        },
      },
      {
        name: 'minecraft:shattered_savanna_plateau',
        id: Biome.SHATTERED_SAVANNA_PLATEAU,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7776511,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 1.05,
          temperature: 1.0,
          scale: 1.2125001,
          downfall: 0.0,
          category: 'savanna',
        },
      },
      {
        name: 'minecraft:eroded_badlands',
        id: Biome.ERODED_BADLANDS,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7254527,
            grass_color: 9470285,
            foliage_color: 10387789,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 2.0,
          scale: 0.2,
          downfall: 0.0,
          category: 'mesa',
        },
      },
      {
        name: 'minecraft:modified_wooded_badlands_plateau',
        id: Biome.MODIFIED_WOODED_BADLANDS_PLATEAU,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7254527,
            grass_color: 9470285,
            foliage_color: 10387789,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 2.0,
          scale: 0.3,
          downfall: 0.0,
          category: 'mesa',
        },
      },
      {
        name: 'minecraft:modified_badlands_plateau',
        id: Biome.MODIFIED_BADLANDS_PLATEAU,
        element: {
          precipitation: 'none',
          effects: {
            sky_color: 7254527,
            grass_color: 9470285,
            foliage_color: 10387789,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 2.0,
          scale: 0.3,
          downfall: 0.0,
          category: 'mesa',
        },
      },
      {
        name: 'minecraft:bamboo_jungle',
        id: Biome.BAMBOO_JUNGLE,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7842047,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 0.95,
          scale: 0.2,
          downfall: 0.9,
          category: 'jungle',
        },
      },
      {
        name: 'minecraft:bamboo_jungle_hills',
        id: Biome.BAMBOO_JUNGLE_HILLS,
        element: {
          precipitation: 'rain',
          effects: {
            sky_color: 7842047,
            water_fog_color: 329011,
            fog_color: 12638463,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.cave',
              block_search_extent: 8,
            },
          },
          depth: 0.45,
          temperature: 0.95,
          scale: 0.3,
          downfall: 0.9,
          category: 'jungle',
        },
      },
      {
        name: 'minecraft:soul_sand_valley',
        id: Biome.SOUL_SAND_VALLEY,
        element: {
          precipitation: 'none',
          effects: {
            music: {
              replace_current_music: 0,
              max_delay: 24000,
              sound: 'minecraft:music.nether.soul_sand_valley',
              min_delay: 12000,
            },
            sky_color: 7254527,
            ambient_sound: 'minecraft:ambient.soul_sand_valley.loop',
            additions_sound: {
              sound: 'minecraft:ambient.soul_sand_valley.additions',
              tick_chance: 0.0111,
            },
            particle: {
              probability: 0.00625,
              options: {
                type: 'minecraft:ash',
              },
            },
            water_fog_color: 329011,
            fog_color: 1787717,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.soul_sand_valley.mood',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 2.0,
          scale: 0.2,
          downfall: 0.0,
          category: 'nether',
        },
      },
      {
        name: 'minecraft:crimson_forest',
        id: Biome.CRIMSON_FOREST,
        element: {
          precipitation: 'none',
          effects: {
            music: {
              replace_current_music: 0,
              max_delay: 24000,
              sound: 'minecraft:music.nether.crimson_forest',
              min_delay: 12000,
            },
            sky_color: 7254527,
            ambient_sound: 'minecraft:ambient.crimson_forest.loop',
            additions_sound: {
              sound: 'minecraft:ambient.crimson_forest.additions',
              tick_chance: 0.0111,
            },
            particle: {
              probability: 0.025,
              options: {
                type: 'minecraft:crimson_spore',
              },
            },
            water_fog_color: 329011,
            fog_color: 3343107,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.crimson_forest.mood',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 2.0,
          scale: 0.2,
          downfall: 0.0,
          category: 'nether',
        },
      },
      {
        name: 'minecraft:warped_forest',
        id: Biome.WARPED_FOREST,
        element: {
          precipitation: 'none',
          effects: {
            music: {
              replace_current_music: 0,
              max_delay: 24000,
              sound: 'minecraft:music.nether.warped_forest',
              min_delay: 12000,
            },
            sky_color: 7254527,
            ambient_sound: 'minecraft:ambient.warped_forest.loop',
            additions_sound: {
              sound: 'minecraft:ambient.warped_forest.additions',
              tick_chance: 0.0111,
            },
            particle: {
              probability: 0.01428,
              options: {
                type: 'minecraft:warped_spore',
              },
            },
            water_fog_color: 329011,
            fog_color: 1705242,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.warped_forest.mood',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 2.0,
          scale: 0.2,
          downfall: 0.0,
          category: 'nether',
        },
      },
      {
        name: 'minecraft:basalt_deltas',
        id: Biome.BASALT_DELTAS,
        element: {
          precipitation: 'none',
          effects: {
            music: {
              replace_current_music: 0,
              max_delay: 24000,
              sound: 'minecraft:music.nether.basalt_deltas',
              min_delay: 12000,
            },
            sky_color: 7254527,
            ambient_sound: 'minecraft:ambient.basalt_deltas.loop',
            additions_sound: {
              sound: 'minecraft:ambient.basalt_deltas.additions',
              tick_chance: 0.0111,
            },
            particle: {
              probability: 0.118093334,
              options: {
                type: 'minecraft:white_ash',
              },
            },
            water_fog_color: 4341314,
            fog_color: 6840176,
            water_color: 4159204,
            mood_sound: {
              tick_delay: 6000,
              offset: 2.0,
              sound: 'minecraft:ambient.basalt_deltas.mood',
              block_search_extent: 8,
            },
          },
          depth: 0.1,
          temperature: 2.0,
          scale: 0.2,
          downfall: 0.0,
          category: 'nether',
        },
      },
    ],
  },
};
