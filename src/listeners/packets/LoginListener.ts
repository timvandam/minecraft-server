import { EventHandler } from 'decorator-events';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { SetCompression } from '../../packets/packets/client-bound/SetCompression';
import { LoginSuccess } from '../../packets/packets/client-bound/LoginSuccess';
import { ClientState } from '../../packets/ClientState';
import { v3 as uuid } from 'uuid';
import { Gamemode, JoinGame } from '../../packets/packets/client-bound/JoinGame';
import { PlayerPositionAndLook } from '../../packets/packets/client-bound/PlayerPositionAndLook';
import { Explosion } from '../../packets/packets/client-bound/Explosion';
import { ChunkDataAndUpdateLight } from '../../packets/packets/client-bound/ChunkDataAndUpdateLight';
import { UpdateViewPosition } from '../../packets/packets/client-bound/UpdateViewPosition';
import { KeepAlive } from '../../packets/packets/client-bound/KeepAlive';
import { ClientBoundPluginMessage } from '../../packets/packets/client-bound/ClientBoundPluginMessage';
import { ClientBoundHeldItemChange } from '../../packets/packets/client-bound/ClientBoundHeldItemChange';
import { DeclareRecipes } from '../../packets/packets/client-bound/DeclareRecipes';

export class LoginListener {
  @EventHandler
  async loginStart(packet: LoginStart) {
    console.log('loginstart by', packet.username);

    // return packet.client.write(
    //   new Disconnect(chat.red`${chat.bold`Work in progress!`} Come back later`),
    // );

    // packet.client.write(new EncryptionRequest());
    await packet.client.write(new SetCompression(1));
    packet.client.compressionThreshold = 1;

    // TODO: Store in the client
    const userUuid = uuid(`OfflinePlayer:${packet.username}`, Buffer.alloc(16), Buffer.alloc(16));
    await packet.client.write(new LoginSuccess(userUuid, packet.username));
    packet.client.state = ClientState.PLAY;

    await packet.client.write(
      new JoinGame(
        227,
        false,
        Gamemode.CREATIVE,
        undefined,
        packet.client.server.config.dimensionCodec['minecraft:dimension_type'].value.map(
          ({ name }) => name,
        ), // TODO: better types
        // TODO: Don't provide this as compound but just as objects
        packet.client.dimension.element,
        packet.client.dimension.name,
        123n,
        420,
        16,
        16,
        false,
        true,
        false,
        false,
      ),
    );

    await packet.client.write(
      new ClientBoundPluginMessage(
        'minecraft:brand',
        Buffer.concat([Buffer.of(3), Buffer.from('tim', 'utf8')]),
      ),
    );

    await packet.client.write(new ClientBoundHeldItemChange(1));
    await packet.client.write(new DeclareRecipes([]));

    await packet.client.write(
      new PlayerPositionAndLook(
        packet.client.position.x,
        packet.client.position.y,
        packet.client.position.z,
        packet.client.position.yaw,
        packet.client.position.pitch,
        false,
        false,
        false,
        false,
        false,
        0,
        false,
      ),
    );

    const chunkX = Math.floor(packet.client.position.x / 16);
    const chunkZ = Math.floor(packet.client.position.z / 16);

    await packet.client.write(new UpdateViewPosition(chunkX, chunkZ));

    const diff = 1;
    for (let i = -diff; i <= diff; i++) {
      for (let j = -diff; j <= diff; j++) {
        await packet.client.write(new ChunkDataAndUpdateLight(chunkX + i, chunkZ + j));
      }
    }

    setInterval(async () => {
      const chunkX = Math.floor(packet.client.position.x / 16);
      const chunkZ = Math.floor(packet.client.position.z / 16);

      await packet.client.write(new UpdateViewPosition(chunkX, chunkZ));
      await packet.client.write(new KeepAlive(BigInt(Math.floor(Math.random() * 10000000))));
    }, 2000);

    // setInterval(() => {
    //   const explosionCount = 10;
    //   const explosionDistance = 20;
    //   for (let i = 0; i < explosionCount; i++) {
    //     const angle = (i / explosionCount) * 2 * Math.PI;
    //     const xScale = Math.cos(angle);
    //     const zScale = Math.sin(angle);
    //     packet.client.write(
    //       new Explosion(
    //         packet.client.position.x + xScale * explosionDistance,
    //         packet.client.position.y,
    //         packet.client.position.z + zScale * explosionDistance,
    //         10,
    //         [],
    //         0,
    //         0,
    //         0,
    //       ),
    //     );
    //   }
    // }, 1000 / 400);
  }
}
