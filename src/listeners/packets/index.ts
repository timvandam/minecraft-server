import { StatusListener } from './StatusListener';
import { LoginListener } from './LoginListener';
import { CompressionListener } from './CompressionListener';
import { EncryptionListener } from './EncryptionListener';

export const packetListeners = [
  new StatusListener(),
  new LoginListener(),
  new CompressionListener(),
  new EncryptionListener(),
];
