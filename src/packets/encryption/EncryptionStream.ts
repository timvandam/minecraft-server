import { Transform } from 'stream';
import { createCipheriv } from 'crypto';
import { ENCRYPTION_ALGORITHM } from './constants';

export const createEncryptionStream = (secret: string): Transform =>
  createCipheriv(ENCRYPTION_ALGORITHM, secret, secret);
