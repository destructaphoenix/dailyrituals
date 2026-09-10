import { roomFor } from '../../src/home/candleCap';
import { MAX_CANDLES, CANDLE_PACKS } from '../../src/data';

describe('roomFor (IMP-112 — how many candles actually fit)', () => {
  test('below the cap: all of it fits', () => {
    expect(roomFor(0, 1)).toBe(1);
    expect(roomFor(1, 2)).toBe(2);
  });

  test('exactly at the cap: fits exactly', () => {
    expect(roomFor(0, MAX_CANDLES)).toBe(MAX_CANDLES);
  });

  test('above the cap: clamped to what remains', () => {
    expect(roomFor(1, MAX_CANDLES)).toBe(MAX_CANDLES - 1);
  });

  test('already full: nothing fits, never negative', () => {
    expect(roomFor(MAX_CANDLES, 1)).toBe(0);
    expect(roomFor(MAX_CANDLES + 5, 1)).toBe(0);
  });

  test('a custom cap overrides the default', () => {
    expect(roomFor(0, 10, 5)).toBe(5);
  });
});

describe('CANDLE_PACKS never exceeds MAX_CANDLES (IMP-112 — the guard against the c5 problem)', () => {
  test('no pack sells more candles than a user can ever hold', () => {
    for (const pack of CANDLE_PACKS) {
      expect(pack.count).toBeLessThanOrEqual(MAX_CANDLES);
    }
  });

  test('the 5-candle pack is gone', () => {
    expect(CANDLE_PACKS.find((p) => p.id === 'c5')).toBeUndefined();
  });
});
