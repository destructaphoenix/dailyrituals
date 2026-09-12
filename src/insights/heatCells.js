// Pure cell-state + label helpers for the Lifetime Progress heatmap (IMP-045).
// No theme imports — InsightsScreen.js maps the returned states to styling.

export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Precedence: future > frozen > missed > empty > done.
export function cellState(cell) {
  if (cell.future) return 'future';
  if (cell.frozen) return 'frozen';
  if (cell.missed) return 'missed';
  if (cell.empty) return 'empty';
  return 'done';
}

export const HEAT_CELL_GAP = 4;
