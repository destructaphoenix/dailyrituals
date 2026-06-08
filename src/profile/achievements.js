// profile/achievements.js — derive achievement progress + the Home "Keepsakes"
// medal strip from the user's REAL entries + streak. No hardcoded `cur`/`earned`:
// a brand-new (or reset) user sees every achievement at 0/goal and every medal
// unlit. Reuses deriveInsights so streak/day math lives in one place.

import { deriveInsights } from '../insights/derive';

// Achievements list (the Keepsakes / Achievements modal). Metadata only — the
// `cur`/`done` for each row are computed below from `stat`. Ids/labels/descs/
// icons/goals match the old hardcoded ACHIEVEMENTS so nothing visual changes.
// `stat` ∈ 'daysKept' | 'longestStreak' | 'moodsLogged'.
export const ACHIEVEMENT_DEFS = [
  { id: 'firstlight', label: 'First Light',    desc: 'Lay your first day to rest', icon: 'sunrise', goal: 1,   stat: 'daysKept' },
  { id: 'seven',      label: 'Seven Suns',     desc: 'Keep a seven-day streak',    icon: 'sun',     goal: 7,   stat: 'longestStreak' },
  { id: 'honest',     label: 'Honest Heart',   desc: 'Name twenty-five feelings',  icon: 'heart',   goal: 25,  stat: 'moodsLogged' },
  { id: 'moonlit',    label: 'Moonlit',        desc: 'Lay ten nights to rest',     icon: 'moon',    goal: 10,  stat: 'daysKept' },
  { id: 'society',    label: 'Streak Society', desc: 'Reach a thirty-day streak',  icon: 'diamond', goal: 30,  stat: 'longestStreak' },
  { id: 'keeper',     label: 'Keeper of Days', desc: 'Keep one hundred days',      icon: 'ring',    goal: 100, stat: 'daysKept' },
];

// Home "Keepsakes" strip — five medals, fixed order + icons (mirrors the old
// BADGES constant). Each lights when its stat crosses `threshold`.
export const KEEPSAKE_DEFS = [
  { id: 'firstlight', label: 'First Light',   icon: 'sunrise', threshold: 1,   stat: 'daysKept' },
  { id: 'seven',      label: 'Seven Suns',    icon: 'sun',     threshold: 7,   stat: 'longestStreak' },
  { id: 'honest',     label: 'Honest Heart',  icon: 'check',   threshold: 25,  stat: 'moodsLogged' },
  { id: 'steadfast',  label: '30 Days',       icon: 'diamond', threshold: 30,  stat: 'longestStreak' },
  { id: 'fullcircle', label: 'Full Circle',   icon: 'ring',    threshold: 100, stat: 'daysKept' },
];

// Collapse real entries+streak into the three stat values the defs reference.
function statValues(entries, currentStreak, now) {
  const insights = deriveInsights(entries, currentStreak, now);
  const moodsLogged = insights.moodMix.reduce((sum, x) => sum + x.n, 0);
  return {
    daysKept: insights.stats.daysKept,
    longestStreak: insights.stats.longestStreak,
    moodsLogged,
  };
}

export function deriveAchievements(entries, currentStreak, now = new Date()) {
  const stats = statValues(entries, currentStreak, now);
  return ACHIEVEMENT_DEFS.map((def) => {
    const value = stats[def.stat];
    return { ...def, cur: Math.min(value, def.goal), done: value >= def.goal };
  });
}

export function deriveKeepsakes(entries, currentStreak, now = new Date()) {
  const stats = statValues(entries, currentStreak, now);
  return KEEPSAKE_DEFS.map((def) => ({
    ...def,
    earned: stats[def.stat] >= def.threshold,
  }));
}
