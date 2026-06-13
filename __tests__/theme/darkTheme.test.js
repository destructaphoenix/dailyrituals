import { makeTheme, PALETTES, DARK_THEME, DEFAULT_SETTINGS } from '../../src/theme';

describe('dark theme resolution (IMP-019)', () => {
  it('DARK_THEME defaults to classic (ember-hero direction reverted; redesigning hero)', () => {
    expect(DARK_THEME).toBe('classic');
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
