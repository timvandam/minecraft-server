import { ClientState } from './ClientState';
import { PacketDirection } from './PacketDirection';

const registry: Record<number, PacketClass | undefined> = {};

type PacketClass<T = unknown> = {
  readonly name: string;
  readonly packetId: number;
  readonly packetState: ClientState;
} & (
  | {
      readonly packetDirection: PacketDirection.SERVER_BOUND;
      fromBuffer(buffer: Buffer): T;
    }
  | {
      readonly packetDirection: PacketDirection.CLIENT_BOUND;
      toBuffer(packet: T): Buffer;
    }
);

export function registerPacket<T>(packetClass: PacketClass<T>): void {
  if (registry[packetClass.packetId]) {
    throw new Error(
      `A packet with packetId ${packetClass.packetId} has already been registered! (Attempted to register Packet class with name ${packetClass.name})`,
    );
  }

  registry[packetClass.packetId] = packetClass;
}

export const packetRegistry: Readonly<Record<number, PacketClass | undefined>> = registry;
