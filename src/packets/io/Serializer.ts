import { Transform, TransformCallback } from 'stream';
import { MinecraftClient } from '../../MinecraftClient';
import { ClientBoundPacketClass } from '../packets/PacketRegistry';
import { BufferWriter } from '../../data-types/BufferWriter';
import { MAX_PACKET_SIZE } from './constants';
import { promisify } from 'util';
import zlib from 'zlib';

const deflate = promisify(zlib.deflate);

/**
 * Takes packet objects, gives buffers
 * @see {https://wiki.vg/Protocol#Packet_format}
 */
export class Serializer extends Transform {
  constructor(protected readonly client: MinecraftClient) {
    super({
      writableObjectMode: true,
      readableObjectMode: false,
      highWaterMark: 0,
    });
  }

  async _transform(
    packet: InstanceType<ClientBoundPacketClass>,
    encoding: never /* not used */,
    callback: TransformCallback,
  ) {
    const packetClass = packet.constructor as ClientBoundPacketClass;
    const writer = new BufferWriter();

    let payload = writer
      .writeVarInt(packetClass.packetId)
      .writeBlob(packetClass.toBuffer(packet))
      .getBuffer();

    if (writer.length > MAX_PACKET_SIZE) {
      callback(new Error('Attempting to send a packet that is too large'));
      return;
    }

    writer.clear();
    if (this.client.compression) {
      // We are using the compressed packet format.
      //  Compress if the payload size is over the threshold.
      //  Otherwise, add Data Length = 0 to indicate that the payload is not compressed.
      const shouldCompress = payload.length >= this.client.compressionThreshold;
      if (shouldCompress) {
        writer.writeVarInt(payload.length);
        payload = await deflate(payload);
      } else {
        writer.writeVarInt(0);
      }
    }

    writer.writeBlob(payload);

    if (writer.length > MAX_PACKET_SIZE) {
      callback(new Error('Attempting to send a packet that is too large'));
      return;
    }

    const buf = new BufferWriter()
      .writeVarInt(writer.length)
      .writeBlob(writer.getBuffer())
      .getBuffer();

    callback(null, buf);
  }
}
