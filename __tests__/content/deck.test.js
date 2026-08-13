import { shuffle, selectPrompt } from '../../src/content/deck';

const POOL = ['p0', 'p1', 'p2', 'p3', 'p4'];

describe('shuffle', () => {
  it('returns a permutation of [0..n-1]', () => {
    const out = shuffle(5, 42);
    expect([...out].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  });
  it('is deterministic for a given seed', () => {
    expect(shuffle(8, 99)).toEqual(shuffle(8, 99));
  });
});

describe('selectPrompt', () => {
  it('initializes a deck when none exists', () => {
    const { state, item } = selectPrompt(POOL, null, 100);
    expect(state.day).toBe(100);
    expect(state.pos).toBe(0);
    expect(state.order.length).toBe(POOL.length);
    expect(POOL).toContain(item);
  });

  it('returns the SAME deck reference and item on the same day', () => {
    const first = selectPrompt(POOL, null, 100);
    const again = selectPrompt(POOL, first.state, 100);
    expect(again.state).toBe(first.state); // same reference — no churn
    expect(again.item).toBe(first.item);
  });

  it('advances to the next prompt on a new day', () => {
    const d1 = selectPrompt(POOL, null, 100);
    const d2 = selectPrompt(POOL, d1.state, 101);
    expect(d2.state.pos).toBe(1);
    expect(d2.item).not.toBe(d1.item);
  });

  it('shows every prompt once before any repeat (full cycle)', () => {
    let state = null; const seen = [];
    for (let day = 200; day < 200 + POOL.length; day++) {
      const r = selectPrompt(POOL, state, day); state = r.state; seen.push(r.item);
    }
    expect(new Set(seen).size).toBe(POOL.length); // all unique across one cycle
  });

  it('reshuffles after the deck is exhausted', () => {
    let state = null;
    for (let day = 300; day < 300 + POOL.length; day++) { state = selectPrompt(POOL, state, day).state; }
    const wrapped = selectPrompt(POOL, state, 300 + POOL.length);
    expect(wrapped.state.pos).toBe(0); // back to start of a fresh deck
    expect(POOL).toContain(wrapped.item);
  });

  it('does not skip prompts when days are missed (advance is per app-open day)', () => {
    const d1 = selectPrompt(POOL, null, 100);
    const d2 = selectPrompt(POOL, d1.state, 110); // 10-day gap
    expect(d2.state.pos).toBe(1); // advanced by exactly one
  });

  it('reinitializes when the deck is invalid or the pool size changed', () => {
    const stale = { day: 100, order: [0, 1, 2], pos: 0 }; // length 3, pool is 5
    const { state } = selectPrompt(POOL, stale, 101);
    expect(state.order.length).toBe(POOL.length);
  });

  it('does not mutate the input deck', () => {
    const d1 = selectPrompt(POOL, null, 100);
    const snapshot = JSON.stringify(d1.state);
    selectPrompt(POOL, d1.state, 101);
    expect(JSON.stringify(d1.state)).toBe(snapshot);
  });

  it('handles an empty pool without throwing', () => {
    expect(selectPrompt([], null, 100)).toEqual({ state: null, item: '' });
  });

  it('tags a new deck with the given packId, defaulting to "everyday"', () => {
    const withDefault = selectPrompt(POOL, null, 100);
    expect(withDefault.state.pack).toBe('everyday');
    const withPack = selectPrompt(POOL, null, 100, 'grief');
    expect(withPack.state.pack).toBe('grief');
  });

  it('rejects a same-length deck from another pack and reshuffles', () => {
    const grief = selectPrompt(POOL, null, 100, 'grief');
    const switched = selectPrompt(POOL, grief.state, 101, 'gratitude');
    expect(switched.state.pack).toBe('gratitude');
    expect(switched.state.pos).toBe(0); // reinitialized, not advanced
  });

  it('keeps and advances a deck from the same pack', () => {
    const d1 = selectPrompt(POOL, null, 100, 'grief');
    const d2 = selectPrompt(POOL, d1.state, 101, 'grief');
    expect(d2.state.pack).toBe('grief');
    expect(d2.state.pos).toBe(1); // advanced, not reinitialized
  });

  it('rejects and reinitializes an old deck with no pack field (migration)', () => {
    const legacy = { day: 100, order: shuffle(POOL.length, 100), pos: 0 }; // no `pack`
    const { state } = selectPrompt(POOL, legacy, 101, 'everyday');
    expect(state.pack).toBe('everyday');
    expect(state.pos).toBe(0); // reinitialized, not advanced to 1
  });

  it('keeps the same-day same-reference behavior with a packId', () => {
    const first = selectPrompt(POOL, null, 100, 'grief');
    const again = selectPrompt(POOL, first.state, 100, 'grief');
    expect(again.state).toBe(first.state);
    expect(again.item).toBe(first.item);
  });

  it('handles an empty pool without throwing, packId or not', () => {
    expect(selectPrompt([], null, 100, 'grief')).toEqual({ state: null, item: '' });
  });
});
