import { readFile } from 'fs/promises';
import { nbt } from '../NBTSerialize';
import { resolve } from 'path';

export const name = 'hello_world';

export const getActualNbtBuffer = () => readFile(resolve(__dirname, './hello_world.nbt'));

export const nbtValue = nbt('hello world', { name: 'Bananrama' });
