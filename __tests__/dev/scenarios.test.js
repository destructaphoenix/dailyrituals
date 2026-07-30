// __tests__/dev/scenarios.test.js
import { SCENARIOS_LIST, buildScenario } from '../../src/dev/scenarios';
import { PERSISTED_KEYS } from '../../src/persistence/state';
import { serialize, deserialize, pickPersisted } from '../../src/persistence/state';
import { longestConsecutiveRun } from '../../src/insights/dateKeys';
import { SHOP_PALETTES } from '../../src/data';

const TODAY = '2026-06-14';

test('exposes a non-empty list, each with key/label/knobs', () => {
  expect(SCENARIOS_LIST.length).toBeGreaterThanOrEqual(7);
  for (const s of SCENARIOS_LIST) {
    expect(typeof s.key).toBe('string');
    expect(typeof s.label).toBe('string');
    expect(typeof s.knobs).toBe('object');
  }
});

test('every scenario round-trips as a legal persisted state', () => {
  for (const { key } of SCENARIOS_LIST) {
    const slice = buildScenario(key, TODAY);
    const back = deserialize(serialize(pickPersisted(slice)));
    expect(back.entries).toHaveLength(slice.entries.length);
    for (const k of Object.keys(slice)) expect(PERSISTED_KEYS).toContain(k);
  }
});

test('brokenStreak has a gap (not all entries consecutive)', () => {
  const s = buildScenario('brokenStreak', TODAY);
  const keys = s.entries.map((e) => e.dayKey);
  expect(longestConsecutiveRun(keys)).toBeLessThan(keys.length);
});

test('plusUser is Plus and owns every palette', () => {
  const s = buildScenario('plusUser', TODAY);
  expect(s.plus).toBe(true);
  expect(s.ownedPalettes).toHaveLength(SHOP_PALETTES.length);
});

test('emptyInsights has zero entries', () => {
  expect(buildScenario('emptyInsights', TODAY).entries).toHaveLength(0);
});

test('unknown scenario throws', () => {
  expect(() => buildScenario('nope', TODAY)).toThrow(/unknown scenario/);
});

test('canceledSub is Plus with subCanceled true', () => {
  const s = buildScenario('canceledSub', TODAY);
  expect(s.plus).toBe(true);
  expect(s.subCanceled).toBe(true);
});

test('staleBackup / neverBackedUp drive lastBackupAt to the IMP-030 anchor-1 states', () => {
  expect(buildScenario('staleBackup', TODAY).lastBackupAt).not.toBeNull();
  expect(buildScenario('neverBackedUp', TODAY).lastBackupAt).toBeNull();
});

test('longName stresses a 40-char name in night mode with long-form text', () => {
  const s = buildScenario('longName', TODAY);
  expect(s.settings.name).toHaveLength(40);
  expect(s.mode).toBe('night');
});
