// Pure date-grid helpers for the Reflections heatmap and the Today week strip.
// Both derive cells from real `entries` (each carrying a `dayKey` = YYYY-MM-DD,
// produced the same local way as dayKeyOf() in RitualsApp) and an injectable
// `today` Date.
//
// Day states: done (entry exists), missed (past, no entry, on/after firstEntry),
// empty (past, no entry, before firstEntry — or no entries at all), today, future.

import { dayKeyOf as keyOf } from '../time/dayKey';

// Shift a YYYY-MM-DD key by whole days in UTC (timezone-independent).
function shiftKey(key, deltaDays) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + deltaDays)).toISOString().slice(0, 10);
}

// 0 = Monday .. 6 = Sunday for a YYYY-MM-DD key.
function weekdayMon0(key) {
  const [y, m, d] = key.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

// Index entries by dayKey; newest (first in the array) wins on a collision.
function indexByDay(entries) {
  const map = {};
  for (const e of entries || []) {
    if (e && e.dayKey && !(e.dayKey in map)) map[e.dayKey] = e;
  }
  return map;
}

// Earliest dayKey across all entries, or null if none.
function minDayKey(entries) {
  let min = null;
  for (const e of entries || []) {
    if (e && e.dayKey && (min === null || e.dayKey < min)) min = e.dayKey;
  }
  return min;
}

// 35 cells (5 rows x 7), ending today (today = index 34).
export function buildHeatmap(entries, today = new Date()) {
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const firstKey = minDayKey(entries);
  const cells = [];
  for (let i = 34; i >= 0; i -= 1) {
    const dayKey = shiftKey(todayK, -i);
    const isToday = dayKey === todayK;
    const entry = byDay[dayKey];
    if (entry) {
      cells.push({ dayKey, moods: entry.moods || [], today: isToday });
    } else if (!isToday && firstKey && dayKey >= firstKey) {
      cells.push({ dayKey, missed: true, today: false });
    } else {
      cells.push({ dayKey, empty: true, today: isToday });
    }
  }
  return cells;
}

// Adaptive lifetime heatmap: an array of week-rows (each 7 cells, Monday-first),
// spanning the week of the first entry through the week containing today. Grows
// as history accumulates; returns [] when there are no entries.
export function buildLifetimeHeatmap(entries, today = new Date()) {
  const firstKey = minDayKey(entries);
  if (!firstKey) return [];
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const endMonday = shiftKey(todayK, -weekdayMon0(todayK));
  const rows = [];
  let weekStart = shiftKey(firstKey, -weekdayMon0(firstKey));
  while (weekStart <= endMonday) {
    const row = [];
    for (let i = 0; i < 7; i += 1) {
      const dayKey = shiftKey(weekStart, i);
      const isToday = dayKey === todayK;
      const entry = byDay[dayKey];
      if (entry) {
        row.push({ dayKey, moods: entry.moods || [], today: isToday });
      } else if (dayKey > todayK) row.push({ dayKey, future: true });
      else if (dayKey >= firstKey) row.push({ dayKey, missed: true, today: isToday });
      else row.push({ dayKey, empty: true, today: isToday });
    }
    rows.push(row);
    weekStart = shiftKey(weekStart, 7);
  }
  return rows;
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// 7 cells, Monday-first, for the calendar week containing today.
export function buildWeekStrip(entries, today = new Date()) {
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const mondayK = shiftKey(todayK, -weekdayMon0(todayK));
  const firstKey = minDayKey(entries);
  const cells = [];
  for (let i = 0; i < 7; i += 1) {
    const dayKey = shiftKey(mondayK, i);
    let state;
    if (dayKey === todayK) state = 'today';
    else if (dayKey > todayK) state = 'future';
    else if (byDay[dayKey]) state = 'done';
    else state = (firstKey && dayKey >= firstKey) ? 'missed' : 'empty';
    cells.push({ l: WEEK_LABELS[i], state });
  }
  return cells;
}
