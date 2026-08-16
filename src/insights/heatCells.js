// Pure cell-state + label helpers for the Lifetime Progress heatmap (IMP-045).
// No theme imports — InsightsScreen.js maps the returned states to styling.

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Precedence: future > frozen > missed > empty > done.
export function cellState(cell) {
  if (cell.future) return 'future';
  if (cell.frozen) return 'frozen';
  if (cell.missed) return 'missed';
  if (cell.empty) return 'empty';
  return 'done';
}

// One label per row: the short month name on the row whose first cell begins
// a new month, '' otherwise. Row 0 always gets a label (when its month is
// knowable). Rows/cells missing a parseable dayKey never throw — they just
// carry no label.
export function monthLabelsForRows(rows) {
  let prevMonth = null;
  return rows.map((row) => {
    const dayKey = row && row[0] && row[0].dayKey;
    const month = typeof dayKey === 'string' ? Number(dayKey.slice(5, 7)) - 1 : NaN;
    if (Number.isNaN(month)) return '';
    const label = month === prevMonth ? '' : MONTH_SHORT[month];
    prevMonth = month;
    return label;
  });
}

// The month-label gutter and the gap between cells. Both live here rather than
// inline in InsightsScreen because the legend under the grid must indent to
// exactly where the first cell starts — gutter + gap — and two magic numbers in
// two places is precisely how they drifted apart (the gutter was 24, the legend's
// indent 28). Growing with the OS font scale and capped at 1.5, which is not a
// guess: MAX_FONT_SCALE (src/ui/textScale.js) is the most `T` will ever scale, so
// at the cap a 42dp box always clears 'Aug' at 9.5pt. (IMP-073)
export const HEAT_GUTTER_BASE_DP = 28;
export const HEAT_CELL_GAP = 4;

export function heatGutterWidth(fontScale = 1) {
  const s = Number(fontScale);
  const safe = Number.isFinite(s) && s > 1 ? Math.min(s, 1.5) : 1;
  return Math.round(HEAT_GUTTER_BASE_DP * safe);
}
