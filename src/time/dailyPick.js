// dailyPick.js — deterministic, offline daily selection.
// The local calendar day is the seed, so a pick is stable for the whole day
// and needs no stored state. Hashing the day (not day % len) makes consecutive
// days look unrelated rather than cycling in visible order.

// Integer index of the local calendar day. Uses Date.UTC of the local Y/M/D so
// it is stable across the day and unaffected by DST.
export function dayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

// mulberry32 PRNG — tiny, fast, deterministic for a given 32-bit seed.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stateless daily pick from a pool. `salt` lets independent slots rotate
// differently from the same date without colliding.
export function pickForDay(pool, date = new Date(), salt = 0) {
  if (!pool || pool.length === 0) return '';
  const rnd = mulberry32(dayNumber(date) + salt);
  return pool[Math.floor(rnd() * pool.length)];
}
