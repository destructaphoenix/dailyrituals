// heroChrome.js — the streak hero's own colour set (IMP-124).
//
// The hero is the one surface in this app whose GROUND is not the theme. When a
// video sky plays behind it the card is footage: mid-tone, moving, and exactly
// as dark in day mode as at night. IMP-121 worked that out for the text SHADOW
// and left every COLOUR on the day theme, so day mode painted #292524 ink and
// #6f6a78 subtitles onto dark water. WALK-21 read the subtitle as unreadable.
//
// Over footage the answer is not "the night tokens" — it is a fixed white ramp
// that owes nothing to the palette, because the clip owes nothing to it either.
const SHADOW = { textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10 };

export function heroChrome(colors, { dark = false, overVideo = false } = {}) {
  if (overVideo) {
    return {
      title: '#ffffff',
      subtitle: 'rgba(255,255,255,0.86)',
      meta: '#ffffff',
      metaDim: 'rgba(255,255,255,0.80)',
      hairline: 'rgba(255,255,255,0.26)',
      textShadow: SHADOW,
      // An accent halo behind an accent glyph reads as bloom on near-black and
      // as mush on a mid-tone. Over footage it goes dark.
      numeralShadow: { textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 14 },
    };
  }
  return {
    title: colors.ink,
    subtitle: colors.dimText,
    meta: colors.ink,
    metaDim: colors.muted,
    hairline: colors.border,
    textShadow: dark ? SHADOW : null,
    numeralShadow: dark
      ? { textShadowColor: colors.accent + '8C', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 16 }
      : null,
  };
}
