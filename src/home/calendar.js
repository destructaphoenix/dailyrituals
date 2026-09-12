// Pure date-grid helpers for the Reflections heatmap and the Today week strip.
// Both derive cells from real `entries` (each carrying a `dayKey` = YYYY-MM-DD,
// produced the same local way as dayKeyOf() in RitualsApp) and an injectable
// `today` Date.
//
// Day states: done (entry exists), missed (past, no entry, on/after firstEntry),
// empty (past, no entry, before firstEntry — or no entries at all), today, future.

import { dayKeyOf as keyOf } from '../time/dayKey';
import { MONTH_SHORT, cellState } from '../insights/heatCells';
import { countWords } from '../insights/words';

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
export function buildHeatmap(entries, today = new Date(), { frozenDays = [] } = {}) {
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const firstKey = minDayKey(entries);
  const frozen = new Set(frozenDays || []);
  const cells = [];
  for (let i = 34; i >= 0; i -= 1) {
    const dayKey = shiftKey(todayK, -i);
    const isToday = dayKey === todayK;
    const entry = byDay[dayKey];
    if (entry) {
      cells.push({ dayKey, moods: entry.moods || [], today: isToday });
    } else if (!isToday && firstKey && dayKey >= firstKey) {
      cells.push(frozen.has(dayKey)
        ? { dayKey, frozen: true, today: false }
        : { dayKey, missed: true, today: false });
    } else {
      cells.push({ dayKey, empty: true, today: isToday });
    }
  }
  return cells;
}

// Adaptive lifetime heatmap: an array of week-rows (each 7 cells, Monday-first),
// spanning the week of the first entry through the week containing today. Grows
// as history accumulates; returns [] when there are no entries.
export function buildLifetimeHeatmap(entries, today = new Date(), { frozenDays = [] } = {}) {
  const firstKey = minDayKey(entries);
  if (!firstKey) return [];
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const endMonday = shiftKey(todayK, -weekdayMon0(todayK));
  const frozen = new Set(frozenDays || []);
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
      else if (dayKey >= firstKey) row.push(frozen.has(dayKey)
        ? { dayKey, frozen: true, today: isToday }
        : { dayKey, missed: true, today: isToday });
      else row.push({ dayKey, empty: true, today: isToday });
    }
    rows.push(row);
    weekStart = shiftKey(weekStart, 7);
  }
  return rows;
}

const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// 7 cells, Monday-first, for the calendar week containing today.
export function buildWeekStrip(entries, today = new Date(), { frozenDays = [] } = {}) {
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const mondayK = shiftKey(todayK, -weekdayMon0(todayK));
  const firstKey = minDayKey(entries);
  const frozen = new Set(frozenDays || []);
  const cells = [];
  for (let i = 0; i < 7; i += 1) {
    const dayKey = shiftKey(mondayK, i);
    let state;
    if (dayKey === todayK) state = 'today';
    else if (dayKey > todayK) state = 'future';
    else if (byDay[dayKey]) state = 'done';
    else if (firstKey && dayKey >= firstKey) state = frozen.has(dayKey) ? 'frozen' : 'missed';
    else state = 'empty';
    cells.push({ l: WEEK_LABELS[i], state });
  }
  return cells;
}

function daysInMonth(year, month) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// Tertiles over the `done` cells' word counts, computed across the whole
// strip so the ramp is comparable month to month. Fewer than 3 done days, or
// no spread at all, gives every done day heat2 rather than a ramp invented
// from one value (IMP-120, decision 1).
function assignHeatTiers(doneRefs) {
  const n = doneRefs.length;
  if (n === 0) return;
  const sorted = [...doneRefs].sort((a, b) => a.words - b.words);
  const noSpread = sorted[0].words === sorted[n - 1].words;
  if (n < 3 || noSpread) {
    for (const ref of doneRefs) ref.cell.heat = 2;
    return;
  }
  sorted.forEach((ref, i) => {
    ref.cell.heat = Math.floor((i * 3) / n) + 1;
  });
}

// One block per calendar month from the first entry's month through the
// current month, oldest first. Each block is a full calendar (every day of
// the month, `lead` blanks before day 1) so the grid never grows past a
// constant height however long the journal gets. Empty journal -> [].
export function buildMonthHeat(entries, today = new Date(), { frozenDays = [] } = {}) {
  const firstKey = minDayKey(entries);
  if (!firstKey) return [];
  const byDay = indexByDay(entries);
  const todayK = keyOf(today);
  const frozen = new Set(frozenDays || []);

  const [fy, fm] = firstKey.split('-').map(Number);
  const [ty, tm] = todayK.split('-').map(Number);

  const doneRefs = [];
  const months = [];
  let y = fy;
  let m = fm - 1;
  while (y < ty || (y === ty && m <= tm - 1)) {
    const total = daysInMonth(y, m);
    const firstDayKey = `${y}-${pad2(m + 1)}-01`;
    const lead = weekdayMon0(firstDayKey);
    let kept = 0;
    const cells = [];
    for (let d = 1; d <= total; d += 1) {
      const dayKey = `${y}-${pad2(m + 1)}-${pad2(d)}`;
      const isToday = dayKey === todayK;
      const entry = byDay[dayKey];
      let raw;
      if (entry) {
        raw = { dayKey, moods: entry.moods || [], today: isToday };
      } else if (dayKey > todayK) {
        raw = { dayKey, future: true, today: isToday };
      } else if (dayKey >= firstKey) {
        raw = frozen.has(dayKey)
          ? { dayKey, frozen: true, today: isToday }
          : { dayKey, missed: true, today: isToday };
      } else {
        raw = { dayKey, empty: true, today: isToday };
      }
      const state = cellState(raw);
      const cell = { dayKey, state, heat: 0, today: isToday, moods: raw.moods || [] };
      if (state === 'done') {
        kept += 1;
        doneRefs.push({ cell, words: countWords(entry.did) + countWords(entry.wished) });
      }
      cells.push(cell);
    }
    months.push({ year: y, month: m, label: MONTH_SHORT[m], lead, kept, total, cells });
    m += 1;
    if (m > 11) { m = 0; y += 1; }
  }

  assignHeatTiers(doneRefs);
  return months;
}
