// __tests__/ui/EmberPill.test.js — IMP-117/IMP-119. At the chrome font cap the
// `+` glyph in the balance pill must not outgrow a literal line box, and its
// lineHeight must scale with the font rather than being absent (IMP-119) or
// fixed (IMP-117's original bug). jest renders a tree, not pixels, so these
// are source assertions; the walk (WALK-08, device) is the real acceptance.
import fs from 'fs';
import path from 'path';

describe('EmberPill — the "+" circle and glyph scale with the font (IMP-117/IMP-119)', () => {
  const SRC = fs.readFileSync(path.join(__dirname, '../../src/shopui.js'), 'utf8');

  test('the "+" text carries a lineHeight scaled by the same font-scale factor as the circle', () => {
    expect(SRC).toMatch(/fontSize: 13, lineHeight: 15 \* fontScale/);
  });

  test('the circle derives its size from the capped OS font scale', () => {
    expect(SRC).toMatch(/const fontScale = Math\.min\(PixelRatio\.getFontScale\(\), CHROME_FONT_SCALE\);/);
    expect(SRC).toMatch(/const plusSize = 17 \* fontScale;/);
    expect(SRC).toMatch(/width: plusSize, height: plusSize, borderRadius: plusSize \/ 2,/);
  });
});
