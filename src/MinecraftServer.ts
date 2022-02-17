import { EventBus } from 'decorator-events';
import { Duplex } from 'stream';
import net from 'net';
import { Deserializer } from './packets/io/Deserializer';
import { MinecraftClient } from './MinecraftClient';
import { packetListeners } from './listeners/packets';
import { MinecraftConfig } from './config/MinecraftConfig';
import { BoxStorage } from './box/BoxStorage';
import { clientsBox } from './box/ServerBoxes';
import { playerSettingsBox, positionBox } from './box/ClientBoxes';
import { Packet } from './packets/packets/createPacket';
import { playerIsInRange } from './util/players';

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
  protected readonly server = new net.Server();
  protected readonly eventBus = new EventBus();
  protected readonly packetBus = new EventBus();

  constructor(
    options: Partial<MinecraftServerOptions> = {},
    public readonly config: MinecraftConfig = new MinecraftConfig(),
  ) {
    this.options = { ...defaultMinecraftServerOptions, ...options };
    this.eventBus.register(...this.options.listeners); // TDO: Register default listeners
    this.packetBus.register(...packetListeners);
    this.storage.put(clientsBox, new Set<MinecraftClient>());

    this.server.on('connection', async (socket) => {
      socket.on('error', (error) => {
        console.log('Socket error:', error);
      });

      const client = new MinecraftClient(this, socket, this.packetBus);
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

  /**
   * Sends a packet to all connected players
   */
  broadcast(packet: Packet, except?: MinecraftClient) {
    for (const client of this.storage.getOrThrow(clientsBox)) {
      if (client === except) continue;
      client.write(packet);
    }
  }

  /**
   * Sends a packet to all players for which the given player is within render distance
   */
  broadcastNearby(player: MinecraftClient, packet: Packet) {
    for (const otherPlayer of this.storage.getOrThrow(clientsBox)) {
      if (otherPlayer === player) continue;
      if (!playerIsInRange(otherPlayer, player)) continue;
      otherPlayer.write(packet);
    }
  }
}
