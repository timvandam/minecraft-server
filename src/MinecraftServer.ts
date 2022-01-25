import { EventBus } from 'decorator-events';
import net from 'net';

export type MinecraftServerOptions = {
  port: number;
  listeners: object[];
};

export const defaultMinecraftServerOptions: MinecraftServerOptions = {
  port: 25565,
  listeners: [],
};

export class MinecraftServer {
  public readonly options: MinecraftServerOptions;
  // TODO: Create default listeners with monitor handlers
  protected readonly server = new net.Server();
  protected readonly eventBus = new EventBus();

  constructor(options: Partial<MinecraftServerOptions> = {}) {
    this.options = { ...defaultMinecraftServerOptions, ...options };
    this.eventBus.register(this.options.listeners);
  }

  start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen({ port: this.options.port }, () => {
        resolve();
      });
    });
  }
}
