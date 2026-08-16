import { cellState, monthLabelsForRows, heatGutterWidth, HEAT_CELL_GAP } from '../../src/insights/heatCells';

describe('cellState', () => {
  test('future cell', () => {
    expect(cellState({ dayKey: '2026-06-20', future: true })).toBe('future');
  });
  test('done cell', () => {
    expect(cellState({ dayKey: '2026-06-10', mood: 'calm' })).toBe('done');
  });
  test('missed cell', () => {
    expect(cellState({ dayKey: '2026-06-10', missed: true })).toBe('missed');
  });
  test('empty cell (before first entry)', () => {
    expect(cellState({ dayKey: '2026-06-01', empty: true })).toBe('empty');
  });
  test('a done cell that is also today still reads done', () => {
    expect(cellState({ dayKey: '2026-06-14', mood: 'calm', today: true })).toBe('done');
  });
  test('precedence: a future cell that also reads empty stays future', () => {
    expect(cellState({ dayKey: '2026-06-20', future: true, empty: true })).toBe('future');
  });
  test('precedence: missed wins over empty when both flags are set', () => {
    expect(cellState({ dayKey: '2026-06-10', missed: true, empty: true })).toBe('missed');
  });
  test('frozen cell', () => {
    expect(cellState({ dayKey: '2026-06-10', frozen: true })).toBe('frozen');
  });
  test('precedence: frozen wins over missed, and future still wins over frozen', () => {
    expect(cellState({ dayKey: '2026-06-10', frozen: true, missed: true })).toBe('frozen');
    expect(cellState({ dayKey: '2026-06-20', future: true, frozen: true })).toBe('future');
  });
});

describe('monthLabelsForRows', () => {
  const row = (firstDayKey) => [{ dayKey: firstDayKey }];

  test('row 0 always gets a label', () => {
    const rows = [row('2026-06-01')];
    expect(monthLabelsForRows(rows)).toEqual(['Jun']);
  });

  test('labels only rows where the month changes', () => {
    const rows = [row('2026-06-29'), row('2026-07-06'), row('2026-07-13')];
    expect(monthLabelsForRows(rows)).toEqual(['Jun', 'Jul', '']);
  });

  test('a run of rows inside one month yields all blanks after row 0', () => {
    const rows = [row('2026-06-01'), row('2026-06-08'), row('2026-06-15')];
    expect(monthLabelsForRows(rows)).toEqual(['Jun', '', '']);
  });

  test('a single-row grid', () => {
    expect(monthLabelsForRows([row('2026-06-01')])).toEqual(['Jun']);
  });

  test('an empty rows array', () => {
    expect(monthLabelsForRows([])).toEqual([]);
  });

  test('rows whose cells lack dayKey never throw', () => {
    expect(monthLabelsForRows([[{}], [{}]])).toEqual(['', '']);
  });
});

describe('heatGutterWidth', () => {
  test('1x scale stays at the base width', () => {
    expect(heatGutterWidth(1)).toBe(28);
  });

  test('1.5x scale grows to 42', () => {
    expect(heatGutterWidth(1.5)).toBe(42);
  });

  test('2.0x scale is capped at 42 — T never scales past MAX_FONT_SCALE', () => {
    expect(heatGutterWidth(2.0)).toBe(42);
  });

  test('a scale below 1 never shrinks the gutter', () => {
    expect(heatGutterWidth(0.85)).toBe(28);
  });

  test('undefined, NaN and non-numeric input fall back to the base width', () => {
    expect(heatGutterWidth(undefined)).toBe(28);
    expect(heatGutterWidth(NaN)).toBe(28);
    expect(heatGutterWidth('abc')).toBe(28);
    expect(HEAT_CELL_GAP).toBe(4);
  });
});
