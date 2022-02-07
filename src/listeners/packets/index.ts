import { StatusListener } from './StatusListener';
import { LoginListener } from './LoginListener';
import { EncryptionListener } from './EncryptionListener';
import { PlayListener } from './PlayListener';
import { PluginMessageListener } from './PluginMessageListener';
import { PlayerMovementListener } from './PlayerMovementListener';

export const packetListeners = [
  new StatusListener(),
  new LoginListener(),
  new EncryptionListener(),
  new PlayListener(),
  new PluginMessageListener(),
  new PlayerMovementListener(),
];
