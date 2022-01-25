import { Transform } from 'stream';
import { createDecipheriv } from 'crypto';
import { ENCRYPTION_ALGORITHM } from './constants';

export const createDecryptionStream = (secret: string): Transform =>
  createDecipheriv(ENCRYPTION_ALGORITHM, secret, secret);
