import { heatCellStyle, LEGEND } from '../../src/screens/InsightsScreen';

// Colour values are irrelevant here — these three tests are about geometry and
// about which states earn a legend row, not about the palette.
const c = {
  accent: '#a', accentSoft: '#b', accentDeep: '#c', border: '#d', ghostBtn: '#e',
};
const STATES = ['done', 'frozen', 'missed', 'empty', 'future'];

describe('heatCellStyle — IMP-073', () => {
  test('every state has identical border geometry', () => {
    for (const s of STATES) {
      expect(heatCellStyle(s, c).borderWidth).toBe(1);
    }
  });

  test('no state uses a dashed border', () => {
    for (const s of STATES) {
      expect(heatCellStyle(s, c).borderStyle).toBeUndefined();
    }
  });

  test('the legend is three entries and "not yet started" is not one of them', () => {
    expect(LEGEND).toHaveLength(3);
    expect(LEGEND.map((l) => l.state)).toEqual(['done', 'frozen', 'missed']);
    expect(LEGEND.some((l) => l.state === 'empty')).toBe(false);
  });
});
