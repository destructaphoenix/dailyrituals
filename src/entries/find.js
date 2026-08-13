// Pure lookup for the tappable heatmaps (IMP-052). Must resolve a dayKey
// collision the same way calendar.js's private indexByDay does — first
// match in array order wins, since entries are newest-first.

export function entryForDayKey(entries, dayKey) {
  if (!Array.isArray(entries) || !dayKey) return null;
  for (const e of entries) {
    if (e && e.dayKey === dayKey) return e;
  }
  return null;
}
