import { EventHandler } from 'decorator-events';
import { LoginStart } from '../../packets/packets/server-bound/LoginStart';
import { SetCompression } from '../../packets/packets/client-bound/SetCompression';
import { LoginSuccess } from '../../packets/packets/client-bound/LoginSuccess';
import { ClientState } from '../../packets/ClientState';
import { v3 as uuid } from 'uuid';
import { Gamemode, JoinGame } from '../../packets/packets/client-bound/JoinGame';
import { byte, compound, double, float, int, list } from '../../data-types/nbt';
import { PlayerPositionAndLook } from '../../packets/packets/client-bound/PlayerPositionAndLook';
import { Explosion } from '../../packets/packets/client-bound/Explosion';

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

    packet.client.write(
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
        true,
        false,
      ),
    );

    packet.client.write(
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

    setInterval(() => {
      const explosionCount = 10;
      const explosionDistance = 20;
      for (let i = 0; i < explosionCount; i++) {
        const angle = (i / explosionCount) * 2 * Math.PI;
        const xScale = Math.cos(angle);
        const zScale = Math.sin(angle);
        packet.client.write(
          new Explosion(
            packet.client.position.x + xScale * explosionDistance,
            packet.client.position.y,
            packet.client.position.z + zScale * explosionDistance,
            10,
            [],
            0,
            0,
            0,
          ),
        );
      }
    }, 1000 / 400);
  }
}
