// __tests__/home/heroChrome.test.js — IMP-124. The streak hero's colours come
// from its GROUND (footage vs. theme card), not from the day/night mode — the
// mode only matters when there is no video, exactly the property the original
// bug got backwards (IMP-121 fixed the shadow but not the colour).
import { heroChrome } from '../../src/home/heroChrome';

const DAY = { ink: '#292524', dimText: '#6f6a78', muted: '#6f6a78', border: '#e8e3da', accent: '#f59e0b' };
const NIGHT = { ink: '#f4eee4', dimText: '#c9c3bb', muted: '#8b857c', border: '#26241f', accent: '#f59e0b' };

describe('heroChrome (IMP-124)', () => {
  test('day, no video — untouched theme tokens, no shadow', () => {
    const hero = heroChrome(DAY, { dark: false, overVideo: false });
    expect(hero.title).toBe('#292524');
    expect(hero.subtitle).toBe('#6f6a78');
    expect(hero.numeralShadow).toBeNull();
    expect(hero.textShadow).toBeNull();
  });

  test('night, no video — the accent glow and shadow apply, night ink', () => {
    const hero = heroChrome(NIGHT, { dark: true, overVideo: false });
    expect(hero.numeralShadow.textShadowColor.endsWith('8C')).toBe(true);
    expect(hero.title).toBe(NIGHT.ink);
    expect(hero.textShadow).not.toBeNull();
  });

  test('day, over video — the white ramp, not the day theme (the bug this spec fixes)', () => {
    const hero = heroChrome(DAY, { dark: false, overVideo: true });
    expect(hero.title).toBe('#ffffff');
    expect(hero.subtitle).toBe('rgba(255,255,255,0.86)');
    expect(hero.numeralShadow.textShadowColor).toBe('rgba(0,0,0,0.55)');
  });

  test('night over video === day over video — the ground decides, not the mode', () => {
    const dayOverVideo = heroChrome(DAY, { dark: false, overVideo: true });
    const nightOverVideo = heroChrome(NIGHT, { dark: true, overVideo: true });
    expect(nightOverVideo).toEqual(dayOverVideo);
  });
});
