import * as net from 'net';
import { ClientState } from './packets/ClientState';
import { Duplex, pipeline } from 'stream';
import { Deserializer } from './packets/io/Deserializer';
import { EventBus } from 'decorator-events';
import { Serializer } from './packets/io/Serializer';
import { Packet } from './packets/packets/createPacket';
import * as Buffer from 'buffer';

export class MinecraftClient {
  public state: ClientState = ClientState.HANDSHAKING;

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
      console.log('Incoming', packet);
      await this.packetBus.emit(packet);
    }
  });

  constructor(public readonly socket: net.Socket, protected readonly packetBus: EventBus) {
    // pipeline(this.serializer, this.socket, this.deserializer, this.packetEmitter).resume();
    this.serializer.pipe(this.socket).pipe(this.deserializer).pipe(this.packetEmitter).resume();
  }

  write(packet: Packet): Promise<void> {
    return new Promise((resolve) => {
      console.log('Outgoing', packet);
      this.serializer.write(packet, () => resolve());
    });
  }
}
