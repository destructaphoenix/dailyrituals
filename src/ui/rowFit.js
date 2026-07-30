// rowFit.js — pure fit estimate for settings Row auto-stacking (IMP-030).
// See PROGRESS.md IMP-030 for the calibration anchors this constant is pinned against.
const GLYPH_RATIO = 0.48;
const LABEL_WEIGHT = 15.5;
const VALUE_WEIGHT = 14;

export function shouldStackRow({ label, value, availableDp, fontScale = 1 }) {
  if (!value) return false;
  const labelLen = label ? label.length : 0;
  const valueLen = value.length;
  const estWidth = fontScale * GLYPH_RATIO * (LABEL_WEIGHT * labelLen + VALUE_WEIGHT * valueLen);
  return estWidth > availableDp;
}
