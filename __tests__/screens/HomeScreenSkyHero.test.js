// __tests__/screens/HomeScreenSkyHero.test.js — IMP-121/122. The streak hero
// swaps its ground between the frozen RayFan/NightRays art and a full-bleed
// video sky depending on the (mockable) videoSkyGate manifest lookup, and the
// numeral's contrast chrome must apply over footage even in day mode.
import React from 'react';
import { render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { RayFan, NightRays } from '../../src/art';
import { ProgressBar } from '../../src/ui';
import { streakSubtitle } from '../../src/home/streakCopy';
import { ThemeContext, makeTheme, DEFAULT_SETTINGS } from '../../src/theme';

jest.mock('../../src/home/videoSkyGate', () => ({
  activeSkyManifest: jest.fn(),
  skyVideoSource: jest.fn(() => ({ uri: 'mock.mp4', useCaching: true })),
}));
const { activeSkyManifest } = require('../../src/home/videoSkyGate');
const VIDEO_SKY = { id: 'harvest', poster: 'https://skies.dailyrituals.app/harvest-poster.jpg', accent: '#5AA9E6' };

const { Dimensions } = require('react-native');
const WINDOW_WIDTH = Dimensions.get('window').width;

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

describe('the streak hero card is one size, whichever sky is on (IMP-130)', () => {
  afterEach(() => activeSkyManifest.mockReset());

  test('with a video sky active, the hero card is 336', () => {
    activeSkyManifest.mockReturnValue(VIDEO_SKY);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const flat = StyleSheet.flatten(view.getByTestId('streak-hero').props.style);
    expect(flat.height).toBe(336);
  });

  test('with no video sky, the hero card is 336 too (red before IMP-130)', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const flat = StyleSheet.flatten(view.getByTestId('streak-hero').props.style);
    expect(flat.height).toBe(336);
  });

  test('the two grounds measure the same height', () => {
    activeSkyManifest.mockReturnValue(VIDEO_SKY);
    const video = wrap(<HomeScreen {...baseProps} mode="day" />);
    const videoHeight = StyleSheet.flatten(video.getByTestId('streak-hero').props.style).height;

    activeSkyManifest.mockReturnValue(null);
    const classic = wrap(<HomeScreen {...baseProps} mode="day" />);
    const classicHeight = StyleSheet.flatten(classic.getByTestId('streak-hero').props.style).height;

    expect(classicHeight).toBe(videoHeight);
  });
});

describe('the sunburst converges on the numeral again (IMP-131)', () => {
  afterEach(() => activeSkyManifest.mockReset());

  // The art's focal point is a prop as of IMP-132, so render it with the focal
  // the SCREEN passes and measure where the disc actually lands. Rendering the
  // bare <Art /> would measure art.js's default, not the shipped hero.
  const focalOf = (view, Art) => {
    const { focal, reach } = view.UNSAFE_getByType(Art).props;
    const { top, height } = StyleSheet.flatten(wrap(<Art focal={focal} reach={reach} />).toJSON().props.style);
    return top + height / 2; // read off the render, not typed
  };

  test('the classic hero\'s numeral sits on the ray fan\'s focal point', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const box = StyleSheet.flatten(view.getByTestId('hero-box').props.style);
    const block = StyleSheet.flatten(view.getByTestId('hero-numeral-block').props.style);
    const num = StyleSheet.flatten(view.getByText('5').props.style);
    expect(box.justifyContent).not.toBe('center');
    expect(box.paddingTop + block.marginTop + num.lineHeight / 2).toBe(focalOf(view, RayFan));
  });

  test('night is the same construction', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} mode="night" />);
    const box = StyleSheet.flatten(view.getByTestId('hero-box').props.style);
    const block = StyleSheet.flatten(view.getByTestId('hero-numeral-block').props.style);
    const num = StyleSheet.flatten(view.getByText('5').props.style);
    expect(box.justifyContent).not.toBe('center');
    expect(box.paddingTop + block.marginTop + num.lineHeight / 2).toBe(focalOf(view, NightRays));
  });

  test('the video shell shares the box', () => {
    // The video shell renders SkyHero instead of the art, so the focal comes
    // from the classic shell — which is the point: one box, two grounds.
    activeSkyManifest.mockReturnValue(null);
    const classic = wrap(<HomeScreen {...baseProps} mode="day" />);
    const focal = focalOf(classic, RayFan);

    activeSkyManifest.mockReturnValue(VIDEO_SKY);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const box = StyleSheet.flatten(view.getByTestId('hero-box').props.style);
    const block = StyleSheet.flatten(view.getByTestId('hero-numeral-block').props.style);
    const num = StyleSheet.flatten(view.getByText('5').props.style);
    expect(box.justifyContent).not.toBe('center');
    expect(box.paddingTop + block.marginTop + num.lineHeight / 2).toBe(focal);
  });

  test('the spacer can collapse', () => {
    activeSkyManifest.mockReturnValue(null);
    const classic = wrap(<HomeScreen {...baseProps} mode="day" />);
    expect(StyleSheet.flatten(classic.getByTestId('hero-spacer').props.style)).toEqual({ flex: 1 });

    activeSkyManifest.mockReturnValue(VIDEO_SKY);
    const video = wrap(<HomeScreen {...baseProps} mode="day" />);
    expect(StyleSheet.flatten(video.getByTestId('hero-spacer').props.style)).toEqual({ flex: 1 });
  });
});

// IMP-132 — IMP-131 proved the numeral sits ON the focal point and stopped
// there. It never asked whether the focal was still in the right place: 80 is
// the middle of the ~232dp content-sized card the hero was before IMP-130, and
// in a 336dp card it hangs the 300dp disc 70dp off the top and leaves 106dp of
// bare card under it. These read every number off the render -- no 80, no 168,
// no 336 typed on either side of an assertion.
describe('the sunburst is centred in the card it actually lives in (IMP-132)', () => {
  afterEach(() => activeSkyManifest.mockReset());

  const cardHeight = (view) => StyleSheet.flatten(view.getByTestId('streak-hero').props.style).height;

  // The focal the screen actually passes, read back off the rendered art rather
  // than imported, so the test fails if HomeScreen stops passing one.
  const renderedFocal = (view, Art) => {
    const art = view.UNSAFE_getByType(Art);
    return art.props.focal;
  };

  test('the classic day hero centres the focal in the card (red before IMP-132: 80 vs 168)', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    expect(renderedFocal(view, RayFan)).toBe(cardHeight(view) / 2);
  });

  test('night passes the same focal', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} mode="night" />);
    expect(renderedFocal(view, NightRays)).toBe(cardHeight(view) / 2);
  });

  // IMP-133 corrects this case. It used to assert the disc sat WHOLLY INSIDE the
  // card, which is the rule that produced the bare rim: a 300dp circle centred in
  // a 350x336 card shows its own outer boundary on all four sides. The sunburst
  // must never show where it ends. The invariant is the opposite one — centred on
  // the focal, and long enough that its tips are outside the card at any rotation.
  test('the disc stays centred on the focal and its boundary is never visible in the card', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const h = cardHeight(view);
    const focal = renderedFocal(view, RayFan);
    const reach = view.UNSAFE_getByType(RayFan).props.reach;
    const { top, height } = StyleSheet.flatten(
      wrap(<RayFan focal={focal} reach={reach} />).toJSON().props.style
    );

    // Still centred on the focal: the box is symmetric about it.
    expect(height).toBe(reach * 2);
    expect(focal - top).toBe(top + height - focal);

    // And long enough to clear the card's farthest point — the corner.
    const cardWidth = WINDOW_WIDTH - 40; // the hero wrapper's paddingHorizontal: 20
    const corner = Math.hypot(cardWidth / 2, h / 2);
    expect(reach).toBeGreaterThan(corner);
  });

  // Centring the numeral spends the slack the old layout had below it. The
  // stack must still fit inside the fixed card, or IMP-130's height squeezes
  // the content instead of the content deciding the height.
  test('the hero content stack still fits inside the fixed card height', () => {
    activeSkyManifest.mockReturnValue(null);
    const view = wrap(<HomeScreen {...baseProps} mode="day" />);
    const box = StyleSheet.flatten(view.getByTestId('hero-box').props.style);
    const block = StyleSheet.flatten(view.getByTestId('hero-numeral-block').props.style);
    const num = StyleSheet.flatten(view.getByText('5').props.style);
    const label = StyleSheet.flatten(view.getByText('day streak').props.style);
    const sub = StyleSheet.flatten(view.getByText(streakSubtitle(5)).props.style);
    const meta = StyleSheet.flatten(view.getByText(/^Lv /).props.style);
    const bar = StyleSheet.flatten(wrap(<ProgressBar value={0} />).toJSON().props.style);

    // Every line height is explicit, so this sum is the real stack, not an estimate.
    [num.lineHeight, label.lineHeight, sub.lineHeight, meta.lineHeight].forEach((lh) =>
      expect(typeof lh).toBe('number')
    );

    const used =
      box.paddingTop + block.marginTop +
      num.lineHeight + label.marginTop + label.lineHeight + sub.marginTop + sub.lineHeight +
      meta.lineHeight + 7 /* meta row marginBottom */ + bar.height +
      box.paddingBottom;

    expect(used).toBeLessThanOrEqual(cardHeight(view));
    expect(cardHeight(view) - used).toBeGreaterThanOrEqual(12); // real slack for the spacer
  });
});
