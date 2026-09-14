// __tests__/art.test.js — IMP-136 ("Sunrise"). RayFan gains a radial fade
// (a <Mask> over the ray geometry, not the geometry itself) and a rayOpacity
// prop the streak ramp can drive. Proved alone before a screen is touched —
// react-native-svg's <Mask> is unproven in this tree (trap 4 in the spec).
import React from 'react';
import { render } from '@testing-library/react-native';
import Svg, { Mask } from 'react-native-svg';
import { RayFan } from '../src/art';
import { ThemeContext, makeTheme, DEFAULT_SETTINGS } from '../src/theme';

const theme = makeTheme('day', DEFAULT_SETTINGS);
const wrap = (ui) => render(<ThemeContext.Provider value={theme}>{ui}</ThemeContext.Provider>);

describe('RayFan gains a radial fade and a rayOpacity prop (IMP-136)', () => {
  test('rayOpacity defaults to 0.5 — every existing caller is untouched', () => {
    const view = wrap(<RayFan />);
    const flat = view.toJSON().props.style;
    expect(flat.opacity).toBe(0.5);
  });

  test('a caller can drive rayOpacity down', () => {
    const view = wrap(<RayFan rayOpacity={0.18} />);
    const flat = view.toJSON().props.style;
    expect(flat.opacity).toBe(0.18);
  });

  test('the ray geometry is masked by a radial fade', () => {
    const view = wrap(<RayFan />);
    expect(view.UNSAFE_getByType(Mask)).toBeTruthy();
    // The mask sits on the same <Svg> as the rays, not a sibling overlay —
    // it must rotate with the geometry it fades, not fight the spin.
    expect(view.UNSAFE_getByType(Svg)).toBeTruthy();
    expect(JSON.stringify(view.toJSON())).toContain('rayFanMask');
  });
});
