import { dayKeyToUtcMs, utcMsToDayKey, DAY_MS } from '../insights/dateKeys';

// Streak insurance (IMP-039): a candle spends itself, automatically, the
// moment a day passes with no entry — covering exactly that missed day so
// the run stays connected (see currentStreak's frozenDays). Only days
// strictly between the most recent entry and today are eligible (today
// itself hasn't ended yet); already-frozen or already-journaled days are
// skipped, so calling this repeatedly is a no-op once caught up.
//
// Freezes are spent chronologically, oldest missed day first. If they run
// out mid-gap, only the affordable prefix gets covered — the rest of the
// gap still breaks the streak (currentStreak's walk stops at the first
// uncovered day), so candles can be burned without saving a long absence.
export function applyAutoFreeze(entries, frozenDays, freezes, todayKey) {
  if (!entries.length || freezes <= 0) return { frozenDays, freezes, spent: 0, covered: [] };

  const frozenSet = new Set(frozenDays);
  const lastMs = Math.max(...entries.map((e) => dayKeyToUtcMs(e.dayKey)));
  const todayMs = dayKeyToUtcMs(todayKey);

  // Only the gap since the most recent entry can still connect to today —
  // lastMs is that entry's day, so nothing in this range is ever real.
  const missed = [];
  for (let ms = lastMs + DAY_MS; ms < todayMs; ms += DAY_MS) {
    const key = utcMsToDayKey(ms);
    if (!frozenSet.has(key)) missed.push(key);
  }
  if (!missed.length) return { frozenDays, freezes, spent: 0, covered: [] };

  const covered = missed.slice(0, freezes);
  return {
    frozenDays: [...frozenDays, ...covered],
    freezes: freezes - covered.length,
    spent: covered.length,
    covered,
  };
}
