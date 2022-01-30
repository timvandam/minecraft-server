import * as zlib from 'zlib';
import { promisify } from 'util';
import { BufferWriter } from '../../BufferWriter';
import { fixtures, NBTFixture } from '../__fixtures__';
import { BufferReader } from '../../BufferReader';
import { deserializeNbt } from '../NBTDeserialize';
import { serializeNbt } from '../NBTSerialize';

const inflate = promisify(zlib.inflate);
const gunzip = promisify(zlib.gunzip);

const decompress = (buf: Buffer) => {
  return inflate(buf)
    .catch(() => gunzip(buf))
    .catch(() => buf);
};

describe.each<NBTFixture>([...fixtures])('$name', ({ nbtValue, getActualNbtBuffer }) => {
  const getBuffer = async () => await decompress(await getActualNbtBuffer());

  it('reading', async () => {
    const reader = new BufferReader(await getBuffer());
    const nbt = await deserializeNbt(reader);
    expect(nbt).toEqual(nbtValue);
  });

  it('writing', async () => {
    const writer = new BufferWriter();
    serializeNbt(writer, nbtValue);
    expect(writer.getBuffer()).toEqual(await getBuffer());
  });
});
