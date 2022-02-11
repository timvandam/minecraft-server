import { ChunkListener as ActualChunkListener, ChunkRange } from '../ChunkListener';

class ChunkListener extends ActualChunkListener {
  xorChunkRange(a: ChunkRange, b: ChunkRange): [A: ChunkRange[], B: ChunkRange[]] {
    return super.xorChunkRange(a, b);
  }
}

const chunkListener = new ChunkListener();

describe('xorChunkRange', () => {
  it('same chunk', () => {
    const range: ChunkRange = { min: { x: 0, z: 0 }, max: { x: 10, z: 10 } };
    expect(chunkListener.xorChunkRange(range, range)[0]).toEqual([]);
  });

  it('chunk lower x', () => {
    const range1: ChunkRange = { min: { x: 0, z: 0 }, max: { x: 10, z: 1 } };
    const range2: ChunkRange = { min: { x: 0, z: 0 }, max: { x: 5, z: 1 } };
    expect(chunkListener.xorChunkRange(range1, range2)[0]).toEqual([
      { min: { x: 6, z: 0 }, max: { x: 10, z: 1 } },
    ]);
  });

  it('chunk lower z', () => {
    const range1: ChunkRange = { min: { x: 0, z: 0 }, max: { x: 0, z: 10 } };
    const range2: ChunkRange = { min: { x: 0, z: 0 }, max: { x: 0, z: 5 } };
    expect(chunkListener.xorChunkRange(range1, range2)[0]).toEqual([
      { min: { x: 0, z: 6 }, max: { x: 0, z: 10 } },
    ]);
  });

  it('chunk lower x and z', () => {
    /*
 0123456789 x
 1    11111
 2    11111
 3 222##111
 4 22222
 5 22222
 z
     */
    const range1 = { min: { x: 5, z: 1 }, max: { x: 9, z: 3 } };
    const range2 = { min: { x: 2, z: 3 }, max: { x: 6, z: 5 } };
    expect(chunkListener.xorChunkRange(range1, range2)[0]).toEqual([
      // Top left part
      { min: { x: 5, z: 1 }, max: { x: 6, z: 2 } },
      // Top right part
      { min: { x: 7, z: 1 }, max: { x: 9, z: 2 } },
      // Bottom right part
      { min: { x: 7, z: 3 }, max: { x: 9, z: 3 } },
    ]);
  });

  it('chunk higher x and z', () => {
    /*
 0123456789 x
 1    22222
 2    22222
 3 111##222
 4 11111
 5 11111
 z
     */
    const range1 = { min: { x: 2, z: 3 }, max: { x: 6, z: 5 } };
    const range2 = { min: { x: 5, z: 1 }, max: { x: 9, z: 3 } };
    expect(chunkListener.xorChunkRange(range1, range2)[0]).toEqual([
      // Top left part
      { min: { x: 2, z: 3 }, max: { x: 4, z: 3 } },
      // Bottom left part
      { min: { x: 2, z: 4 }, max: { x: 4, z: 5 } },
      // Bottom right part
      { min: { x: 5, z: 4 }, max: { x: 6, z: 5 } },
    ]);
  });

  it('containing', () => {
    /*
 0123456789 x
 1
 2 11111
 3 1###1
 4 1###1
 5 11111
 z
     */
    const range1 = { min: { x: 2, z: 2 }, max: { x: 6, z: 5 } };
    const range2 = { min: { x: 3, z: 3 }, max: { x: 5, z: 4 } };
    expect(chunkListener.xorChunkRange(range1, range2)[0]).toEqual([
      // Top left
      { min: { x: 2, z: 2 }, max: { x: 2, z: 2 } },
      // Left
      { min: { x: 2, z: 3 }, max: { x: 2, z: 4 } },
      // Bottom left
      { min: { x: 2, z: 5 }, max: { x: 2, z: 5 } },
      // Top
      { min: { x: 3, z: 2 }, max: { x: 5, z: 2 } },
      // Bottom
      { min: { x: 3, z: 5 }, max: { x: 5, z: 5 } },
      // Top right
      { min: { x: 6, z: 2 }, max: { x: 6, z: 2 } },
      // Right
      { min: { x: 6, z: 3 }, max: { x: 6, z: 4 } },
      // Bottom right
      { min: { x: 6, z: 5 }, max: { x: 6, z: 5 } },
    ]);
  });

  it('parameters and result order', () => {
    const range1 = { min: { x: 5, z: 1 }, max: { x: 9, z: 3 } };
    const range2 = { min: { x: 2, z: 3 }, max: { x: 6, z: 5 } };
    const [a, b] = chunkListener.xorChunkRange(range1, range2);
    const [c, d] = chunkListener.xorChunkRange(range2, range1);
    expect(a).toEqual(d);
    expect(b).toEqual(c);
  });
});
