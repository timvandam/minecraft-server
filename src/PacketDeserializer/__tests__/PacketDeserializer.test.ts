import { Duplex } from 'stream'
import PacketDeserializer from '../'
import MinecraftClient from '../../MinecraftClient'

let stream: Duplex
let done: Promise<undefined>
let packets: Buffer[]
beforeEach(() => {
  stream = new PacketDeserializer(Object.create(MinecraftClient.prototype, {}))
  done = new Promise(resolve => stream.once('end', () => resolve()))
  packets = []
  stream.on('data', packet => {
    packets.push(packet)
  })
})

it('works when providing a whole packet', async () => {
  stream.end(Buffer.from('0102', 'hex')) // Length = 1 byte. ID = 2
  await done
  expect(packets).toEqual([Buffer.from('0102', 'hex')])
})

it('works when providing multiple whole incoming at once', async () => {
  stream.end(Buffer.from('01020102', 'hex')) // The previous packet, twice
  await done
  expect(packets.length).toBe(2)
  expect(packets[0]).toEqual(packets[1])
  expect(packets[0]).toEqual(Buffer.from('0102', 'hex'))
})

it('works when providing multiple incoming separately', async () => {
  stream.write(Buffer.from('0102', 'hex'))
  stream.end(Buffer.from('0102', 'hex'))
  await done
  expect(packets.length).toBe(2)
  expect(packets[0]).toEqual(packets[1])
  expect(packets[0]).toEqual(Buffer.from('0102', 'hex'))
})

it('works when providing one packet in multiple writes', async () => {
  stream.write(Buffer.from('01', 'hex'))
  stream.end(Buffer.from('02', 'hex'))
  await done
  expect(packets.length).toBe(1)
  expect(packets[0]).toEqual(Buffer.from('0102', 'hex'))
})
