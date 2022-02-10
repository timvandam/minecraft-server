import { EventHandler } from 'decorator-events';
import { DiggingStatus, PlayerDigging } from '../../packets/packets/server-bound/PlayerDigging';
import { AcknowledgePlayerDigging } from '../../packets/packets/client-bound/AcknowledgePlayerDigging';
import { SpawnEntity } from '../../packets/packets/client-bound/SpawnEntity';
import { v3 as uuid } from 'uuid';
import { SetEntityMetadata } from '../../packets/packets/client-bound/SetEntityMetadata';
import { ItemEntityMetadata } from '../../data-types/entity-metadata/entities/ItemEntityMetadata';
import { EntityFeature } from '../../data-types/entity-metadata/EntityMetadata';

export class DigListener {
  @EventHandler
  startDigging({ client, x, y, z, status }: PlayerDigging) {
    if (status !== DiggingStatus.STARTED_DIGGING) return;
    // TODO
    client.write(new AcknowledgePlayerDigging(x, y, z, 0, status, true));
  }

  @EventHandler
  finishDigging({ client, status, x, y, z }: PlayerDigging) {
    if (status !== DiggingStatus.FINISHED_DIGGING) return;
    const entityId = Math.floor(Math.random() * 1000000);
    client.write(
      new SpawnEntity(
        entityId,
        uuid(new Date().toString(), Buffer.alloc(16), Buffer.alloc(16)),
        41,
        x + 0.5,
        y + 0.5,
        z + 0.5,
        0,
        0,
        100,
        0,
        0,
        0,
      ),
    );
    const meta = new ItemEntityMetadata(2, 1);
    client.write(new SetEntityMetadata(entityId, meta));
  }
}
