import { currentStreak } from '../insights/dateKeys';

// Pure reward/dedup decision for completing the daily ritual.
//
// The daily ritual rewards ONCE per calendar day: XP/embers apply only on the
// first entry of the day (`prev.done` false). Writing again the same day is
// treated as an EDIT — it replaces today's entry (matched by `dayKey`) with no
// extra XP/embers and no duplicate row.
//
// The celebrated streak is DERIVED from the resulting entries (continuity-aware,
// IMP-024) — logging after a gap celebrates 1, not previous+1. The persisted
// streak counter is gone; display derives it in RitualsApp the same way.
//
// `prev`  = { entries, xp, embers, done, quests }
// `entry` = the fully-built new entry object (must carry a `dayKey`)
// `opts`  = { config: { XP_GAIN, EMBER_GAIN, milestones }, frozenDays }
//
// `frozenDays` (IMP-039 streak insurance) are missed days already covered by
// a candle — read-only here, passed straight to currentStreak so the
// celebrated number matches what the rest of the app displays.
//
// Returns a new slice { entries, xp, embers, done, quests, celebrate, rewarded }.
export function applyCompletion(prev, entry, { config, frozenDays = [] }) {
  if (prev.done) {
    // Already completed today — edit in place, no reward.
    const entries = [entry, ...prev.entries.filter((e) => e.dayKey !== entry.dayKey)];
    return {
      entries,
      xp: prev.xp,
      embers: prev.embers,
      done: prev.done,
      quests: prev.quests,
      celebrate: null,
      rewarded: false,
    };
  }

  const entries = [entry, ...prev.entries];
  const streak = currentStreak(entries.map((e) => e.dayKey), entry.dayKey, { frozenDays });
  const xp = prev.xp + config.XP_GAIN;
  const embers = prev.embers + config.EMBER_GAIN;
  const quests = prev.quests.map((q) => {
    if (q.id === 'write') return { ...q, cur: q.goal };
    if (q.id === 'feel' && entry.moods && entry.moods.length > 0) return { ...q, cur: q.goal };
    return q;
  });

  return {
    entries,
    xp,
    embers,
    done: true,
    quests,
    celebrate: {
      streak,
      xp: config.XP_GAIN,
      embers: config.EMBER_GAIN,
      milestone: config.milestones[streak] || null,
    },
    rewarded: true,
  };
}
