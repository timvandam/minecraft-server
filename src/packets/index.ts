import fs from 'fs'
import path from 'path'
import { ESocketState } from '../enums/ESocketState'
import { DataTypeConstructor } from '../DataTypes/DataType'
import VarInt from '../DataTypes/VarInt'
import LString from '../DataTypes/LString'
import UShort from '../DataTypes/UShort'
import logger from '../logger'
import Long from '../DataTypes/Long'
import LByteArray from '../DataTypes/LByteArray'
import Chat from '../DataTypes/Chat'

export interface Packet {
  name: string;
  packetId: number;
  state: ESocketState;
  struct: DataTypeConstructor[];
}

export interface PacketData {
  packetId?: number;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
}

const alphabet: Map<string, DataTypeConstructor> = new Map()
  .set('V', VarInt)
  .set('S', LString)
  .set('Us', UShort)
  .set('L', Long)
  .set('Lb', LByteArray)
  .set('C', Chat)

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

interface PacketsById {
  [key: number]: Packet;
}

interface PacketsByName {
  [key: string]: Packet;
}

// Packets by socket state by T
interface PacketsByESocketState<T> {
  [key: number]: T;
}

/**
 * Fetches all packets in a directory (by packet id and by name)
 */
async function getPackets (directory: string): Promise<{ byId: PacketsByESocketState<PacketsById>; byName: PacketsByESocketState<PacketsByName> }> {
  try {
    const dir = await fs.promises.opendir(directory)

    const byId: PacketsByESocketState<PacketsById> = {}
    const byName: PacketsByESocketState<PacketsByName> = {}

    for await (const dirent of dir) {
      if (!dirent.isFile()) continue
      if (path.extname(dirent.name) !== '.json') continue
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const schema = require(path.resolve(directory, dirent.name))
      schema.struct = readStruct(schema.struct)
      const packet: Packet = schema
      packet.name = path.basename(dirent.name, '.json')
      const { packetId, state } = packet
      if (!byId[state]) {
        byId[state] = {}
        byName[state] = {}
      }
      byId[state][packetId] = packet
      byName[state][packet.name] = packet
    }

    return { byId, byName }
  } catch (error) {
    logger.error(`Could not load packets in directory ${directory} - ${error.message}`)
    logger.verbose(error.stack)
    return { byId: {}, byName: {} }
  }
}

export const incomingPackets = getPackets(path.resolve(__dirname, './incoming')).then(result => result.byId)
export const outgoingPackets = getPackets(path.resolve(__dirname, './outgoing')).then(result => result.byName)
