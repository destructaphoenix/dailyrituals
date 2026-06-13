export const DAY_MS = 86400000;

// Parse 'YYYY-MM-DD' to a UTC epoch ms (timezone-independent — for day diffs).
export function dayKeyToUtcMs(key) {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
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
