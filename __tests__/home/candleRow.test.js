import { candleRow, candleRowCopy } from '../../src/home/candleRow';

describe('candleRow — IMP-064', () => {
  test('0 → one unlit slot, no overflow', () => {
    expect(candleRow(0)).toEqual({ slots: 1, lit: 0, overflow: null });
  });

  test('1 → one lit slot, no overflow', () => {
    expect(candleRow(1)).toEqual({ slots: 1, lit: 1, overflow: null });
  });

  test('3 → three slots, three lit', () => {
    expect(candleRow(3)).toEqual({ slots: 3, lit: 3, overflow: null });
  });

  test('5 → five slots, no overflow', () => {
    expect(candleRow(5)).toEqual({ slots: 5, lit: 5, overflow: null });
  });

  test('past the cap overflows to a ×N badge', () => {
    expect(candleRow(6)).toEqual({ slots: 5, lit: 5, overflow: '×6' });
    expect(candleRow(12).overflow).toBe('×12');
  });

  test('a negative, a NaN, undefined and a numeric string all behave as documented', () => {
    expect(candleRow(-3)).toEqual({ slots: 1, lit: 0, overflow: null });
    expect(candleRow(NaN)).toEqual({ slots: 1, lit: 0, overflow: null });
    expect(candleRow(undefined)).toEqual({ slots: 1, lit: 0, overflow: null });
    expect(candleRow('3')).toEqual({ slots: 3, lit: 3, overflow: null });
  });

  test('a custom max overflows past it', () => {
    expect(candleRow(4, 3)).toEqual({ slots: 3, lit: 3, overflow: '×4' });
  });
});

describe('candleRowCopy — IMP-064', () => {
  test('0 → the zero-state string', () => {
    expect(candleRowCopy(0)).toBe('No candles. One keeps your flame on a day you miss.');
  });

  test('1 → the singular string', () => {
    expect(candleRowCopy(1)).toBe('1 candle — it keeps your flame on a day you miss.');
  });

  test('7 → the plural string with the count in it', () => {
    expect(candleRowCopy(7)).toBe('7 candles — each keeps your flame on a day you miss.');
  });
});
