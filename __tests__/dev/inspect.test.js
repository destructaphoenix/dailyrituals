// __tests__/dev/inspect.test.js
import { inspectState, dayKeyDrift } from '../../src/dev/inspect';
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
  expect(groups).toEqual(new Set(['Journal', 'Progress', 'Economy', 'Cosmetics', 'Settings', 'Storage', 'Data health']));
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

describe('dayKeyDrift (IMP-056 step 5 reporter)', () => {
  const withTZ = (tz, fn) => {
    const original = process.env.TZ;
    process.env.TZ = tz;
    try { return fn(); } finally { process.env.TZ = original; }
  };

  test('no drift when nothing has a new<ms> id', () => {
    const entries = [{ id: 'seed-1', dayKey: '2026-06-10' }, { id: 'seed-2', dayKey: '2026-06-11' }];
    const result = dayKeyDrift(entries, [], '2026-06-14');
    expect(result).toEqual({ disagreeCount: 0, wouldChangeStreak: false });
  });

  test('counts a drifting entry and reports the streak it would move', () => withTZ('Asia/Kolkata', () => {
    // 2026-06-14T19:30Z is 2026-06-15 01:00 IST — the old UTC derivation
    // stamped it '2026-06-14'; dayKeyOf would stamp '2026-06-15'.
    const ms = Date.UTC(2026, 5, 14, 19, 30);
    const drifting = { id: `new${ms}`, dayKey: '2026-06-14' };
    const clean = { id: 'seed-clean', dayKey: '2026-06-13' }; // no new<ms> id — never recomputed
    const today = '2026-06-15';

    const result = dayKeyDrift([clean, drifting], [], today);
    expect(result.disagreeCount).toBe(1);
    // Before: 06-13 + 06-14 anchor on yesterday → streak 2.
    // After remap: 06-13 + 06-15 anchor on today → streak 1 (06-14 gap breaks the run).
    expect(result.wouldChangeStreak).toBe(true);
  }));

  test('trash counts toward disagreeCount but never toward wouldChangeStreak', () => withTZ('Asia/Kolkata', () => {
    const ms = Date.UTC(2026, 5, 14, 19, 30);
    const trashedDrifter = { id: `new${ms}`, dayKey: '2026-06-14' };
    const result = dayKeyDrift([], [trashedDrifter], '2026-06-15');
    expect(result.disagreeCount).toBe(1);
    expect(result.wouldChangeStreak).toBe(false);
  }));

  test('inspectState surfaces the drift report under Data health', () => {
    const entries = [{ id: 'seed-1', dayKey: '2026-06-10' }];
    const rows = inspectState({ entries, trash: [], settings: {} }, TODAY);
    expect(findRow(rows, 'Data health', 'dayKey drift (entries + trash, IMP-056)').value).toBe(0);
    expect(findRow(rows, 'Data health', 'Would move currentStreak if remapped').value).toBe(false);
  });
});
