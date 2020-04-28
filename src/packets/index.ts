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
import UUID from '../DataTypes/UUID'
import Bool from '../DataTypes/Bool'
import Optional from '../DataTypes/Optional'
import LArray from '../DataTypes/LArray'
import { NBT } from '../DataTypes/NBT'
import { UByte } from '../DataTypes/UByte'
import { Int } from '../DataTypes/Int'

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

// TODO: Arrays. Instead of Oc make it O(C) and works for all
const alphabet: Map<string, DataTypeConstructor> = new Map()
  .set('V', VarInt)
  .set('S', LString)
  .set('Us', UShort)
  .set('L', Long)
  .set('Lb', LByteArray)
  .set('C', Chat)
  .set('U', UUID)
  .set('B', Bool)
  .set('Nbt', NBT)
  .set('Ub', UByte)
  // .set('P', Position)
  .set('I', Int)

const fns: Map<string, Function> = new Map()
  .set('O', Optional)
  .set('A', LArray)

export function readStruct (struct: string): any[] {
  const result: any[] = []
  const letters = struct.split('')

  let symbol = ''
  while (letters.length) {
    const letter = letters.shift() as string
    const next = letters[0] ?? ''
    symbol += letter
    if (next !== '(' && next.toUpperCase() === next) {
      const DT = alphabet.get(symbol)
      if (DT === undefined) throw new Error(`Invalid symbol '${symbol}'`)
      result.push(DT)
      symbol = ''
      continue
    } else if (next !== '(' && next.toLowerCase() === next) continue

    const FN = fns.get(symbol)
    if (FN) {
      let functionParam = ''
      const stack = [letters.shift()] // add the first (
      if (stack[0] !== '(') throw new Error('Functions must open with a (!')
      while (stack.length) {
        const nextChar = letters.shift()
        functionParam += nextChar
        if (nextChar === '(') stack.push('(')
        else if (nextChar === ')') stack.pop()
      }
      functionParam = functionParam.slice(0, -1) // remove the last character, as it is a )
      result.push(FN(...readStruct(functionParam)))
      symbol = ''
      continue
    }

    throw new Error(`Invalid symbol '${letter}'!`)
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
