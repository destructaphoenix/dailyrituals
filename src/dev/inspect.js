// src/dev/inspect.js
// Pure, read-only. Turns a persisted state slice into inspector rows for the
// harness's Inspector section (IMP-032 Part C) — grouped, and computed
// through the SAME real helpers the app uses (currentStreak, levelFromXp,
// deriveAchievements, serialize), so this shows what the app actually
// computed, never a parallel calculation that could drift from it.
import { currentStreak, longestConsecutiveRun } from '../insights/dateKeys';
import { levelFromXp } from '../profile/level';
import { deriveAchievements } from '../profile/achievements';
import { serialize, SCHEMA_VERSION } from '../persistence/state';
import { dayKeyOf } from '../time/dayKey';
import { SENTINEL } from './sentinel';

export const DEV_ID = `${SENTINEL}/inspect`;

function row(group, label, value) {
  return { group, label, value };
}

// An entry's id carries its creation epoch ('new' + Date.now()) — the ground
// truth a IMP-057 migration would need. Recompute what dayKeyOf() would have
// stamped at that instant; entries whose id doesn't match this shape (legacy
// or dev-generated) are left alone — recomputedDayKey falls back to the
// entry's own dayKey, so they never count as drift.
const NEW_ID_MS = /^new(\d{10,})$/;

function recomputedDayKey(entry) {
  const m = entry && entry.id && NEW_ID_MS.exec(entry.id);
  return m ? dayKeyOf(new Date(Number(m[1]))) : entry.dayKey;
}

// IMP-056 report-only reporter (step 5): how many entries/trash items were
// stamped with a UTC-derived dayKey that disagrees with what dayKeyOf() would
// stamp today, and whether remapping them would move currentStreak. Never
// writes anything — the actual migration is IMP-057, unspecced.
export function dayKeyDrift(entries = [], trash = [], todayKey) {
  const originalKeys = entries.map((e) => e.dayKey);
  const recomputedKeys = entries.map(recomputedDayKey);
  const entryDrift = recomputedKeys.filter((k, i) => k !== originalKeys[i]).length;
  const trashDrift = trash.filter((e) => recomputedDayKey(e) !== e.dayKey).length;
  return {
    disagreeCount: entryDrift + trashDrift,
    wouldChangeStreak: currentStreak(originalKeys, todayKey) !== currentStreak(recomputedKeys, todayKey),
  };
}

export function inspectState(slice = {}, todayKey) {
  const entries = slice.entries || [];
  const dayKeys = entries.map((e) => e.dayKey);
  const streak = currentStreak(dayKeys, todayKey);
  const longest = longestConsecutiveRun(dayKeys);
  const wroteToday = dayKeys.includes(todayKey);
  const level = levelFromXp(slice.xp || 0);
  const achievements = deriveAchievements(entries, streak);
  const badgesEarned = achievements.filter((a) => a.done).length;
  const settings = slice.settings || {};
  const serialized = serialize(slice);
  const drift = dayKeyDrift(entries, slice.trash || [], todayKey);

  return [
    row('Journal', 'Entry count', entries.length),
    row('Journal', 'First day', entries.length ? dayKeys[dayKeys.length - 1] : null),
    row('Journal', 'Last day', entries.length ? dayKeys[0] : null),
    row('Journal', 'Current streak', streak),
    row('Journal', 'Longest run', longest),
    row('Journal', 'Wrote today', wroteToday),

    row('Progress', 'XP', slice.xp || 0),
    row('Progress', 'Level', `${level.level} — ${level.name}`),
    row('Progress', 'Into level', level.into),
    row('Progress', 'To next', level.toNext),
    row('Progress', 'Badges earned', `${badgesEarned}/${achievements.length}`),

    row('Economy', 'Embers', slice.embers || 0),
    row('Economy', 'Freezes', slice.freezes || 0),
    row('Economy', 'Plus', !!slice.plus),
    row('Economy', 'Plan', slice.activePlan ?? null),
    row('Economy', 'Canceled', !!slice.subCanceled),

    row('Cosmetics', 'Active palette', slice.activePalette ?? null),
    row('Cosmetics', 'Owned palettes', (slice.ownedPalettes || []).length),
    row('Cosmetics', 'Active sky', slice.activeSky ?? null),
    row('Cosmetics', 'Owned skies', (slice.ownedSkies || []).length),

    ...Object.keys(settings).map((k) => row('Settings', k, settings[k])),

    row('Storage', 'lastSavedAt', JSON.parse(serialized).lastSavedAt),
    row('Storage', 'Schema version', SCHEMA_VERSION),
    row('Storage', 'Serialized bytes', serialized.length),

    row('Data health', 'dayKey drift (entries + trash, IMP-056)', drift.disagreeCount),
    row('Data health', 'Would move currentStreak if remapped', drift.wouldChangeStreak),
  ];
}
