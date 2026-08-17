import { makeTheme, lighten, PALETTES, DEFAULT_SETTINGS } from '../../src/theme';

describe('dark theme resolution', () => {
  it('makeTheme("night") takes its structural tokens from PALETTES.night', () => {
    const result = makeTheme('night', DEFAULT_SETTINGS);
    expect(result.colors.surface).toBe(PALETTES.night.surface);
    expect(result.colors.cream).toBe(PALETTES.night.cream);
    // accentSoft is derived from settings.accent[0] in night mode, not inherited from base
    expect(result.colors.accentSoft).not.toBe(PALETTES.night.accentSoft);
  });

  it('night is true-black AMOLED with a neutral near-black card', () => {
    expect(PALETTES.night.cream).toBe('#000000');
    expect(PALETTES.night.surface).toBe('#0e0e10');
    expect(PALETTES.night.border).toBe('#26241f');
    expect(PALETTES.night.muted).toBe('#8b857c');
  });

  it('day and night resolve to different surface tokens', () => {
    expect(makeTheme('night', DEFAULT_SETTINGS).colors.surface)
      .not.toBe(makeTheme('day', DEFAULT_SETTINGS).colors.surface);
  });
});

describe('accentSoft adapts to palette in night mode (no hardcoded amber bleed)', () => {
  it('night accentSoft is palette-derived, not a fixed amber tint', () => {
    const rose = makeTheme('night', { ...DEFAULT_SETTINGS, accent: ['#fb7185', '#be123c', '#ffe4e6'] });
    const amber = makeTheme('night', DEFAULT_SETTINGS);
    // Rose and amber should produce different accentSoft values
    expect(rose.colors.accentSoft).not.toBe(amber.colors.accentSoft);
    // Neither should be the base palette's hardcoded amber accentSoft
    expect(rose.colors.accentSoft).not.toBe('#1c160c');
  });

  it('night accentSoft, heat0, heat1, heat2 are all palette-derived', () => {
    const lavender = makeTheme('night', { ...DEFAULT_SETTINGS, accent: ['#a78bfa', '#7c3aed', '#ede9fe'] });
    // None of the heat levels should be hardcoded amber values
    expect(lavender.colors.accentSoft).not.toBe('#1c160c');
    expect(lavender.colors.heat0).not.toBe('#1c160c');
    expect(lavender.colors.heat1).not.toBe('#3d2c10');
    expect(lavender.colors.heat2).not.toBe('#7a5410');
  });
});

describe('accent gradient stays in-family (no hardcoded amber highlight)', () => {
  const withAccent = (swatch, mode = 'day') =>
    makeTheme(mode, { ...DEFAULT_SETTINGS, accent: swatch });

  it('lighten() mixes a hex toward white', () => {
    expect(lighten('#000000', 0.5)).toBe('#808080');
    expect(lighten('#ffffff', 0.5)).toBe('#ffffff');
    expect(lighten('bad-hex')).toBe('bad-hex'); // graceful passthrough
  });

  it('accentBright is a lighter tint of the chosen accent, not fixed amber', () => {
    // Marigold: accent #f97316 must NOT produce the old amber highlight #fbbf24.
    const marigold = withAccent(['#f97316', '#c2410c', '#ffedd5']);
    expect(marigold.colors.accentBright).toBe(lighten('#f97316', 0.28));
    expect(marigold.colors.accentBright).not.toBe('#fbbf24');
  });

  it('every shop palette derives its own bright stop (day + night)', () => {
    for (const swatch of [
      ['#f59e0b', '#d97706', '#fef3c7'], // Golden Hour
      ['#fb7185', '#be123c', '#ffe4e6'], // Rose Dusk
      ['#a78bfa', '#7c3aed', '#ede9fe'], // Lavender
    ]) {
      const day = withAccent(swatch, 'day');
      const night = withAccent(swatch, 'night');
      expect(day.colors.accentBright).toBe(lighten(swatch[0], 0.28));
      expect(night.colors.accentBright).toBe(lighten(swatch[0], 0.28));
    }
  });
});
