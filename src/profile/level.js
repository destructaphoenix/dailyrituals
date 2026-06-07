// Pure XP -> level model. Total XP grows forever (no cap); a level's progress
// bar is `into / toNext` (XP earned within the current level / the level's span).
// At the top level `toNext` is null and the bar reads full / "Max".

const LEVELS = [
  { level: 1, name: 'Waking',         at: 0 },
  { level: 2, name: 'Noticing',       at: 100 },
  { level: 3, name: 'Contemplative',  at: 250 },
  { level: 4, name: 'Reflective',     at: 500 },
  { level: 5, name: 'Steadfast',      at: 850 },
  { level: 6, name: 'Luminous',       at: 1300 },
  { level: 7, name: 'Keeper of Days', at: 1900 },
];

export function levelFromXp(totalXp) {
  const xp = Math.max(0, totalXp || 0);
  let i = 0;
  while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1].at) i += 1;
  const cur = LEVELS[i];
  const next = LEVELS[i + 1];
  return {
    level: cur.level,
    name: cur.name,
    into: xp - cur.at,
    toNext: next ? next.at - cur.at : null,
  };
}
