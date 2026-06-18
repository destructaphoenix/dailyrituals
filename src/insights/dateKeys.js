export const DAY_MS = 86400000;

// Parse 'YYYY-MM-DD' to a UTC epoch ms (timezone-independent — for day diffs).
export function dayKeyToUtcMs(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

// Current day-streak as of `todayKey`, derived from the journaled `keys`
// (deduped, unordered). The streak is alive if the most-recent journaled day is
// today OR yesterday (today simply not logged yet); otherwise the gap broke it.
// Counts consecutive calendar days back from that anchor. Empty/broken → 0.
export function currentStreak(keys, todayKey) {
  if (!keys.length) return 0;
  const days = new Set([...new Set(keys)].map(dayKeyToUtcMs));
  const today = dayKeyToUtcMs(todayKey);
  let anchor;
  if (days.has(today)) anchor = today;
  else if (days.has(today - DAY_MS)) anchor = today - DAY_MS;
  else return 0;
  let count = 0;
  for (let ms = anchor; days.has(ms); ms -= DAY_MS) count += 1;
  return count;
}

// Longest run of consecutive calendar days present in `keys` (deduped, unordered).
export function longestConsecutiveRun(keys) {
  if (!keys.length) return 0;
  const ms = [...new Set(keys)].map(dayKeyToUtcMs).sort((a, b) => a - b);
  let best = 1, cur = 1;
  for (let i = 1; i < ms.length; i++) {
    cur = ms[i] - ms[i - 1] === DAY_MS ? cur + 1 : 1;
    if (cur > best) best = cur;
  }
  return best;
}
