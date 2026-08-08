import { longestConsecutiveRun } from './dateKeys';

const RHYTHM_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Parse a 'YYYY-MM-DD' dayKey as a local date (avoids UTC off-by-one).
function localDate(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Mon-first weekday index (0=Mon … 6=Sun).
function monFirstIndex(date) {
  return (date.getDay() + 6) % 7;
}

export function deriveInsights(entries, currentStreak, now = new Date()) {
  if (!entries.length) {
    return {
      empty: true,
      stats: { currentStreak, longestStreak: 0, daysKept: 0, thisMonth: 0 },
      moodMix: [],
      moodEntryCount: 0,
      rhythm: RHYTHM_LABELS.map((l) => ({ l, n: 0 })),
      peakWeekday: null,
    };
  }

  const nowMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const uniqueKeys = [...new Set(entries.map((e) => e.dayKey))];

  const daysKept = uniqueKeys.length;
  const thisMonth = uniqueKeys.filter((k) => k.slice(0, 7) === nowMonth).length;
  const derivedLongest = longestConsecutiveRun(uniqueKeys);
  const longestStreak = Math.max(derivedLongest, currentStreak);

  // Mood counts — an entry can carry several moods, so it contributes to
  // several buckets at once. moodEntryCount (entries with >=1 mood) is the
  // honest denominator: percentages of moodMix no longer sum to 100.
  const moodMap = {};
  let moodEntryCount = 0;
  entries.forEach((e) => {
    const moods = e.moods || [];
    if (!moods.length) return;
    moodEntryCount += 1;
    moods.forEach((m) => { moodMap[m] = (moodMap[m] || 0) + 1; });
  });
  const moodMix = Object.entries(moodMap)
    .map(([m, n]) => ({ m, n }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);

  // Weekday rhythm (Mon-first)
  const buckets = Array.from({ length: 7 }, (_, i) => ({ l: RHYTHM_LABELS[i], n: 0 }));
  entries.forEach((e) => {
    buckets[monFirstIndex(localDate(e.dayKey))].n += 1;
  });

  const maxN = Math.max(...buckets.map((b) => b.n));
  let peakWeekday = null;
  if (maxN > 0) {
    const peakIdx = buckets.findIndex((b) => b.n === maxN);
    peakWeekday = WEEKDAY_NAMES[peakIdx];
  }

  return {
    empty: false,
    stats: { currentStreak, longestStreak, daysKept, thisMonth },
    moodMix,
    moodEntryCount,
    rhythm: buckets,
    peakWeekday,
  };
}
