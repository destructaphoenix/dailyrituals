// annualRecap.js — the Annual Recap: "your year, remembered" (IMP-046,
// PLUS_PERKS #4). Also where IMP-021's deliberately-deferred milestone
// timeline lands — it lives here and nowhere else.
//
// A year is offerable from 1 December of that year onward, and forever
// after, never before — a "year in review" in March is a lie. A recap of
// fewer than RECAP_MIN_ENTRIES days is worse than no recap, so those years
// never build and never get offered.

import { STREAK_MILESTONES } from '../data';
import { longestConsecutiveRun, dayKeyToUtcMs, DAY_MS } from '../insights/dateKeys';
import { countWords } from '../insights/words';
import { moodByMonth } from '../insights/deeper';

const RECAP_MIN_ENTRIES = 10;
const FIRST_ENTRY_LABEL = 'First entry of the year';

function validDayKey(e) {
  return e && typeof e.dayKey === 'string' && e.dayKey.length === 10;
}

function entriesForYear(entries, year) {
  const y = String(year);
  return (entries || []).filter((e) => validDayKey(e) && e.dayKey.slice(0, 4) === y);
}

// Top 3 moods for the year, reusing IMP-047's moodByMonth counting rather
// than writing a second mood counter — just merged across its 12 buckets.
function topMoodsForYear(yearEntries) {
  const counts = {};
  moodByMonth(yearEntries).forEach((b) => {
    b.moods.forEach(({ m, n }) => { counts[m] = (counts[m] || 0) + n; });
  });
  return Object.entries(counts)
    .sort(([am, an], [bm, bn]) => bn - an || (am < bm ? -1 : am > bm ? 1 : 0))
    .slice(0, 3)
    .map(([m, n]) => ({ m, n }));
}

// Busiest/quietest month by entry count. Ties keep the earlier month, since
// this only updates on a STRICT improvement as it scans Jan → Dec.
function extremesByMonth(buckets) {
  let peak = 0, quiet = 0;
  buckets.forEach((b, i) => {
    if (b.total > buckets[peak].total) peak = i;
    if (b.total < buckets[quiet].total) quiet = i;
  });
  return { peakMonth: buckets[peak].month, quietestMonth: buckets[quiet].month };
}

// The streak-milestone crossings (7/30/100) that fell within `year`, found
// by walking the FULL account history day-by-day — a streak that started in
// a prior year still crosses its milestone on the day it actually happened,
// not on the day the year "started" for recap purposes.
function milestonesInYear(allEntries, year) {
  const y = String(year);
  const allKeys = [...new Set((allEntries || []).filter(validDayKey).map((e) => e.dayKey))].sort();
  const out = [];
  let run = 0;
  let prevMs = null;
  allKeys.forEach((k) => {
    const ms = dayKeyToUtcMs(k);
    run = prevMs !== null && ms - prevMs === DAY_MS ? run + 1 : 1;
    prevMs = ms;
    const label = STREAK_MILESTONES[run];
    if (label && k.slice(0, 4) === y) out.push({ day: k, label });
  });
  return out;
}

// The years offerable right now, newest first.
export function recapYears(entries, now = new Date()) {
  const list = entries || [];
  const years = new Set();
  list.forEach((e) => { if (validDayKey(e)) years.add(Number(e.dayKey.slice(0, 4))); });

  const nowYear = now.getFullYear();
  const isDecember = now.getMonth() === 11;

  return [...years]
    .filter((y) => y < nowYear || (y === nowYear && isDecember))
    .filter((y) => entriesForYear(list, y).length >= RECAP_MIN_ENTRIES)
    .sort((a, b) => b - a);
}

export function buildRecap(entries, year, { xp, now = new Date() } = {}) {
  const yearEntries = entriesForYear(entries, year);
  if (yearEntries.length < RECAP_MIN_ENTRIES) return null;

  const dayKeys = yearEntries.map((e) => e.dayKey);
  const sortedKeys = [...new Set(dayKeys)].sort();
  const totalWords = yearEntries.reduce((sum, e) => sum + countWords(e.did) + countWords(e.wished), 0);

  const buckets = moodByMonth(yearEntries);
  const { peakMonth, quietestMonth } = extremesByMonth(buckets);

  const firstEntry = sortedKeys[0];
  const milestones = [{ day: firstEntry, label: FIRST_ENTRY_LABEL }, ...milestonesInYear(entries, year)]
    .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));

  return {
    year,
    daysRemembered: sortedKeys.length,
    totalWords,
    longestStreak: longestConsecutiveRun(dayKeys),
    firstEntry,
    lastEntry: sortedKeys[sortedKeys.length - 1],
    topMoods: topMoodsForYear(yearEntries),
    peakMonth,
    quietestMonth,
    milestones,
  };
}
