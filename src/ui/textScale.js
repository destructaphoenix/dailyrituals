// textScale.js — app-wide font-scale caps (IMP-030 part B). `maxFontSizeMultiplier`
// is native text measurement, so this must ship in a Build, never an OTA.
export const MAX_FONT_SCALE = 1.5; // body/content text
export const CHROME_FONT_SCALE = 1.2; // fixed-size chrome: tabs, FAB label, pills, badges
