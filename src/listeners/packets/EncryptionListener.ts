import { EventHandler } from 'decorator-events';
import { EncryptionResponse } from '../../packets/packets/server-bound/EncryptionResponse';

export class EncryptionListener {
  @EventHandler
  encryption(packet: EncryptionResponse) {
    console.log('Encryption response');
  }
}
