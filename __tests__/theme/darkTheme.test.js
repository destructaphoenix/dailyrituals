import { makeTheme, lighten, PALETTES, DARK_THEME, DEFAULT_SETTINGS } from '../../src/theme';

describe('dark theme resolution (IMP-019)', () => {
  it('DARK_THEME is v2 (premium AMOLED dark, owner-approved IMP-019 Round 4)', () => {
    expect(DARK_THEME).toBe('v2');
  });

  it('makeTheme("night") with v2 variant uses nightV2 palette', () => {
    const result = makeTheme('night', DEFAULT_SETTINGS, 'v2');
    expect(result.colors.surface).toBe(PALETTES.nightV2.surface);
    expect(result.colors.cream).toBe(PALETTES.nightV2.cream);
    expect(result.colors.accentSoft).toBe(PALETTES.nightV2.accentSoft);
  });

  it('makeTheme("night") with classic variant uses classic palette (revert guard)', () => {
    const result = makeTheme('night', DEFAULT_SETTINGS, 'classic');
    expect(result.colors.surface).toBe(PALETTES.night.surface);
    expect(result.colors.surface).toBe('#16120d');
    expect(result.colors.accentSoft).toBe(PALETTES.night.accentSoft);
    expect(result.colors.accentSoft).toBe('#2a2113');
  });

  it('v2 and classic have different surface tokens', () => {
    const v2 = makeTheme('night', DEFAULT_SETTINGS, 'v2');
    const classic = makeTheme('night', DEFAULT_SETTINGS, 'classic');
    expect(v2.colors.surface).not.toBe(classic.colors.surface);
  });

  it('PALETTES.night (classic) preserved byte-for-byte — revert is always safe', () => {
    expect(PALETTES.night.cream).toBe('#000000');
    expect(PALETTES.night.surface).toBe('#16120d');
    expect(PALETTES.night.accentSoft).toBe('#2a2113');
    expect(PALETTES.night.border).toBe('#2c261f');
    expect(PALETTES.night.muted).toBe('#9b9286');
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
