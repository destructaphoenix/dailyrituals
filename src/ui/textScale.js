// textScale.js — app-wide font-scale caps (IMP-030 part B). `maxFontSizeMultiplier`
// is native text measurement, so this must ship in a Build, never an OTA.
export const MAX_FONT_SCALE = 1.5; // body/content text
export const CHROME_FONT_SCALE = 1.2; // fixed-size chrome: tabs, FAB label, pills, badges

// The effective body scale: what `T` actually renders at, which is the OS font
// scale clamped to MAX_FONT_SCALE. Layout that has to react to big text must
// read THIS, not `PixelRatio.getFontScale()` — past the cap the text stops
// growing and a raw OS scale would keep escalating a decision the pixels no
// longer support.
export function bodyScale(fontScale = 1) {
  const s = Number(fontScale);
  if (!Number.isFinite(s) || s < 1) return 1;
  return Math.min(s, MAX_FONT_SCALE);
}

// At or above this effective scale, a label+value row stops competing for one
// line and stacks instead (IMP-095). The settings Row (src/ui/rowFit.js) makes
// the same call from an estimated content width; a chart row whose value is a
// joined list has no such estimate, so it uses the scale directly.
export const STACK_FONT_SCALE = 1.3;
