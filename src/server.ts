import { MinecraftServer } from './MinecraftServer';

new MinecraftServer({
  port: 25565,
})
  .start()
  .then(() => {
    console.log('Started');
  });
