import { ClientState } from '../ClientState';
import { PacketDirection } from './PacketDirection';
import { MinecraftClient } from '../../MinecraftClient';
import { Event } from 'decorator-events';

export abstract class Packet extends Event {
  get client(): MinecraftClient {
    throw new Error('Client can only be accessed on server-bound packets and inside of toBuffer');
  }
}

export type PacketClass<D extends PacketDirection = PacketDirection> = {
  readonly name: string;
  readonly packetId: number;
  readonly packetState: ClientState;
  readonly packetDirection: D;
  new (...args: any[]): Packet;
};

export function createPacket(
  id: number,
  direction: PacketDirection.CLIENT_BOUND,
  state: ClientState,
): PacketClass<PacketDirection.CLIENT_BOUND>;

export function createPacket(
  id: number,
  direction: PacketDirection.SERVER_BOUND,
  state: ClientState,
): PacketClass<PacketDirection.SERVER_BOUND>;

export function createPacket(
  id: number,
  direction: PacketDirection,
  state: ClientState,
): PacketClass {
  return class extends Packet {
    public static readonly packetId: number = id;
    public static readonly packetState: ClientState = state;
    public static readonly packetDirection: PacketDirection = direction;
  };
}
