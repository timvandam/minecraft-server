import fs from 'fs'
import path from 'path'
import { ESocketState } from '../enums/ESocketState'
import { DataTypeConstructor } from '../DataTypes/DataType'
import VarInt from '../DataTypes/VarInt'
import LString from '../DataTypes/LString'
import UShort from '../DataTypes/UShort'
import logger from '../logger'

export interface Packet {
  name: string;
  packetId: number;
  state: ESocketState;
  struct: DataTypeConstructor[];
}

export interface PacketData {
  packetId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

const alphabet: Map<string, DataTypeConstructor> = new Map()
  .set('V', VarInt)
  .set('S', LString)
  .set('Us', UShort)

export function readStruct (struct: string): DataTypeConstructor[] {
  const result: DataTypeConstructor[] = []

  let symbol = ''
  for (let i = 0; i < struct.length + 1; i++) {
    const letter = struct.charAt(i)
    if (letter === letter.toUpperCase() || letter === '') {
      // This is the start of a new datatype, flush the old one
      if (symbol !== '') {
        const datatype = alphabet.get(symbol)
        if (!datatype) throw new Error(`Invalid symbol found in struct: ${symbol}`)
        result.push(datatype)
      }
      symbol = ''
    }
    symbol += letter
  }

  return result
}

interface PacketById {
  [key: number]: Packet;
}

interface PacketByESocketStateById {
  [key: number]: PacketById;
}

/**
 * Fetches all packets in a directory
 */
async function getPackets (directory: string): Promise<PacketByESocketStateById> {
  try {
    const dir = await fs.promises.opendir(directory)

    const packets: PacketByESocketStateById = {}

    for await (const dirent of dir) {
      if (!dirent.isFile()) continue
      if (path.extname(dirent.name) !== '.json') continue
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const schema = require(path.resolve(directory, dirent.name))
      schema.struct = readStruct(schema.struct)
      const packet: Packet = schema
      const { packetId, state } = packet
      if (!packets[state]) packets[state] = {}
      packets[state][packetId] = packet
    }

    return packets
  } catch (error) {
    logger.error(`Could not load packets in directory ${directory} - ${error.message}`)
    logger.verbose(error.stack)
    return {}
  }
}

export const incomingPackets = getPackets(path.resolve(__dirname, './incoming'))
export const outgoingPackets = getPackets(path.resolve(__dirname, './outgoing'))
