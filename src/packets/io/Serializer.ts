import { ClientBoundPacketClass } from '../packets/PacketRegistry';
import { BufferWriter } from '../../data-types/BufferWriter';
import * as zlib from 'zlib';
import { promisify } from 'util';
import { MinecraftClient } from '../../MinecraftClient';
import { MAX_PACKET_SIZE } from './constants';

const deflate = promisify(zlib.deflate);

/**
 * @see {https://wiki.vg/Protocol#Packet_format}
 */
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

    if (writer.length > MAX_PACKET_SIZE) {
      console.log('Attempting to send a packet that is too large. Ignoring it');
      continue;
    }

    writer.clear();
    if (client.compression) {
      // We are using the compressed packet format.
      //  Compress if the payload size is over the threshold.
      //  Otherwise, add Data Length = 0 to indicate that the payload is not compressed.
      const shouldCompress = payload.length >= client.compressionThreshold;
      if (shouldCompress) {
        writer.writeVarInt(payload.length);
        payload = await deflate(payload);
      } else {
        writer.writeVarInt(0);
      }
    }

    writer.writeBlob(payload);

    if (writer.length > MAX_PACKET_SIZE) {
      console.log('Attempting to send a packet that is too large. Ignoring it');
      continue;
    }

    const buf = new BufferWriter()
      .writeVarInt(writer.length)
      .writeBlob(writer.getBuffer())
      .getBuffer();
    yield buf;
  }
}
