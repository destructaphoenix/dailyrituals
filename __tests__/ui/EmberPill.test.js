// __tests__/ui/EmberPill.test.js — IMP-117/IMP-119/IMP-127. At the chrome font
// cap the `+` glyph in the balance pill must not outgrow a literal line box,
// and its lineHeight must scale with the font rather than being absent
// (IMP-119) or fixed (IMP-117's original bug). jest renders a tree, not
// pixels, so those two checks are source assertions; the walk (WALK-08,
// device — its claim now lives on Home's pill, IMP-127) is the real
// acceptance. IMP-127 also gates the `+` behind `showAdd`, which a render
// test can check directly.
import fs from 'fs';
import path from 'path';
import React from 'react';
import { render } from '@testing-library/react-native';
import { EmberPill } from '../../src/shopui';

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

describe('EmberPill — the "+" only where it can add embers (IMP-127)', () => {
  test('showAdd={false} renders no "+"', () => {
    const view = render(<EmberPill embers={12} onPress={() => {}} showAdd={false} />);
    expect(view.queryByText('+')).toBeNull();
  });

  test('the default still renders the "+"', () => {
    const view = render(<EmberPill embers={12} onPress={() => {}} />);
    expect(view.getByText('+')).toBeTruthy();
  });
});
