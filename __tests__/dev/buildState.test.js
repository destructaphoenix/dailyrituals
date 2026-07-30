// __tests__/dev/buildState.test.js
import { buildState } from '../../src/dev/buildState';
import { PERSISTED_KEYS } from '../../src/persistence/state';
import { currentStreak, dayKeyToUtcMs, DAY_MS } from '../../src/insights/dateKeys';
import { SHOP_PALETTES, SHOP_SKIES } from '../../src/data';
import { shiftDayKey } from '../../src/dev/generateEntries';

const TODAY = '2026-06-14';

test('done=true: streak/xp/entries wired, ends today, quests completed', () => {
  const s = buildState({ streak: 3, entryCount: 3, done: true }, TODAY);
  // streak is derived from entries now — the knob drives a 3-day run ending today.
  expect(currentStreak(s.entries.map((e) => e.dayKey), TODAY)).toBe(3);
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

test('palette knob also writes the swatch into settings.accent (mirrors retint())', () => {
  const s = buildState({ palette: 'marigold' }, TODAY);
  const marigold = SHOP_PALETTES.find((p) => p.id === 'marigold');
  expect(s.settings.accent).toEqual(marigold.swatch);
});

test('mode knob defaults to day, can load straight into night', () => {
  expect(buildState({}, TODAY).mode).toBe('day');
  expect(buildState({ mode: 'night' }, TODAY).mode).toBe('night');
});

test('name knob sets settings.name', () => {
  expect(buildState({ name: 'Zara' }, TODAY).settings.name).toBe('Zara');
});

test('endOffset shifts the entry run back N days from today', () => {
  const s = buildState({ streak: 3, entryCount: 3, done: true, endOffset: 5 }, TODAY);
  expect(s.entries[0].dayKey).toBe(shiftDayKey(TODAY, -5));
});

test('lastBackupAt: N days ago becomes an ISO stamp, -1 becomes null', () => {
  const s = buildState({ lastBackupAt: 3 }, TODAY);
  expect(s.lastBackupAt).toBe(new Date(dayKeyToUtcMs(TODAY) - 3 * DAY_MS).toISOString());
  expect(buildState({ lastBackupAt: -1 }, TODAY).lastBackupAt).toBeNull();
  expect(buildState({}, TODAY).lastBackupAt).toBeUndefined();
});

test('subCanceled knob defaults false, settable true', () => {
  expect(buildState({}, TODAY).subCanceled).toBe(false);
  expect(buildState({ subCanceled: true }, TODAY).subCanceled).toBe(true);
});

test('plan knob overrides the plus-derived activePlan', () => {
  expect(buildState({ plus: true }, TODAY).activePlan).toBe('yearly');
  expect(buildState({ plus: true, plan: 'monthly' }, TODAY).activePlan).toBe('monthly');
  expect(buildState({ plus: false, plan: null }, TODAY).activePlan).toBeNull();
});

test('reminder knobs populate settings.reminder', () => {
  const s = buildState({ reminderEnabled: true, reminderHour: 7, reminderMinute: 15 }, TODAY);
  expect(s.settings.reminder).toEqual({ enabled: true, hour: 7, minute: 15 });
  // defaults mirror DEFAULT_SETTINGS.reminder when knobs are omitted
  expect(buildState({}, TODAY).settings.reminder).toEqual({ enabled: false, hour: 20, minute: 30 });
});

test('store simulation knobs populate settings.storePurchase/storeRestore', () => {
  const s = buildState({ storePurchase: 'failed', storeRestore: 'found' }, TODAY);
  expect(s.settings.storePurchase).toBe('failed');
  expect(s.settings.storeRestore).toBe('found');
});

test('headlineFont and roundness knobs populate settings', () => {
  const s = buildState({ headlineFont: 'Fredoka', roundness: 0.6 }, TODAY);
  expect(s.settings.headlineFont).toBe('Fredoka');
  expect(s.settings.roundness).toBe(0.6);
});

test('textLength "long" uses a longer fixture pool than "short"', () => {
  const short = buildState({ entryCount: 1, textLength: 'short' }, TODAY);
  const long = buildState({ entryCount: 1, textLength: 'long' }, TODAY);
  expect(long.entries[0].did.length).toBeGreaterThan(short.entries[0].did.length);
});

test('gaps preset strings map to offset arrays (skull days without a freeform control)', () => {
  const none = buildState({ entryCount: 3, gaps: 'none' }, TODAY);
  expect(none.entries.map((e) => e.dayKey)).toEqual([TODAY, shiftDayKey(TODAY, -1), shiftDayKey(TODAY, -2)]);

  const one = buildState({ entryCount: 6, gaps: 'one' }, TODAY);
  expect(one.entries.map((e) => e.dayKey)).toEqual(
    [0, 1, 3, 4, 5, 6].map((n) => shiftDayKey(TODAY, -n))
  );

  const scattered = buildState({ entryCount: 6, gaps: 'scattered' }, TODAY);
  expect(scattered.entries.map((e) => e.dayKey)).toEqual(
    [0, 1, 3, 4, 6, 7].map((n) => shiftDayKey(TODAY, -n))
  );
});
