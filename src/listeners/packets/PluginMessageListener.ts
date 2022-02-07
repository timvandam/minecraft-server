import { EventHandler } from 'decorator-events';
import { PluginMessage } from '../../packets/packets/server-bound/PluginMessage';

export class PluginMessageListener {
  @EventHandler
  message(packet: PluginMessage) {
    console.log(
      `Received plugin message for channel ${packet.channel}: ${packet.data.toString('utf8')}`,
    );
  }
}
