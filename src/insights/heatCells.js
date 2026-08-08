// Pure cell-state + label helpers for the Lifetime Progress heatmap (IMP-045).
// No theme imports — InsightsScreen.js maps the returned states to styling.

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Precedence: future > done > missed > empty.
export function cellState(cell) {
  if (cell.future) return 'future';
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
