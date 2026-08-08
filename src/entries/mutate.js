// entries/mutate.js — edit, delete (30-day trash) and restore over the
// entries array (IMP-036). All pure, all return new objects/arrays; never
// mutate `entries`/`trash` in place. Entries stay newest-first throughout,
// matching every other producer in the tree (applyCompletion prepends,
// dev/generateEntries walks back from today).

import { currentStreak, DAY_MS } from '../insights/dateKeys';

// Replaces the day's text/mood in place (same array position, same id/day/
// mon/wd/dayKey). A no-op — same reference back — when the day doesn't
// exist, so a caller can never back-fill a day that was never written.
export function applyEdit(entries, dayKey, { did, wished, mood }) {
  const idx = entries.findIndex((e) => e.dayKey === dayKey);
  if (idx === -1) return entries;
  const next = [...entries];
  next[idx] = { ...next[idx], ...{ did, wished, mood } };
  return next;
}

// Moves the entry into trash, stamped with `deletedAt`. Deliberately takes
// no xp/embers — they are persisted counters, not derived, and the day was
// genuinely lived, so this function is structurally incapable of clawing
// them back. Only `currentStreak` (derived) is allowed to feel a delete.
export function applyDelete({ entries, trash }, dayKey, nowMs) {
  const idx = entries.findIndex((e) => e.dayKey === dayKey);
  if (idx === -1) return { entries, trash };
  const entry = entries[idx];
  const nextEntries = entries.filter((_, i) => i !== idx);
  const nextTrash = [...trash, { ...entry, deletedAt: nowMs }];
  return { entries: nextEntries, trash: nextTrash };
}

// Puts a trashed entry back into `entries`, re-inserted in dayKey order
// (newest-first). A no-op — same references back — if it's not in trash.
export function applyRestore({ entries, trash }, dayKey) {
  const idx = trash.findIndex((e) => e.dayKey === dayKey);
  if (idx === -1) return { entries, trash };
  const { deletedAt, ...entry } = trash[idx];
  const nextTrash = trash.filter((_, i) => i !== idx);
  const insertAt = entries.findIndex((e) => e.dayKey < dayKey);
  const nextEntries = insertAt === -1
    ? [...entries, entry]
    : [...entries.slice(0, insertAt), entry, ...entries.slice(insertAt)];
  return { entries: nextEntries, trash: nextTrash };
}

// Drops trash items older than `days` (default 30), keeping the exact
// boundary — an item deleted exactly `days` ago is still kept.
export function pruneTrash(trash, nowMs, days = 30) {
  const windowMs = days * DAY_MS;
  return trash.filter((t) => nowMs - t.deletedAt <= windowMs);
}

// The `currentStreak` a delete of `dayKey` would produce, for the confirm
// copy only — computed before the user commits.
export function streakAfterDelete(entries, dayKey, todayKey, frozenDays) {
  const keys = entries.filter((e) => e.dayKey !== dayKey).map((e) => e.dayKey);
  return currentStreak(keys, todayKey, { frozenDays });
}
