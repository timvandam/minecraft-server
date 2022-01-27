import { EventHandler } from 'decorator-events';
import { Difficulty, SetDifficulty } from '../../packets/packets/server-bound/SetDifficulty';

export class PlayListener {
  @EventHandler
  setDifficulty(packet: SetDifficulty) {
    console.log('set difficulty to', packet.difficulty, Difficulty[packet.difficulty]);
  }
}
