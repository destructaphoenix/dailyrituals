import { roomFor, keptLabel } from '../../src/home/candleCap';
import { MAX_CANDLES, CANDLE_PACKS } from '../../src/data';
import fs from 'fs';
import path from 'path';

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

describe('keptLabel (IMP-115 — a pre-cap holding must not read as a fraction over its own limit)', () => {
  test('below the cap: shows the fraction', () => {
    expect(keptLabel(1)).toBe(`1 / ${MAX_CANDLES} kept`);
  });

  test('exactly at the cap: still shows the fraction', () => {
    expect(keptLabel(MAX_CANDLES)).toBe(`${MAX_CANDLES} / ${MAX_CANDLES} kept`);
  });

  test('above the cap: drops the denominator (the 6-candle case)', () => {
    expect(keptLabel(6)).toBe('6 kept');
    expect(keptLabel(MAX_CANDLES + 1)).not.toContain('/');
  });

  test('a custom cap overrides the default', () => {
    expect(keptLabel(5, 5)).toBe('5 / 5 kept');
    expect(keptLabel(6, 5)).toBe('6 kept');
  });
});

describe('Shop.js kept row goes through keptLabel, not a raw MAX_CANDLES interpolation (IMP-115)', () => {
  test('source uses keptLabel(freezes) and does not interpolate MAX_CANDLES directly', () => {
    const src = fs.readFileSync(
      path.join(__dirname, '../../src/screens/Shop.js'),
      'utf8'
    );
    expect(src).toMatch(/keptLabel\(freezes\)/);
    expect(src).not.toMatch(/\{freezes\}\s*\/\s*\{MAX_CANDLES\}/);
  });
});
