import * as arrays from './arrays';
import * as bigtest from './bigtest';
import * as level from './level';
import * as hello_world from './hello_world';
import * as short from './short';
import { NBTValue } from '../NBTValue';
import { NBTType } from '../NBTType';

export type NBTFixture = {
  name: string;
  getActualNbtBuffer(): Promise<Buffer> | Buffer;
  nbtValue: NBTValue<NBTType.COMPOUND>;
};

export const fixtures: NBTFixture[] = [arrays, bigtest, level, hello_world, short];
