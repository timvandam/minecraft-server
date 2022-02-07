#!/usr/bin/env ts-node

// Small script used to generate packet classes

import { writeFileSync, existsSync } from 'fs';
import { ClientState } from './src/packets/ClientState';
import { PacketDirection } from './src/packets/packets/PacketDirection';
import { resolve } from 'path';

const getFileContents = (
  name: string,
  packetId: number,
  direction: PacketDirection,
  state: ClientState,
): string => {
  let packetDirectionStr = 'PacketDirection.';
  switch (direction) {
    case PacketDirection.SERVER_BOUND:
      packetDirectionStr += 'SERVER_BOUND';
      break;
    case PacketDirection.CLIENT_BOUND:
      packetDirectionStr += 'CLIENT_BOUND';
      break;

    default:
      throw new Error(`Unknown packet direction ${PacketDirection[direction]} (${direction})`);
  }

  let clientStateStr = 'ClientState.';
  switch (state) {
    case ClientState.HANDSHAKING:
      clientStateStr += 'HANDSHAKING';
      break;
    case ClientState.STATUS:
      clientStateStr += 'STATUS';
      break;
    case ClientState.LOGIN:
      clientStateStr += 'LOGIN';
      break;
    case ClientState.PLAY:
      clientStateStr += 'PLAY';
      break;

    default:
      throw new Error(`Unknown client state ${ClientState[state]} (${state})`);
  }

  let bufferFnStr = '';
  let bufferImportStr = '';
  switch (direction) {
    case PacketDirection.CLIENT_BOUND:
      bufferImportStr = "import { BufferWriter } from '../../../data-types/BufferWriter';";
      bufferFnStr = `
  static toBuffer(packet: ${name}): Buffer {
    const writer = new BufferWriter();
    /** TODO: write */
    return writer.getBuffer();
  }
`.slice(1, -1);
      break;

    case PacketDirection.SERVER_BOUND:
      bufferImportStr = "import { BufferReader } from '../../../data-types/BufferReader';";
      bufferFnStr = `
  static fromBuffer(buf: Buffer): ${name} {
    const reader = new BufferReader(buf);
    /** TODO: read */
    return new ${name}();
  }
`.slice(1, -1);
      break;
  }

  return `
import { ClientState } from '../../ClientState';
import { registerPacket } from '../PacketRegistry';
import { PacketDirection } from '../PacketDirection';
import { createPacket } from '../createPacket';
${bufferImportStr}

export class ${name} extends createPacket(
  0x${packetId.toString(16).padStart(2, '0')},
  ${packetDirectionStr},
  ${clientStateStr},
) {
  constructor(
    /** TODO */
  ) {
    super();
  }

  static {
    registerPacket(this);
  }

${bufferFnStr}
}
`.trimStart();
};

const helpText = `
create-packet [name] [id] [direction] [state]

Example:
create-packet PluginMessage 0x0a server play

Directions:
- server | s
- client | c

States:
- status | s
- handshaking | handshake | h
- login | l
- play | p
`.trimStart();

const checkName = (str: string): string => {
  if (!/^[A-Za-z]+$/.test(str)) {
    console.log(helpText);
    console.log('Invalid packet name! Must only use letters');
    process.exit(1);
  }
  return str;
};

const checkPacketId = (str: string): number => {
  const num = Number(str);
  if (Number.isNaN(num) || num < 0 || num > 0xff) {
    console.log(helpText);
    console.log('Invalid packet id! Must be a positive integer no larger than 255');
    process.exit(1);
  }
  return num;
};

const dirs: Partial<Record<string, PacketDirection>> = {
  server: PacketDirection.SERVER_BOUND,
  s: PacketDirection.SERVER_BOUND,
  client: PacketDirection.CLIENT_BOUND,
  c: PacketDirection.CLIENT_BOUND,
};
const checkPacketDirection = (str: string): PacketDirection => {
  const dir = dirs[str];
  if (dir === undefined) {
    console.log(helpText);
    console.log('Invalid packet direction');
    process.exit(1);
  }
  return dir;
};

const states: Partial<Record<string, ClientState>> = {
  play: ClientState.PLAY,
  p: ClientState.PLAY,
  login: ClientState.LOGIN,
  l: ClientState.LOGIN,
  handshaking: ClientState.HANDSHAKING,
  handshake: ClientState.HANDSHAKING,
  h: ClientState.HANDSHAKING,
  status: ClientState.STATUS,
  s: ClientState.STATUS,
};
const checkClientState = (str: string): ClientState => {
  const state = states[str];
  if (state === undefined) {
    console.log(helpText);
    console.log('Invalid client state');
    process.exit(1);
  }
  return state;
};

const name = checkName(process.argv[2]?.trim());
const packetId = checkPacketId(process.argv[3]?.trim());
const packetDirection = checkPacketDirection(process.argv[4]?.trim());
const clientState = checkClientState(process.argv[5]?.trim());

const fileDir = {
  [PacketDirection.CLIENT_BOUND]: 'client-bound',
  [PacketDirection.SERVER_BOUND]: 'server-bound',
}[packetDirection];

const filePath = resolve(__dirname, './src/packets/packets', fileDir, `${name}.ts`);
if (existsSync(filePath)) {
  console.log(
    `There is already a packet with name '${name}'. Delete that first if you want to override it`,
  );
  process.exit(1);
}
writeFileSync(filePath, getFileContents(name, packetId, packetDirection, clientState));
console.log(`Done! file://${filePath}`);
