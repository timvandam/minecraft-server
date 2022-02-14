import { EventHandler, EventPriority } from 'decorator-events';
import { ClientBoundKeepAlive } from '../../packets/packets/client-bound/ClientBoundKeepAlive';
import { ServerBoundKeepAlive } from '../../packets/packets/server-bound/ServerBoundKeepAlive';
import { chat } from '../../data-types/Chat';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { MinecraftClient } from '../../MinecraftClient';
import { DisconnectPlay } from '../../packets/packets/client-bound/DisconnectPlay';
import { keepAliveBox } from '../../box/ClientBoxes';

export class TimeoutListener {
  protected sendKeepAlive(client: MinecraftClient) {
    const keepAliveId = BigInt(Math.floor(Math.random() * 1000000));
    client.storage.put(keepAliveBox, { keepAliveId });
    client.write(new ClientBoundKeepAlive(keepAliveId));

    setTimeout(() => {
      if (client.storage.get(keepAliveBox)?.keepAliveId === keepAliveId) {
        client.write(new DisconnectPlay('Timed out'));
      }
    }, 30 * 1000);
  }

  @EventHandler
  timeout(packet: ServerBoundKeepAlive) {
    if (packet.keepAliveId !== packet.client.storage.get(keepAliveBox)?.keepAliveId) {
      packet.client.write(new DisconnectPlay(chat.red`Timed out`));
      return;
    }

    packet.client.storage.delete(keepAliveBox);

    setTimeout(() => {
      this.sendKeepAlive(packet.client);
    }, 5 * 1000);
  }

  @EventHandler({ priority: EventPriority.HIGHEST })
  login(packet: LoginStart) {
    this.sendKeepAlive(packet.client);
  }
}
