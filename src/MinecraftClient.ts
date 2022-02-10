import * as net from 'net';
import { ClientState } from './packets/ClientState';
import { Duplex } from 'stream';
import { Deserializer } from './packets/io/Deserializer';
import { EventBus } from 'decorator-events';
import { Serializer } from './packets/io/Serializer';
import { Packet } from './packets/packets/createPacket';
import * as Buffer from 'buffer';
import { MinecraftServer } from './MinecraftServer';
import { DimensionTypeRegistryEntry } from './config/data/DimensionCodec';

export class MinecraftClient {
  public state: ClientState = ClientState.HANDSHAKING;
  public position = { x: 10, y: 64, z: 10, yaw: 0, pitch: 0, onGround: true };
  public renderDistance = 2;
  public dimension: DimensionTypeRegistryEntry = this.server.config.dimensionCodec[
    'minecraft:dimension_type'
  ].value.find((x) => x.name === 'minecraft:overworld')!;
  // TODO: Maybe put all the above in their own object (public, rest protected)

  public compressionThreshold = 0;
  get compression() {
    return this.compressionThreshold > 0;
  }

  protected serializer = Duplex.from((packets: AsyncIterable<Packet>) => Serializer(this, packets));
  protected deserializer = Duplex.from((buffers: AsyncIterable<Buffer>) =>
    Deserializer(this, buffers),
  );
  protected packetEmitter = Duplex.from(async (packets: AsyncIterable<Packet>) => {
    for await (const packet of packets) {
      console.log('Incoming', packet.constructor.name);
      Object.defineProperty(packet, 'client', { value: this });
      await this.packetBus.emit(packet);
    }
  });

  constructor(
    public readonly server: MinecraftServer,
    protected readonly socket: net.Socket,
    protected readonly packetBus: EventBus,
  ) {
    this.serializer.pipe(this.socket).pipe(this.deserializer).pipe(this.packetEmitter).resume();
  }

  write(packet: Packet): Promise<void> {
    return new Promise((resolve) => {
      console.log('Outgoing', packet.constructor.name);
      Object.defineProperty(packet, 'client', { value: this });
      this.serializer.write(packet, () => resolve());
    });
  }
}
