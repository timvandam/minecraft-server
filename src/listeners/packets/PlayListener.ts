import { EventHandler } from 'decorator-events';
import { Difficulty, SetDifficulty } from '../../packets/packets/server-bound/SetDifficulty';
import { PlayerPosition } from '../../packets/packets/server-bound/PlayerPosition';

export class PlayListener {
  @EventHandler
  setDifficulty(packet: SetDifficulty) {
    console.log('set difficulty to', packet.difficulty, Difficulty[packet.difficulty]);
  }

  @EventHandler
  playerPosition(packet: PlayerPosition) {
    //
  }
}
