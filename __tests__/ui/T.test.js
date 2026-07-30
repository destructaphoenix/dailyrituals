import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { T } from '../../src/ui';
import { MAX_FONT_SCALE } from '../../src/ui/textScale';

describe('T', () => {
  test('defaults to the app-wide font-scale cap', () => {
    const { UNSAFE_getByType } = render(<T>hello</T>);
    expect(UNSAFE_getByType(Text).props.maxFontSizeMultiplier).toBe(MAX_FONT_SCALE);
  });

  test('caller can override the cap (e.g. chrome uses a tighter one)', () => {
    const { UNSAFE_getByType } = render(<T maxFontSizeMultiplier={1.2}>hello</T>);
    expect(UNSAFE_getByType(Text).props.maxFontSizeMultiplier).toBe(1.2);
  });
});
