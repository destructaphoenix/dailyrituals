// Pure reward/dedup decision for completing the daily ritual.
//
// The daily ritual rewards ONCE per calendar day: streak/XP/embers apply only
// on the first entry of the day (`prev.done` false). Writing again the same day
// is treated as an EDIT — it replaces today's entry (matched by `dayKey`) with
// no extra streak/XP/embers and no duplicate row.
//
// `prev`  = { entries, streak, xp, embers, done, quests }
// `entry` = the fully-built new entry object (must carry a `dayKey`)
// `opts`  = { config: { XP_GAIN, EMBER_GAIN, XP_MAX, milestones } }
//
// Returns a new slice { entries, streak, xp, embers, done, quests, celebrate, rewarded }.
export function applyCompletion(prev, entry, { config }) {
  if (prev.done) {
    // Already completed today — edit in place, no reward.
    const entries = [entry, ...prev.entries.filter((e) => e.dayKey !== entry.dayKey)];
    return {
      entries,
      streak: prev.streak,
      xp: prev.xp,
      embers: prev.embers,
      done: prev.done,
      quests: prev.quests,
      celebrate: null,
      rewarded: false,
    };
  }

  const streak = prev.streak + 1;
  const xp = Math.min(config.XP_MAX, prev.xp + config.XP_GAIN);
  const embers = prev.embers + config.EMBER_GAIN;
  const quests = prev.quests.map((q) => {
    if (q.id === 'write') return { ...q, cur: q.goal };
    if (q.id === 'feel' && entry.mood) return { ...q, cur: q.goal };
    return q;
  });

  return {
    entries: [entry, ...prev.entries],
    streak,
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
