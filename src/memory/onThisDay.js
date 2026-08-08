// src/memory/onThisDay.js — pure "On this day" resurfacing (IMP-038).
// No imports from screens. Matches are done on the YYYY-MM-DD components of
// dayKey, never by adding milliseconds to a Date, so 29 Feb never
// false-matches 28 Feb (or vice versa) and a 31-day month falling back into
// a shorter month never rolls over into the next one.

const MONTH_FALLBACK_LABELS = { 6: '6 months ago', 3: '3 months ago', 1: 'A month ago' };
const MONTH_FALLBACK_OFFSETS = [1, 3, 6];

function parts(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return { y, m, d };
}

// Last day of 1-indexed month `m` in year `y`.
function daysInMonth(y, m) {
  return new Date(y, m, 0).getDate();
}

export function onThisDay(entries, todayKey) {
  if (!todayKey) return [];
  const { y: ty, m: tm, d: td } = parts(todayKey);
  const valid = (entries || []).filter((e) => e && typeof e.dayKey === 'string');

  const yearMatches = valid
    .map((entry) => {
      const { y, m, d } = parts(entry.dayKey);
      if (m !== tm || d !== td || y >= ty) return null;
      const n = ty - y;
      return { entry, label: n === 1 ? 'A year ago today' : `${n} years ago today`, monthsBack: n * 12, n };
    })
    .filter(Boolean)
    .sort((a, b) => a.n - b.n)
    .map(({ n, ...rest }) => rest);

  if (yearMatches.length) return yearMatches;

  const results = [];
  for (const offset of MONTH_FALLBACK_OFFSETS) {
    const totalMonths = ty * 12 + (tm - 1) - offset;
    const targetYear = Math.floor(totalMonths / 12);
    const targetMonth = ((totalMonths % 12) + 12) % 12 + 1;
    if (td > daysInMonth(targetYear, targetMonth)) continue;
    const targetKey = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(td).padStart(2, '0')}`;
    valid
      .filter((entry) => entry.dayKey === targetKey)
      .forEach((entry) => results.push({ entry, label: MONTH_FALLBACK_LABELS[offset], monthsBack: offset }));
  }
  return results;
}
