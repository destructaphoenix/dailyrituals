// entries/moodFace.js — picks which of a multi-mood day's moods a heatmap
// cell shows on a given tick (IMP-050). Pure: no timers, no state.

export const hashKey = (k) =>
  [...String(k)].reduce((h, ch) => (h * 31 + ch.codePointAt(0)) >>> 0, 7);

export function moodFace(moods, tick = 0, dayKey = '') {
  if (!Array.isArray(moods) || moods.length === 0) return '';
  return moods[(hashKey(dayKey) + tick) % moods.length];
}
