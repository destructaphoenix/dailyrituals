// deeper.js — the analysis layer over IMP-037's mood arrays (IMP-047, PLUS_PERKS #5).
// Three pure functions plus an honesty gate: never draw a chart from too little history.

const RHYTHM_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Parse a 'YYYY-MM-DD' dayKey as a local date (avoids UTC off-by-one).
function localDate(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Mon-first weekday index (0=Mon … 6=Sun).
function monFirstIndex(date) {
  return (date.getDay() + 6) % 7;
}

function moodsOf(entry) {
  return (entry.moods || []).filter(Boolean);
}

export function moodByWeekday(entries) {
  const buckets = Array.from({ length: 7 }, (_, i) => ({ l: RHYTHM_LABELS[i], top: null, n: 0, total: 0 }));
  const counts = Array.from({ length: 7 }, () => ({}));

  (entries || []).forEach((e) => {
    if (!e || !e.dayKey) return;
    const idx = monFirstIndex(localDate(e.dayKey));
    buckets[idx].total += 1;
    moodsOf(e).forEach((m) => { counts[idx][m] = (counts[idx][m] || 0) + 1; });
  });

  buckets.forEach((b, i) => {
    const ranked = Object.entries(counts[i]);
    if (!ranked.length) return;
    const maxN = Math.max(...ranked.map(([, n]) => n));
    const winners = ranked.filter(([, n]) => n === maxN);
    if (winners.length === 1) {
      b.top = winners[0][0];
      b.n = maxN;
    }
  });

  return buckets;
}

export function moodByMonth(entries) {
  const buckets = Array.from({ length: 12 }, (_, i) => ({ month: MONTH_NAMES[i], moods: [], total: 0 }));
  const counts = Array.from({ length: 12 }, () => ({}));

  (entries || []).forEach((e) => {
    if (!e || !e.dayKey) return;
    const idx = localDate(e.dayKey).getMonth();
    buckets[idx].total += 1;
    moodsOf(e).forEach((m) => { counts[idx][m] = (counts[idx][m] || 0) + 1; });
  });

  buckets.forEach((b, i) => {
    b.moods = Object.entries(counts[i])
      .map(([m, n]) => ({ m, n }))
      .sort((a, b2) => b2.n - a.n);
  });

  return buckets;
}

export function moodPairings(entries) {
  const pairs = {};

  (entries || []).forEach((e) => {
    if (!e) return;
    const moods = [...new Set(moodsOf(e))];
    for (let i = 0; i < moods.length; i++) {
      for (let j = i + 1; j < moods.length; j++) {
        const [a, b] = [moods[i], moods[j]].sort();
        const key = `${a}|${b}`;
        pairs[key] = pairs[key] || { a, b, n: 0 };
        pairs[key].n += 1;
      }
    }
  });

  return Object.values(pairs).sort((x, y) => y.n - x.n);
}

export function hasEnoughFor(kind, entries) {
  const list = entries || [];
  if (kind === 'weekday') {
    return list.length >= 14;
  }
  if (kind === 'month') {
    const months = new Set(list.filter((e) => e && e.dayKey).map((e) => e.dayKey.slice(0, 7)));
    return months.size >= 3;
  }
  if (kind === 'pairings') {
    const multi = list.filter((e) => e && moodsOf(e).length >= 2);
    return multi.length >= 5;
  }
  return false;
}
