import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { compound } from '../NBTSerialize';

export const name = 'hello_world';

export const getActualNbtBuffer = () => readFile(resolve(__dirname, './nbt/hello_world.nbt'));

export const nbtValue = compound({ 'hello world': { name: 'Bananrama' } });
