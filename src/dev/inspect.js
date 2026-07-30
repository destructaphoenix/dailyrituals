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
import { SENTINEL } from './sentinel';

export const DEV_ID = `${SENTINEL}/inspect`;

function row(group, label, value) {
  return { group, label, value };
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
  ];
}
