import { EventEmitter } from 'events'
import MinecraftClient from '../MinecraftClient'
import { EClickStatus } from '../enums/EClickStatus'

export default function movement (user: EventEmitter, client: MinecraftClient) {
  user.on('animation', (hand: number) => {
    // 0 = main, 1 = other
  })

  user.on('playerDigging', async (status: EClickStatus, [x, y, z]: number[], face: number) => {
    // TODO: Make sure this works
    if (status === EClickStatus.FINISHED_DIGGING) {
      await client.send.acknowledgePlayerDigging([x, y, z], 9, status, true)
      client.send.blockChange([x, y, z], 8)
    }
  })

  user.on('playerPositionAndRotation', (x: number, y: number, z: number, yaw: number, pitch: number, onGround: boolean) => {
    user.emit('playerPosition', x, y, z, onGround)
    user.emit('playerRotation', yaw, pitch, onGround)
  })

  user.on('playerPosition', (x: number, y: number, z: number, onGround: boolean) => {
    client.store({ position: [x, y, z] })
    if (onGround) {
      client.send.blockChange([x, y - 1, z], 1426)
      client.send.blockBreakAnimation(0, [x, y, - 1 z], 9)
    }
  })
}
