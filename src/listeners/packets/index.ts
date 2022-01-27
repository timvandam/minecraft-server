import { StatusListener } from './StatusListener';
import { LoginListener } from './LoginListener';
import { EncryptionListener } from './EncryptionListener';
import { PlayListener } from './PlayListener';

export const packetListeners = [
  new StatusListener(),
  new LoginListener(),
  new EncryptionListener(),
  new PlayListener(),
];
