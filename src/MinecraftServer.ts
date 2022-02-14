import { EventBus } from 'decorator-events';
import { Duplex } from 'stream';
import net from 'net';
import { Deserializer } from './packets/io/Deserializer';
import { MinecraftClient } from './MinecraftClient';
import { packetListeners } from './listeners/packets';
import { MinecraftConfig } from './config/MinecraftConfig';
import { BoxStorage } from './box/BoxStorage';
import { clientsBox } from './box/ServerBoxes';

export type MinecraftServerOptions = {
  port: number;
  listeners: object[];
};

export const defaultMinecraftServerOptions: MinecraftServerOptions = {
  port: 25565,
  listeners: [],
};

export class MinecraftServer {
  public storage = new BoxStorage(); // TODO: store stuff here. also clients

  public readonly options: MinecraftServerOptions;
  // TODO: Client list?
  protected readonly server = new net.Server();
  // TODO: Create default listeners with monitor handlers
  protected readonly eventBus = new EventBus();
  protected readonly packetBus = new EventBus();

  constructor(
    options: Partial<MinecraftServerOptions> = {},
    public readonly config: MinecraftConfig = new MinecraftConfig(),
  ) {
    this.options = { ...defaultMinecraftServerOptions, ...options };
    this.eventBus.register(this.options.listeners);
    this.packetBus.register(...packetListeners);
    this.storage.put(clientsBox, new Set<MinecraftClient>());

    this.server.on('connection', async (socket) => {
      socket.on('error', (error) => {
        console.log('Socket error:', error);
      });

      const client = new MinecraftClient(this, socket, this.packetBus);
      this.storage.getOrThrow(clientsBox).add(client);
      socket.on('end', () => {
        this.storage.getOrThrow(clientsBox).delete(client);
      });
    });
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen({ port: this.options.port }, () => {
        resolve();
      });
    });
  }
}
