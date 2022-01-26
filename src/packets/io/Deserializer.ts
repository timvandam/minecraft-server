import { AsyncBuffer } from './AsyncBuffer';
import { AsyncBufferReader } from '../../data-types/AsyncBufferReader';
import { getPacketClass, ServerBoundPacketClass } from '../packets/PacketRegistry';
import { PacketDirection } from '../packets/PacketDirection';
import { BufferReader } from '../../data-types';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { MinecraftClient } from '../../MinecraftClient';

const inflate = promisify(zlib.inflate);

export async function* Deserializer(
  client: MinecraftClient,
  stream: AsyncIterable<Buffer>,
): AsyncIterable<InstanceType<ServerBoundPacketClass>> {
  const asyncBuffer = AsyncBuffer.fromAsyncIterable(stream);
  const reader = new AsyncBufferReader(asyncBuffer);

  while (true) {
    const packetLength = await reader.readVarInt();

    const data = await reader.readBlob(packetLength);

    const packetReader = new BufferReader(data);

    if (client.compression) {
      // We are using the compressed format, so include data length and inflate if needed
      const dataLength = packetReader.readVarInt();
      // DataLength != 0 means it was compressed
      if (dataLength !== 0) {
        packetReader.buffer = await inflate(packetReader.buffer);
      }
    }
    const packetId = packetReader.readVarInt();
    const packetData = packetReader.buffer;

    const packetClass = getPacketClass(packetId, PacketDirection.SERVER_BOUND, client.state);

    if (packetClass === undefined) {
      console.log(`Received unknown packet 0x${packetId.toString(16)}`);
      continue;
    }

    const packet = packetClass.fromBuffer(packetData);
    Object.defineProperty(packet, 'client', { value: client });

    yield packet;
  }
}
