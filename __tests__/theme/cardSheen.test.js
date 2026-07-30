import { CARD_SHEEN } from '../../src/ui';

// Pull the alpha out of an `rgba(r,g,b,a)` string.
const alphaOf = (rgba) => Number(/rgba\([^)]*,\s*([\d.]+)\s*\)/.exec(rgba)[1]);

describe('card sheen cannot band on Android (IMP-027 regression)', () => {
  it('ramps over a fixed dp height, not a fraction of the card height', () => {
    // A proportional ramp (the old `absoluteFill` + `end.y: 0.5`) stretches the
    // same ~15 alpha steps over half of whatever the card's height is, so tall
    // cards band worse than short ones and no two cards match.
    expect(typeof CARD_SHEEN.height).toBe('number');
    expect(CARD_SHEEN.height).toBeGreaterThan(0);
    expect(CARD_SHEEN.end).toEqual({ x: 0.5, y: 1 });
  });

  it('keeps every 1/255 alpha step under 4dp so the ramp reads as one highlight', () => {
    const first = alphaOf(CARD_SHEEN.colors[0]);
    const last = alphaOf(CARD_SHEEN.colors[CARD_SHEEN.colors.length - 1]);
    const steps = Math.abs(first - last) * 255;

    expect(steps).toBeGreaterThan(0);
    expect(CARD_SHEEN.height / steps).toBeLessThanOrEqual(4);
  });
});
