// __tests__/home/heroFrame.test.js — IMP-136 ("Sunrise"). heroLight(streak) is
// the band's light ramp, pure so it is testable without rendering a screen.
import { heroLight, HERO_ART_FOCAL, HERO_FOCAL } from '../../src/home/heroFrame';

describe('heroLight ramps the band with the streak (IMP-136)', () => {
  test('streak 0: faintest, no bloom at all — the card is genuinely empty', () => {
    expect(heroLight(0)).toEqual({ rayOpacity: 0.18, bloom: null });
  });

  test('streak 1: the bloom appears at half strength', () => {
    expect(heroLight(1)).toEqual({ rayOpacity: 0.34, bloom: { strength: 0.5 } });
  });

  test('streak 4: midway through the 2-6 ramp', () => {
    const { rayOpacity, bloom } = heroLight(4);
    expect(rayOpacity).toBeCloseTo(0.34 + 0.16 * (3 / 6));
    expect(bloom.strength).toBeCloseTo(0.5 + 0.5 * (3 / 6));
  });

  test('streak 7: today\'s value, full bloom', () => {
    expect(heroLight(7)).toEqual({ rayOpacity: 0.5, bloom: { strength: 1 } });
  });

  test('streak 210: still capped at the streak-7 value', () => {
    expect(heroLight(210)).toEqual({ rayOpacity: 0.5, bloom: { strength: 1 } });
  });
});

test('HERO_ART_FOCAL and HERO_FOCAL are two different points (IMP-136)', () => {
  expect(HERO_ART_FOCAL).not.toBe(HERO_FOCAL);
});
