// heroFrame.js — the streak hero's own geometry (IMP-134).
//
// Pulled out of HomeScreen.js so the design-system generator and a guard test
// can read the app's real numbers without importing a screen and pulling the
// whole render tree into node.

// The streak hero's video sky (IMP-121 built the shell; IMP-122 wired it to
// the real sky manifest instead of one hardcoded fixture clip).
export const HERO_HEIGHT = 336;

// The sunburst's focal point. It was 80 from IMP-003 until now, which was the
// middle of a card that sized itself to its content (~232) -- the 300dp disc
// bled off the top and landed on the bottom edge. IMP-130 pinned the card to
// 336 for the sky crop and left the focal where it was, so the disc now hangs
// 70dp off the top and leaves a 106dp bare band underneath. IMP-131 put the
// numeral back ON that focal; it never asked whether the focal was still in the
// right place. It is the card's centre, and both the art and the numeral are
// derived from it here so they cannot drift apart again.
export const HERO_FOCAL = HERO_HEIGHT / 2;

// The ART's focal (IMP-136, "Sunrise"). Two names because they are now two
// ideas: the rays are densest at the focal and sparsest at the tips, so with
// one shared focal at the card's centre the dense half of the art sits BEHIND
// the numeral and the band above it gets 24 near-parallel hairlines. Raising
// only the art's focal puts the convergence IN the band. The numeral does not
// move.
export const HERO_ART_FOCAL = 96;

// How far the rays run. IMP-132 centred the disc and, in doing so, made its own
// outer boundary visible for the first time: a 300dp circle floating in a 350x336
// card shows a bare rim on all four sides and reads as empty. The sunburst was
// never meant to show where it ends -- before IMP-130 it bled off the top edge --
// so the reach is now derived from the card's own diagonal: far enough that the
// tips are always outside the card, at any rotation, on any phone width.
export const HERO_PAD = 20;        // the hero wrapper's paddingHorizontal, both sides
export const HERO_REACH_MARGIN = 1.08; // 8% past the corner, so no round cap ever lands on one
export const heroReach = (windowWidth) =>
  Math.ceil(Math.hypot((windowWidth - HERO_PAD * 2) / 2, HERO_HEIGHT - HERO_ART_FOCAL) * HERO_REACH_MARGIN);

// The band's light ramp (IMP-136). At streak 0 the card is genuinely empty and
// says so with light rather than with a sentence -- the convergence still sits
// in the band, just at its faintest. Pure and unit-testable so HomeScreen does
// not carry the arithmetic.
export function heroLight(streak) {
  if (streak <= 0) return { rayOpacity: 0.18, bloom: null };
  if (streak >= 7) return { rayOpacity: 0.5, bloom: { strength: 1 } };
  if (streak === 1) return { rayOpacity: 0.34, bloom: { strength: 0.5 } };
  const t = (streak - 1) / 6;
  return { rayOpacity: 0.34 + 0.16 * t, bloom: { strength: 0.5 + 0.5 * t } };
}
