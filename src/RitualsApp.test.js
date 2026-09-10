// RitualsApp.test.js — IMP-104's last line of defence, pinned directly.
//
// buyPalette/buySky are closures inside RitualsApp and not reachable from a
// test without driving the full app through the Shop modal, so the guard is
// extracted as this pure predicate and pinned here instead — see
// isPurchasableTier's comment in RitualsApp.js for why the guard exists at
// all: a string tier reaching a buy handler produces a NaN balance that
// serialises to null and reads back as 0.
import { isPurchasableTier, shortfallCopy } from './RitualsApp';

test('IMP-104: a string tier (e.g. the "owned" default) is not purchasable', () => {
  expect(isPurchasableTier('owned')).toBe(false);
  expect(isPurchasableTier('plus')).toBe(false);
});

test('IMP-104: a numeric tier is purchasable', () => {
  expect(isPurchasableTier(240)).toBe(true);
  expect(isPurchasableTier(0)).toBe(true);
});

// IMP-109: buyPalette/buySky/buyCandles are closures too (see above), so the
// shortfall message they all route through is pinned here the same way.
const EMBERS_ARE_FREE_COPY = 'Embers also gather on their own — one for every day you keep';

test('IMP-109: a shortfall on a palette names the palette, its price and the balance', () => {
  const msg = shortfallCopy('Harvest Moon', 300, 15);
  expect(msg).toBe('Harvest Moon costs 300 embers — you have 15');
  expect(msg).not.toBe(EMBERS_ARE_FREE_COPY);
});

test('IMP-109: a shortfall on a sky names the sky, its price and the balance', () => {
  const msg = shortfallCopy('Golden Sun', 240, 0);
  expect(msg).toBe('Golden Sun costs 240 embers — you have 0');
  expect(msg).not.toBe(EMBERS_ARE_FREE_COPY);
});

test('IMP-109: a shortfall on a candle pack names the pack, its price and the balance', () => {
  const msg = shortfallCopy('3 candles', 300, 120);
  expect(msg).toBe('3 candles costs 300 embers — you have 120');
  expect(msg).not.toBe(EMBERS_ARE_FREE_COPY);
});

test('IMP-109: a deliberate tap on the ember pill still gets the free-embers copy, unchanged', () => {
  expect(EMBERS_ARE_FREE_COPY).not.toBe(shortfallCopy('anything', 1, 0));
});
