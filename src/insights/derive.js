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

function longestConsecutiveRun(keys) {
  if (!keys.length) return 0;
  const utcMs = [...new Set(keys)]
    .map((k) => {
      const [y, m, d] = k.split('-').map(Number);
      return Date.UTC(y, m - 1, d);
    })
    .sort((a, b) => a - b);

  let best = 1, cur = 1;
  for (let i = 1; i < utcMs.length; i++) {
    cur = utcMs[i] - utcMs[i - 1] === 86400000 ? cur + 1 : 1;
    if (cur > best) best = cur;
  }
  return best;
}

export function deriveInsights(entries, currentStreak, now = new Date()) {
  if (!entries.length) {
    return {
      empty: true,
      stats: { currentStreak, longestStreak: 0, daysKept: 0, thisMonth: 0 },
      moodMix: [],
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

  // Mood counts
  const moodMap = {};
  entries.forEach((e) => {
    if (!e.mood) return;
    moodMap[e.mood] = (moodMap[e.mood] || 0) + 1;
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
    rhythm: buckets,
    peakWeekday,
  };
}
