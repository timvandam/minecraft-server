import * as net from 'net';
import { ClientState } from './packets/ClientState';
import { Duplex, Readable } from 'stream';
import { Deserializer } from './packets/io/Deserializer';
import { EventBus } from 'decorator-events';
import { Packet } from './packets/packets/createPacket';
import { MinecraftServer } from './MinecraftServer';
import { DimensionTypeRegistryEntry } from './config/data/DimensionCodec';
import { Serializer } from './packets/io/Serializer';
import { AsyncBuffer } from './packets/io/AsyncBuffer';

export class MinecraftClient {
  public state: ClientState = ClientState.HANDSHAKING;
  public position = { x: 10, y: 64, z: 10, yaw: 0, pitch: 0, onGround: true };
  public renderDistance = 2;
  public dimension: DimensionTypeRegistryEntry =
    this.server.config.dimensionCodec['minecraft:dimension_type'].value[0];
  // TODO: Maybe put all the above in their own object (public, rest protected)

  public compressionThreshold = 0;
  get compression() {
    return this.compressionThreshold > 0;
  }

  protected serializer = new Serializer(this);
  protected deserializer = Readable.from(Deserializer(this, new AsyncBuffer(this.socket)));
  protected packetEmitter = Duplex.from(async (packets: AsyncIterable<Packet>) => {
    for await (const packet of packets) {
      // console.log('Incoming', packet);
      Object.defineProperty(packet, 'client', { value: this });
      await this.packetBus.emit(packet);
    }
  });

  constructor(
    public readonly server: MinecraftServer,
    protected readonly socket: net.Socket,
    protected readonly packetBus: EventBus,
  ) {
    this.serializer.pipe(this.socket);
    this.deserializer.pipe(this.packetEmitter).resume();
  }

  write(packet: Packet): Promise<void> {
    return new Promise((resolve) => {
      // console.log('Outgoing', packet);
      Object.defineProperty(packet, 'client', { value: this });
      this.serializer.write(packet, () => resolve());
    });
  }
}
