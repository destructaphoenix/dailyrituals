// src/insights/search.js — pure full-text + mood + date search over the
// journal (IMP-035). No imports from screens. Reads `e.mood` (singular) —
// IMP-037 owns the switch to `e.moods` and updates this file when it lands.

// String.prototype.normalize isn't guaranteed on every Hermes build in this
// app's range, so diacritic folding must degrade to case-only, never throw.
export function foldDiacritics(s) {
  try {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  } catch {
    return s;
  }
}

export function normalize(s) {
  return foldDiacritics(s).toLowerCase().trim();
}

export function searchEntries(entries, query = {}) {
  const { text, moods, from, to } = query;
  const needle = text ? normalize(text) : '';
  const moodSet = moods && moods.length ? new Set(moods) : null;

  return (entries || [])
    .filter(Boolean)
    .filter((e) => {
      if (needle) {
        const haystack = normalize(`${e.did || ''} ${e.wished || ''}`);
        if (!haystack.includes(needle)) return false;
      }
      if (moodSet && !moodSet.has(e.mood)) return false;
      if (from && e.dayKey < from) return false;
      if (to && e.dayKey > to) return false;
      return true;
    })
    .sort((a, b) => (a.dayKey < b.dayKey ? 1 : a.dayKey > b.dayKey ? -1 : 0));
}
