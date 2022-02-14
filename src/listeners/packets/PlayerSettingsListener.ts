import { EventHandler, EventPriority } from 'decorator-events';
import { ClientSettings } from '../../packets/packets/server-bound/ClientSettings';
import { UpdateViewDistance } from '../../packets/packets/client-bound/UpdateViewDistance';
import { playerSettingsBox } from '../../box/ClientBoxes';

export class PlayerSettingsListener {
  @EventHandler({ priority: EventPriority.LOWEST })
  clientSettings({
    client,
    viewDistance,
    displayedSkinParts,
    chatMode,
    allowServerListing,
  }: ClientSettings) {
    client.storage.put(playerSettingsBox, {
      chatMode,
      allowServerListing,
      renderDistance: viewDistance,
      skinParts: displayedSkinParts,
    });
    client.write(new UpdateViewDistance(viewDistance));
  }
}
