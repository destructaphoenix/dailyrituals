// RitualsApp.test.js — IMP-104's last line of defence, pinned directly.
//
// buyPalette/buySky are closures inside RitualsApp and not reachable from a
// test without driving the full app through the Shop modal, so the guard is
// extracted as this pure predicate and pinned here instead — see
// isPurchasableTier's comment in RitualsApp.js for why the guard exists at
// all: a string tier reaching a buy handler produces a NaN balance that
// serialises to null and reads back as 0.
import { isPurchasableTier } from './RitualsApp';

test('IMP-104: a string tier (e.g. the "owned" default) is not purchasable', () => {
  expect(isPurchasableTier('owned')).toBe(false);
  expect(isPurchasableTier('plus')).toBe(false);
});

test('IMP-104: a numeric tier is purchasable', () => {
  expect(isPurchasableTier(240)).toBe(true);
  expect(isPurchasableTier(0)).toBe(true);
});
