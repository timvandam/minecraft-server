import { StatusListener } from './StatusListener';
import { LoginListener } from './LoginListener';
import { EncryptionListener } from './EncryptionListener';
import { PlayListener } from './PlayListener';
import { PluginMessageListener } from './PluginMessageListener';
import { PlayerMovementListener } from './PlayerMovementListener';
import { PlayerSettingsListener } from './PlayerSettingsListener';
import { DigListener } from './DigListener';
import { TimeoutListener } from './TimeoutListener';
import { ChunkListener } from './ChunkListener';
import { ErrorListener } from './ErrorListener';

export const packetListeners = [
  new StatusListener(),
  new LoginListener(),
  new EncryptionListener(),
  new PlayListener(),
  new PluginMessageListener(),
  new PlayerMovementListener(),
  new PlayerSettingsListener(),
  new DigListener(),
  new TimeoutListener(),
  new ChunkListener(),
  new ErrorListener(),
];
