// __tests__/dev/buildState.test.js
import { buildState } from '../../src/dev/buildState';
import { PERSISTED_KEYS } from '../../src/persistence/state';
import { SHOP_PALETTES, SHOP_SKIES } from '../../src/data';

const TODAY = '2026-06-14';

test('done=true: streak/xp/entries wired, ends today, quests completed', () => {
  const s = buildState({ streak: 3, entryCount: 3, done: true }, TODAY);
  expect(s.streak).toBe(3);
  expect(s.xp).toBe(150); // 3 * 50
  expect(s.done).toBe(true);
  expect(s.entries).toHaveLength(3);
  expect(s.entries[0].dayKey).toBe(TODAY);
  expect(s.onboarded).toBe(true);
  const write = s.quests.find((q) => q.id === 'write');
  expect(write.cur).toBe(write.goal);
});

test('done=false: entries end yesterday and quests are not pre-completed', () => {
  const s = buildState({ streak: 4, entryCount: 4, done: false }, TODAY);
  expect(s.done).toBe(false);
  expect(s.entries[0].dayKey).toBe('2026-06-13');
  const write = s.quests.find((q) => q.id === 'write');
  expect(write.cur).not.toBe(write.goal);
});

test('explicit xp overrides the derived value', () => {
  expect(buildState({ streak: 80, xp: 9999 }, TODAY).xp).toBe(9999);
});

test('plus sets plus + activePlan; ownAll owns every cosmetic', () => {
  const s = buildState({ plus: true, ownAll: true }, TODAY);
  expect(s.plus).toBe(true);
  expect(s.activePlan).toBe('yearly');
  expect(s.ownedPalettes).toHaveLength(SHOP_PALETTES.length);
  expect(s.ownedSkies).toHaveLength(SHOP_SKIES.length);
});

test('palette/sky knobs select the active cosmetic and are owned', () => {
  const s = buildState({ palette: 'marigold', sky: 'harvest' }, TODAY);
  expect(s.activePalette).toBe('marigold');
  expect(s.ownedPalettes).toContain('marigold');
  expect(s.activeSky).toBe('harvest');
  expect(s.ownedSkies).toContain('harvest');
});

test('every output key is a persisted key', () => {
  const s = buildState({ streak: 2, entryCount: 2 }, TODAY);
  for (const k of Object.keys(s)) expect(PERSISTED_KEYS).toContain(k);
});
