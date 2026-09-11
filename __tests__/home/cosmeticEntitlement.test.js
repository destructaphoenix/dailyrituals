// __tests__/home/cosmeticEntitlement.test.js — IMP-116.
//
// entitledId is pure and exhaustively tested here. The revert effect itself
// lives inline in RitualsApp.js (same shape as the IMP-102 freeze-grant
// effect), so it is pinned with source assertions — see candleCapGrant.test.js
// for the same pattern.
const fs = require('fs');
const path = require('path');
const { entitledId } = require('../../src/home/cosmeticEntitlement');
const { SHOP_PALETTES, SHOP_SKIES, PLUS_PERKS } = require('../../src/data');

const frostlight = SHOP_PALETTES.find((p) => p.id === 'frostlight'); // tier: 'plus'
const harvestMoon = SHOP_SKIES.find((s) => s.id === 'harvest'); // tier: 300
const goldenHour = SHOP_PALETTES.find((p) => p.id === 'goldenhour'); // tier: 'owned'

describe('entitledId — the five branches', () => {
  test('item not found by id (a stale persisted id) falls back to the default', () => {
    expect(entitledId('deleted-id', [], SHOP_PALETTES, true, 'goldenhour')).toBe('goldenhour');
  });

  test("tier 'owned' stays active regardless of plus or ownership", () => {
    expect(entitledId('goldenhour', [], SHOP_PALETTES, false, 'goldenhour')).toBe('goldenhour');
  });

  test('an ember-bought item stays active even after Plus ends', () => {
    expect(entitledId('harvest', ['harvest'], SHOP_SKIES, false, 'classic')).toBe('harvest');
  });

  test('a Plus member keeps an applied-but-unowned cosmetic active', () => {
    expect(entitledId('frostlight', [], SHOP_PALETTES, true, 'goldenhour')).toBe('frostlight');
  });

  test('a lapsed member reverts an applied-but-unowned cosmetic to the default', () => {
    expect(entitledId('frostlight', [], SHOP_PALETTES, false, 'goldenhour')).toBe('goldenhour');
  });
});

describe("the owner's real 2026-09-11 lapse cases", () => {
  test("Frostlight ('plus', not owned, plus false) reverts", () => {
    expect(entitledId(frostlight.id, [], SHOP_PALETTES, false, 'goldenhour')).toBe('goldenhour');
  });

  test('Harvest Moon (300, not owned, plus false) reverts', () => {
    expect(entitledId(harvestMoon.id, [], SHOP_SKIES, false, 'classic')).toBe('classic');
  });

  test('Harvest Moon after a real ember purchase survives the lapse', () => {
    expect(entitledId(harvestMoon.id, [harvestMoon.id], SHOP_SKIES, false, 'classic')).toBe(harvestMoon.id);
  });

  test("a free 'owned' item (Golden Hour) survives under plus: false", () => {
    expect(entitledId(goldenHour.id, [], SHOP_PALETTES, false, 'goldenhour')).toBe(goldenHour.id);
  });
});

describe('RitualsApp.js — the cosmetic revert effect (IMP-116)', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');

  test('a useEffect keyed on plus, activePalette, activeSky, ownedPalettes and ownedSkies calls entitledId', () => {
    expect(source).toMatch(/entitledId\(/);
    const effectStart = source.indexOf('entitledId(');
    const before = source.slice(Math.max(0, effectStart - 400), effectStart);
    expect(before).toMatch(/React\.useEffect\(/);
  });

  test('the effect deps include plus, activePalette, activeSky, ownedPalettes and ownedSkies', () => {
    const effectStart = source.indexOf('entitledId(');
    const after = source.slice(effectStart, effectStart + 2000);
    const depsMatch = after.match(/\}, \[([^\]]*)\]\);/);
    expect(depsMatch).not.toBeNull();
    const deps = depsMatch[1];
    expect(deps).toMatch(/\bplus\b/);
    expect(deps).toMatch(/\bactivePalette\b/);
    expect(deps).toMatch(/\bactiveSky\b/);
    expect(deps).toMatch(/\bownedPalettes\b/);
    expect(deps).toMatch(/\bownedSkies\b/);
  });

  test('reverting a palette pairs setActivePalette with retint, same as applyPalette', () => {
    const effectStart = source.indexOf('entitledId(');
    const after = source.slice(effectStart, effectStart + 2000);
    expect(after).toMatch(/retint\(/);
    expect(after).toMatch(/setActivePalette\(/);
  });

  test('the effect emits at most one showToast call', () => {
    const effectStart = source.indexOf('entitledId(');
    const effectEnd = source.indexOf('}, [', effectStart);
    const body = source.slice(effectStart, effectEnd);
    const toastCalls = body.match(/showToast\(/g) || [];
    expect(toastCalls.length).toBeLessThanOrEqual(1);
  });
});

describe('data.js — PLUS_PERKS no longer overclaims (IMP-116)', () => {
  test('PLUS_PERKS[0] does not contain "forever"', () => {
    expect(PLUS_PERKS[0]).not.toMatch(/forever/i);
  });

  test('PLUS_PERKS[0] still promises every palette & sky', () => {
    expect(PLUS_PERKS[0]).toMatch(/palette/i);
    expect(PLUS_PERKS[0]).toMatch(/sky/i);
  });
});
