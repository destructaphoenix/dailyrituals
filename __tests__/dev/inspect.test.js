// __tests__/dev/inspect.test.js
import { inspectState } from '../../src/dev/inspect';
import { buildState } from '../../src/dev/buildState';
import { currentStreak, longestConsecutiveRun } from '../../src/insights/dateKeys';
import { levelFromXp } from '../../src/profile/level';
import { deriveAchievements } from '../../src/profile/achievements';
import { SCHEMA_VERSION } from '../../src/persistence/state';

const TODAY = '2026-06-14';

function findRow(rows, group, label) {
  return rows.find((r) => r.group === group && r.label === label);
}

test('every expected group is present', () => {
  const s = buildState({ streak: 3, entryCount: 3, done: true }, TODAY);
  const rows = inspectState(s, TODAY);
  const groups = new Set(rows.map((r) => r.group));
  expect(groups).toEqual(new Set(['Journal', 'Progress', 'Economy', 'Cosmetics', 'Settings', 'Storage']));
});

test('Journal group matches the real derivation helpers', () => {
  const s = buildState({ streak: 6, entryCount: 6, gaps: [2], done: true }, TODAY);
  const rows = inspectState(s, TODAY);
  const dayKeys = s.entries.map((e) => e.dayKey);

  expect(findRow(rows, 'Journal', 'Entry count').value).toBe(s.entries.length);
  expect(findRow(rows, 'Journal', 'First day').value).toBe(dayKeys[dayKeys.length - 1]);
  expect(findRow(rows, 'Journal', 'Last day').value).toBe(dayKeys[0]);
  expect(findRow(rows, 'Journal', 'Current streak').value).toBe(currentStreak(dayKeys, TODAY));
  expect(findRow(rows, 'Journal', 'Longest run').value).toBe(longestConsecutiveRun(dayKeys));
  expect(findRow(rows, 'Journal', 'Wrote today').value).toBe(dayKeys.includes(TODAY));
});

test('Progress group matches levelFromXp + deriveAchievements', () => {
  const s = buildState({ streak: 10, entryCount: 10, done: true, xp: 900 }, TODAY);
  const rows = inspectState(s, TODAY);
  const streak = currentStreak(s.entries.map((e) => e.dayKey), TODAY);
  const level = levelFromXp(900);
  const achievements = deriveAchievements(s.entries, streak);
  const badgesEarned = achievements.filter((a) => a.done).length;

  expect(findRow(rows, 'Progress', 'XP').value).toBe(900);
  expect(findRow(rows, 'Progress', 'Level').value).toContain(level.name);
  expect(findRow(rows, 'Progress', 'Into level').value).toBe(level.into);
  expect(findRow(rows, 'Progress', 'To next').value).toBe(level.toNext);
  expect(findRow(rows, 'Progress', 'Badges earned').value).toBe(`${badgesEarned}/${achievements.length}`);
});

test('Economy group reads embers/freezes/plus/plan/canceled', () => {
  const s = buildState({ plus: true, subCanceled: true, embers: 500, freezes: 2, plan: 'monthly' }, TODAY);
  const rows = inspectState(s, TODAY);
  expect(findRow(rows, 'Economy', 'Embers').value).toBe(500);
  expect(findRow(rows, 'Economy', 'Freezes').value).toBe(2);
  expect(findRow(rows, 'Economy', 'Plus').value).toBe(true);
  expect(findRow(rows, 'Economy', 'Plan').value).toBe('monthly');
  expect(findRow(rows, 'Economy', 'Canceled').value).toBe(true);
});

test('Cosmetics group reports active + owned counts', () => {
  const s = buildState({ ownAll: true, palette: 'marigold', sky: 'harvest' }, TODAY);
  const rows = inspectState(s, TODAY);
  expect(findRow(rows, 'Cosmetics', 'Active palette').value).toBe('marigold');
  expect(findRow(rows, 'Cosmetics', 'Owned palettes').value).toBe(s.ownedPalettes.length);
  expect(findRow(rows, 'Cosmetics', 'Active sky').value).toBe('harvest');
  expect(findRow(rows, 'Cosmetics', 'Owned skies').value).toBe(s.ownedSkies.length);
});

test('Settings group includes every settings key, with the full reminder object', () => {
  const s = buildState({ reminderEnabled: true, reminderHour: 7, reminderMinute: 15, name: 'Zara' }, TODAY);
  const rows = inspectState(s, TODAY);
  const settingsRows = rows.filter((r) => r.group === 'Settings');
  const labels = settingsRows.map((r) => r.label);
  for (const k of Object.keys(s.settings)) expect(labels).toContain(k);
  expect(findRow(rows, 'Settings', 'reminder').value).toEqual({ enabled: true, hour: 7, minute: 15 });
  expect(findRow(rows, 'Settings', 'name').value).toBe('Zara');
});

test('Storage group reports lastSavedAt, schema version, serialized byte length', () => {
  const s = buildState({ streak: 3, entryCount: 3, done: true }, TODAY);
  const rows = inspectState(s, TODAY);
  expect(typeof findRow(rows, 'Storage', 'lastSavedAt').value).toBe('number');
  expect(findRow(rows, 'Storage', 'Schema version').value).toBe(SCHEMA_VERSION);
  expect(findRow(rows, 'Storage', 'Serialized bytes').value).toBeGreaterThan(0);
});

test('empty slice does not crash and reports zeroed-out values', () => {
  const rows = inspectState({ entries: [], settings: {} }, TODAY);
  expect(findRow(rows, 'Journal', 'Entry count').value).toBe(0);
  expect(findRow(rows, 'Journal', 'First day').value).toBeNull();
  expect(findRow(rows, 'Journal', 'Last day').value).toBeNull();
  expect(findRow(rows, 'Journal', 'Current streak').value).toBe(0);
  expect(findRow(rows, 'Journal', 'Longest run').value).toBe(0);
  expect(findRow(rows, 'Journal', 'Wrote today').value).toBe(false);
  expect(findRow(rows, 'Progress', 'XP').value).toBe(0);
});
