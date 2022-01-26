import { Packet, PacketClass } from './createPacket';
import { PacketDirection } from './PacketDirection';
import { ClientState } from '../ClientState';

export type ServerBoundPacketClass = PacketClass<PacketDirection.SERVER_BOUND> & {
  fromBuffer(buffer: Buffer): Packet;
};

export type ClientBoundPacketClass = PacketClass<PacketDirection.CLIENT_BOUND> & {
  toBuffer(packet: Packet): Buffer;
};

type RegisterPacketClass = ServerBoundPacketClass | ClientBoundPacketClass;

type Registry = {
  [packetId: number]: {
    [packetDirection in PacketDirection]?: {
      [packetState in ClientState]?: RegisterPacketClass;
    };
  };
};

const registry: Registry = {};

export function registerPacket(packetClass: RegisterPacketClass): void {
  const { packetId, packetDirection, packetState } = packetClass;

  if (registry[packetId]?.[packetDirection]?.[packetState]) {
    throw new Error(
      `A packet with packetId-packetState-packetDirection ${packetId}-${ClientState[packetState]}-${PacketDirection[packetDirection]} has already been registered! (Attempted to register Packet class with name ${packetClass.name})`,
    );
  }

  registry[packetId] ??= {};
  registry[packetId][packetDirection] ??= {};
  registry[packetId][packetDirection]![packetState] = packetClass;
}

export function getPacketClass(
  packetId: number,
  direction: PacketDirection.SERVER_BOUND,
  state: ClientState,
): ServerBoundPacketClass | undefined;

export function getPacketClass(
  packetId: number,
  direction: PacketDirection.CLIENT_BOUND,
  state: ClientState,
): ClientBoundPacketClass | undefined;

export function getPacketClass(
  packetId: number,
  direction: PacketDirection,
  state: ClientState,
): PacketClass | undefined {
  return registry[packetId]?.[direction]?.[state];
}
