import { EventHandler } from 'decorator-events';
import { ClientSettings } from '../../packets/packets/server-bound/ClientSettings';
import { UpdateViewDistance } from '../../packets/packets/client-bound/UpdateViewDistance';

export class PlayerSettingsListener {
  @EventHandler
  async clientSettings(packet: ClientSettings) {
    console.log('Got client settings', packet.viewDistance, 'sending it back');
    packet.client.renderDistance = packet.viewDistance;
    packet.client.write(new UpdateViewDistance(packet.viewDistance));
  }
}
