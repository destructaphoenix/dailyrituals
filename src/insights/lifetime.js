import { levelFromXp } from '../profile/level';
import { longestConsecutiveRun, dayKeyToUtcMs, DAY_MS } from './dateKeys';

function countWords(s) {
  if (!s || typeof s !== 'string') return 0;
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

function activeSpanLabel(dayKeys, now) {
  if (!dayKeys.length) return null;
  const first = dayKeys.reduce((min, k) => (k < min ? k : min), dayKeys[0]);
  const todayMs = dayKeyToUtcMs(now.toISOString().slice(0, 10));
  const days = Math.floor((todayMs - dayKeyToUtcMs(first)) / DAY_MS);
  if (days <= 0) return 'Started today';
  if (days === 1) return '1 day in';
  if (days < 31) return `${days} days in`;
  if (days < 365) {
    const m = Math.round(days / 30.4);
    return `${m} ${m === 1 ? 'month' : 'months'} in`;
  }
  const years = days / 365;
  const label = years < 2 ? years.toFixed(1) : String(Math.round(years));
  return `${label} years in`;
}

export function deriveLifetime(entries = [], { xp = 0, currentStreak = 0, now = new Date() } = {}) {
  const dayKeys = entries.map((e) => e && e.dayKey).filter(Boolean);
  const daysRemembered = new Set(dayKeys).size;
  const totalEntries = entries.length;
  const totalWords = entries.reduce((sum, e) => sum + countWords(e && e.did) + countWords(e && e.wished), 0);
  const longestStreak = Math.max(longestConsecutiveRun(dayKeys), currentStreak);
  const { level, name: levelName } = levelFromXp(xp);
  return {
    daysRemembered,
    totalEntries,
    totalWords,
    currentStreak,
    longestStreak,
    level,
    levelName,
    xpEarned: xp,
    activeSpan: activeSpanLabel(dayKeys, now),
  };
}
