// TODO: Make this be modified utf8

export function serializeModifiedUtf8(str: string): Buffer {
  return Buffer.from(str, 'utf8');
}

export function deserializeModifiedUtf8(buf: Buffer): string {
  return buf.toString('utf8');
}
