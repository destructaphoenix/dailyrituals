// __tests__/home/skyHero.test.js — IMP-121. SkyHero holds the poster over a
// cold/loading frame and drops it once the player reports readyToPlay; jest
// never plays a real frame (expo-video is stubbed), so this proves the poster
// swap logic only, not playback itself.
import React from 'react';
import { render } from '@testing-library/react-native';
import { Image } from 'react-native';
import { useVideoPlayer } from 'expo-video';
import SkyHero from '../../src/home/skyHero';

const SOURCE = { uri: 'fixture.mp4' };
const POSTER = { uri: 'fixture-poster.png' };

describe('SkyHero — the poster covers a cold frame (IMP-121)', () => {
  test('shows the poster while the player is not readyToPlay', () => {
    useVideoPlayer.mockReturnValue({
      status: 'loading',
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      play: jest.fn(),
    });
    const view = render(
      <SkyHero source={SOURCE} poster={POSTER} accent="#5AA9E6">
        <></>
      </SkyHero>
    );
    expect(view.UNSAFE_getAllByType(Image)).toHaveLength(1);
  });

  test('drops the poster once the player is readyToPlay', () => {
    useVideoPlayer.mockReturnValue({
      status: 'readyToPlay',
      addListener: jest.fn(() => ({ remove: jest.fn() })),
      play: jest.fn(),
    });
    const view = render(
      <SkyHero source={SOURCE} poster={POSTER} accent="#5AA9E6">
        <></>
      </SkyHero>
    );
    expect(view.UNSAFE_queryAllByType(Image)).toHaveLength(0);
  });
});
