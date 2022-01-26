import { ClientBoundPacketClass } from '../packets/PacketRegistry';
import { BufferWriter } from '../../data-types/BufferWriter';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { MinecraftClient } from '../../MinecraftClient';

const deflate = promisify(zlib.deflate);

export async function* Serializer(
  client: MinecraftClient,
  packets: AsyncIterable<InstanceType<ClientBoundPacketClass>>,
): AsyncIterable<Buffer> {
  for await (const packet of packets) {
    const packetClass = packet.constructor as ClientBoundPacketClass;
    const writer = new BufferWriter();

    let payload = writer
      .writeVarInt(packetClass.packetId)
      .writeBlob(packetClass.toBuffer(packet))
      .getBuffer();

    writer.clear();
    if (client.compression) {
      const shouldCompress = payload.length >= client.compressionThreshold;
      if (shouldCompress) {
        payload = await deflate(payload);
        writer.writeVarInt(payload.length);
      } else {
        writer.writeVarInt(0);
      }
    }

    writer.writeBlob(payload).prepend.writeVarInt(writer.length);

    yield writer.getBuffer();
  }
}
