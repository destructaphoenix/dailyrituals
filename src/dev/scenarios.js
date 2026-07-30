// src/dev/scenarios.js
// Named knob-set presets for the dev harness. Each is fed to buildState.
import { buildState } from './buildState';

export const SCENARIOS_LIST = [
  { key: 'shortStreak',  label: '3-day streak (done today)', knobs: { streak: 3, entryCount: 3, done: true } },
  { key: 'notDoneToday', label: 'Not done today',           knobs: { streak: 4, entryCount: 4, done: false } },
  { key: 'longLegacy',   label: 'Long legacy (80 days)',    knobs: { streak: 80, entryCount: 80, done: true, embers: 1200 } },
  { key: 'brokenStreak', label: 'Broken streak (skulls)',   knobs: { streak: 2, entryCount: 6, gaps: [2, 5], done: true } },
  { key: 'plusUser',     label: 'Plus user',                knobs: { streak: 10, entryCount: 10, done: true, plus: true, ownAll: true, embers: 500 } },
  { key: 'fullShop',     label: 'Full shop (all owned)',    knobs: { streak: 20, entryCount: 20, done: true, ownAll: true, embers: 5000 } },
  { key: 'emptyInsights', label: 'Empty (zero entries)',    knobs: { streak: 0, entryCount: 0, done: false } },
  { key: 'lapsed',        label: 'Lapsed (5 days gone)',     knobs: { streak: 5, entryCount: 5, done: false, endOffset: 5, reminderEnabled: true } },
  { key: 'reminderOn',    label: 'Reminder on',              knobs: { streak: 3, entryCount: 3, done: true, reminderEnabled: true, reminderHour: 20, reminderMinute: 30 } },
  { key: 'staleBackup',   label: 'Stale backup (42d ago)',   knobs: { streak: 5, entryCount: 5, done: true, lastBackupAt: 42 } },
  { key: 'neverBackedUp', label: 'Never backed up',          knobs: { streak: 5, entryCount: 5, done: true, lastBackupAt: -1 } },
  { key: 'longName',      label: 'Long name + night (stress)', knobs: { streak: 5, entryCount: 5, done: true, name: 'A'.repeat(40), textLength: 'long', mode: 'night' } },
  { key: 'canceledSub',   label: 'Canceled subscription',    knobs: { streak: 10, entryCount: 10, done: true, plus: true, subCanceled: true } },
  { key: 'nightAmoled',   label: 'Night / AMOLED',           knobs: { streak: 3, entryCount: 3, done: true, mode: 'night' } },
  { key: 'storeFailure',  label: 'Store purchase failure',   knobs: { streak: 3, entryCount: 3, done: true, storePurchase: 'failed' } },
];

export function buildScenario(key, today) {
  const s = SCENARIOS_LIST.find((x) => x.key === key);
  if (!s) throw new Error(`unknown scenario: ${key}`);
  return buildState(s.knobs, today);
}
