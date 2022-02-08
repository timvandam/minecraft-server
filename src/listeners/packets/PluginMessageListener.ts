import { EventHandler } from 'decorator-events';
import { ServerBoundPluginMessage } from '../../packets/packets/server-bound/ServerBoundPluginMessage';

export class PluginMessageListener {
  @EventHandler
  message(packet: ServerBoundPluginMessage) {
    console.log(
      `Received plugin message for channel ${packet.channel}: ${packet.data.toString('utf8')}`,
    );
  }
}
