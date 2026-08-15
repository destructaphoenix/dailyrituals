// insights/moodMixLayout.js — the Mood Mix label column's width (IMP-067).
// It must be the SAME on every row or the bars start at different x and stop
// being comparable, which is the whole point of the chart. Fixed at 96dp,
// growing with the OS font scale so long names stay readable, capped at 1.5x —
// past that the bar itself has nothing left.
export const MOOD_LABEL_BASE_DP = 96;

export function moodLabelWidth(fontScale = 1) {
  const s = Number(fontScale);
  const safe = Number.isFinite(s) && s > 1 ? Math.min(s, 1.5) : 1;
  return Math.round(MOOD_LABEL_BASE_DP * safe);
}
