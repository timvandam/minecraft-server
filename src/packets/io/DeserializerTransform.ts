import { Readable } from 'stream';
import { MinecraftClient } from '../../MinecraftClient';
import { getPacketClass } from '../packets/PacketRegistry';
import { MAX_PACKET_SIZE } from './constants';
import { promisify } from 'util';
import zlib from 'zlib';
import { AsyncBuffer } from './AsyncBuffer';
import { AsyncBufferReader } from '../../data-types/AsyncBufferReader';
import { BufferReader } from '../../data-types';
import { PacketDirection } from '../packets/PacketDirection';
import { ClientState } from '../ClientState';

const inflate = promisify(zlib.inflate);

/**
 * Takes packet objects, gives buffers
 * @see {https://wiki.vg/Protocol#Packet_format}
 */
export class DeserializerTransform extends Readable {
  constructor(
    protected readonly client: MinecraftClient,
    protected readonly asyncBuffer: AsyncBuffer,
  ) {
    super({ objectMode: true });
  }

  async _read() {
    const reader = new AsyncBufferReader(this.asyncBuffer);

    const packetLength = await reader.readVarInt();

    if (packetLength > MAX_PACKET_SIZE) {
      console.log('Received a packet that was too large, ignoring it');
      await this.asyncBuffer.consume(packetLength);
      this.push(undefined);
      return;
    }

    const data = await reader.readBlob(packetLength);

    const packetReader = new BufferReader(data);

    if (this.client.compression) {
      // We are using the compressed format, so include data length and inflate if needed
      const dataLength = packetReader.readVarInt();
      // DataLength != 0 means it was compressed
      if (dataLength !== 0) {
        packetReader.buffer = await inflate(packetReader.buffer);
      }
    }
    const packetId = packetReader.readVarInt();
    const packetData = packetReader.buffer;

    const packetClass = getPacketClass(packetId, PacketDirection.SERVER_BOUND, this.client.state);

    if (packetClass === undefined) {
      console.log(
        `Received unknown packet 0x${packetId.toString(16).padStart(2, '0')} (state: ${
          ClientState[this.client.state]
        })`,
      );
      this.push(undefined);
      return;
    }

    this.push(packetClass.fromBuffer(packetData));
  }
}
