import { PacketDirection } from './PacketDirection';
import { ClientState } from '../ClientState';
import { Packet, PacketClass } from './createPacket';

export type ServerBoundPacketClass = PacketClass<PacketDirection.SERVER_BOUND> & {
  fromBuffer(buffer: Buffer): Packet;
};

export type ClientBoundPacketClass = PacketClass<PacketDirection.CLIENT_BOUND> & {
  toBuffer(packet: Packet): Buffer;
};

/**
 * Omit constructor because it can be protected/private if need be
 */
type RegisterPacketClass = Omit<ServerBoundPacketClass | ClientBoundPacketClass, 'constructor'>;

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
      `Can't register packet '${packetClass.name}'. A packet named '${registry[packetId]?.[packetDirection]?.[packetState]?.name}' is already registered for its packetId, state and direction`,
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
): RegisterPacketClass | undefined {
  return registry[packetId]?.[direction]?.[state];
}
