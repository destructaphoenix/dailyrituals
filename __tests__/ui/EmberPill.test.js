// __tests__/ui/EmberPill.test.js — IMP-117. At the chrome font cap the `+`
// glyph in the balance pill must not outgrow a literal line box. jest renders
// a tree, not pixels, so these are source assertions; the walk (WALK-08) is
// the real acceptance.
import fs from 'fs';
import path from 'path';

describe('EmberPill — the "+" circle scales with the font (IMP-117)', () => {
  const SRC = fs.readFileSync(path.join(__dirname, '../../src/shopui.js'), 'utf8');

  test('the "+" text carries no literal lineHeight', () => {
    expect(SRC).not.toMatch(/fontSize: 13, lineHeight: 15/);
  });

  test('the circle derives its size from the capped OS font scale', () => {
    expect(SRC).toMatch(/const plusSize = 17 \* Math\.min\(PixelRatio\.getFontScale\(\), CHROME_FONT_SCALE\);/);
    expect(SRC).toMatch(/width: plusSize, height: plusSize, borderRadius: plusSize \/ 2,/);
  });
});
