// Pure date-grid helpers for the Reflections heatmap and the Today week strip.
// Both derive cells from real `entries` (each carrying a `dayKey` = YYYY-MM-DD,
// produced the same UTC way as todayKey() in RitualsApp) and an injectable
// `today` Date. No-entry days are neutral empties — never skulls.

import { MOOD_EMOJI } from '../data';

const keyOf = (date) => date.toISOString().slice(0, 10);

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

// 35 cells (5 rows x 7), ending today (today = index 34).
export function buildHeatmap(entries, today = new Date()) {
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const cells = [];
  for (let i = 34; i >= 0; i -= 1) {
    const dayKey = shiftKey(todayK, -i);
    const isToday = dayKey === todayK;
    const entry = byDay[dayKey];
    if (entry) {
      cells.push({ dayKey, mood: entry.mood, emoji: MOOD_EMOJI[entry.mood] || '', today: isToday });
    } else {
      cells.push({ dayKey, empty: true, today: isToday });
    }
  }
  return cells;
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// 7 cells, Monday-first, for the calendar week containing today.
export function buildWeekStrip(entries, today = new Date()) {
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const mondayK = shiftKey(todayK, -weekdayMon0(todayK));
  const cells = [];
  for (let i = 0; i < 7; i += 1) {
    const dayKey = shiftKey(mondayK, i);
    let state;
    if (dayKey === todayK) state = 'today';
    else if (dayKey > todayK) state = 'future';
    else state = byDay[dayKey] ? 'done' : 'empty';
    cells.push({ l: WEEK_LABELS[i], state });
  }
  return cells;
}
