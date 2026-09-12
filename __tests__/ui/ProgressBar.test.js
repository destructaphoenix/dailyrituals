// __tests__/ui/ProgressBar.test.js — IMP-124. Over a video sky no single fill
// colour survives arbitrary footage, so the bar becomes self-contained: an
// opaque-enough track the footage cannot bleed through, fixed against the fill.
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet, View } from 'react-native';
import { ProgressBar } from '../../src/ui';
import { ThemeContext, makeTheme, DEFAULT_SETTINGS } from '../../src/theme';

const theme = makeTheme('day', DEFAULT_SETTINGS);
const wrap = (ui) => render(<ThemeContext.Provider value={theme}>{ui}</ThemeContext.Provider>);

describe('ProgressBar onVideo (IMP-124)', () => {
  test('onVideo: the track is an opaque-enough black with a white hairline', () => {
    const view = wrap(<ProgressBar value={40} accent="#BFE6FF" onVideo />);
    const track = StyleSheet.flatten(view.UNSAFE_getByType(View).props.style);
    expect(track.backgroundColor).toBe('rgba(0,0,0,0.62)');
    expect(track.borderColor).toBe('rgba(255,255,255,0.26)');
    expect(track.borderWidth).toBe(1);
  });

  test('without onVideo the track is still accent + 40', () => {
    const view = wrap(<ProgressBar value={40} accent="#BFE6FF" />);
    const track = StyleSheet.flatten(view.UNSAFE_getByType(View).props.style);
    expect(track.backgroundColor).toBe('#BFE6FF40');
  });
});
