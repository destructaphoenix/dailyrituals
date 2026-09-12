import { cellState, HEAT_CELL_GAP } from '../../src/insights/heatCells';

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

describe('HEAT_CELL_GAP', () => {
  test('is 4dp', () => {
    expect(HEAT_CELL_GAP).toBe(4);
  });
});
