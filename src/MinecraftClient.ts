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
import { BoxStorage } from './box/BoxStorage';
import { clientStateBox } from './box/ClientBoxes';

export class MinecraftClient {
  public storage = new BoxStorage();

  public dimension: DimensionTypeRegistryEntry = this.server.config.dimensionCodec[
    'minecraft:dimension_type'
  ].value.find((x) => x.name === 'minecraft:overworld')!;
  // TODO: Dimension in box

  protected serializer = Duplex.from((packets: AsyncIterable<Packet>) => Serializer(this, packets));
  protected deserializer = Duplex.from((buffers: AsyncIterable<Buffer>) =>
    Deserializer(this, buffers),
  );
  protected packetEmitter = Duplex.from(async (packets: AsyncIterable<Packet>) => {
    for await (const packet of packets) {
      // console.log('Incoming', packet.constructor.name);
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
    this.storage.put(clientStateBox, ClientState.HANDSHAKING);
  }

  write(packet: Packet): Promise<void> {
    return new Promise((resolve) => {
      // console.log('Outgoing', packet.constructor.name);
      Object.defineProperty(packet, 'client', { value: this });
      this.serializer.write(packet, () => resolve());
    });
  }
}
