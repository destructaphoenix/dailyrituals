// __tests__/screens/HomeScreenSkyHero.test.js — IMP-121/122. The streak hero
// swaps its ground between the frozen RayFan/NightRays art and a full-bleed
// video sky depending on the (mockable) videoSkyGate manifest lookup, and the
// numeral's contrast chrome must apply over footage even in day mode.
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { RayFan } from '../../src/art';
import { ProgressBar } from '../../src/ui';
import { streakSubtitle } from '../../src/home/streakCopy';
import { ThemeContext, makeTheme, DEFAULT_SETTINGS } from '../../src/theme';

jest.mock('../../src/home/videoSkyGate', () => ({
  activeSkyManifest: jest.fn(),
  skyVideoSource: jest.fn(() => ({ uri: 'mock.mp4', useCaching: true })),
}));
const { activeSkyManifest } = require('../../src/home/videoSkyGate');
const VIDEO_SKY = { id: 'harvest', poster: 'https://skies.dailyrituals.app/harvest-poster.jpg', accent: '#5AA9E6' };

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

describe('the streak hero\'s ground (IMP-121/122)', () => {
  afterEach(() => activeSkyManifest.mockReset());

  test('falls back to RayFan when no video sky is active', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} />);
    expect(view.UNSAFE_getAllByType(RayFan)).toHaveLength(1);
  });

  test('the numeral keeps its shadow in day mode under a video sky', () => {
    activeSkyManifest.mockReturnValue(VIDEO_SKY);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const flat = StyleSheet.flatten(view.getByText('day streak').props.style);
    expect(flat.textShadowColor).toBe('rgba(0,0,0,0.7)');
  });

  test('day mode without a video sky carries no such shadow', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const flat = StyleSheet.flatten(view.getByText('day streak').props.style);
    expect(flat.textShadowColor).toBeUndefined();
  });

  // IMP-124 — the prior case above asserted textShadowColor and never asserted
  // `color`, which is precisely the hole the day-mode-over-video defect came
  // through: the shadow was fixed (IMP-121) but the ink stayed on the day theme.
  test('day mode under a video sky: the streak line is white, not day ink (red before IMP-124)', () => {
    activeSkyManifest.mockReturnValue(VIDEO_SKY);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const flat = StyleSheet.flatten(view.getByText('day streak').props.style);
    expect(flat.color).toBe('#ffffff');
  });

  test('day mode under a video sky: the subtitle is the white ramp, not day dimText (red before IMP-124)', () => {
    activeSkyManifest.mockReturnValue(VIDEO_SKY);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const flat = StyleSheet.flatten(view.getByText(streakSubtitle(5)).props.style);
    expect(flat.color).toBe('rgba(255,255,255,0.86)');
  });

  test('day mode without a video sky: the streak line and subtitle stay on theme ink (no-regression control)', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const line = StyleSheet.flatten(view.getByText('day streak').props.style);
    const sub = StyleSheet.flatten(view.getByText(streakSubtitle(5)).props.style);
    expect(line.color).toBe(theme.colors.ink);
    expect(sub.color).toBe(theme.colors.dimText);
  });

  test('day mode under a video sky: ProgressBar receives onVideo', () => {
    activeSkyManifest.mockReturnValue(VIDEO_SKY);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    expect(view.UNSAFE_getByType(ProgressBar).props.onVideo).toBe(true);
  });
});
