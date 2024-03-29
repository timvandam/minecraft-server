import { compound, short } from '../NBTSerialize';

export const name = 'short';

export const getActualNbtBuffer = () =>
  Buffer.of(0x02, 0x00, 0x09, 0x73, 0x68, 0x6f, 0x72, 0x74, 0x54, 0x65, 0x73, 0x74, 0x7f, 0xff);

export const nbtValue = compound({ shortTest: short(32767) });
