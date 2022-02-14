import { Box } from './Box';
import { MinecraftClient } from '../MinecraftClient';

export const clientsBox = Box<Set<MinecraftClient>>(Symbol('Clients'));
