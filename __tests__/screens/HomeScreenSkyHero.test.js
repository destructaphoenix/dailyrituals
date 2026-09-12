// __tests__/screens/HomeScreenSkyHero.test.js — IMP-121. The streak hero
// swaps its ground between the frozen RayFan/NightRays art and a full-bleed
// video sky depending on the (mockable) videoSkyGate, and the numeral's
// contrast chrome must apply over footage even in day mode.
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { RayFan } from '../../src/art';
import { ThemeContext, makeTheme, DEFAULT_SETTINGS } from '../../src/theme';

jest.mock('../../src/home/videoSkyGate', () => ({ hasVideoSky: jest.fn() }));
const { hasVideoSky } = require('../../src/home/videoSkyGate');

const theme = makeTheme('day', DEFAULT_SETTINGS);
const wrap = (ui) => render(<ThemeContext.Provider value={theme}>{ui}</ThemeContext.Provider>);

const baseProps = {
  copy: { teaser: ['Write something.'], cta: 'Write' },
  mode: 'day',
  streak: 5,
  level: 1,
  levelName: 'Spark',
  xpInto: 2,
  xpToNext: 10,
  entries: [],
  quests: null,
  freezes: null,
  onOpenAchievements: () => {},
  done: true,
  onWrite: () => {},
  onToggleMode: () => {},
  embers: 0,
  plus: false,
  onOpenShop: () => {},
};

describe('the streak hero\'s ground (IMP-121)', () => {
  afterEach(() => hasVideoSky.mockReset());

  test('falls back to RayFan when no video sky is active', () => {
    hasVideoSky.mockReturnValue(false);
    const view = wrap(<HomeScreen {...baseProps} />);
    expect(view.UNSAFE_getAllByType(RayFan)).toHaveLength(1);
  });

  test('the numeral keeps its shadow in day mode under a video sky', () => {
    hasVideoSky.mockReturnValue(true);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const flat = StyleSheet.flatten(view.getByText('day streak').props.style);
    expect(flat.textShadowColor).toBe('rgba(0,0,0,0.7)');
  });

  test('day mode without a video sky carries no such shadow', () => {
    hasVideoSky.mockReturnValue(false);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const flat = StyleSheet.flatten(view.getByText('day streak').props.style);
    expect(flat.textShadowColor).toBeUndefined();
  });
});
