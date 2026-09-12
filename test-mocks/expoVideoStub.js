// expoVideoStub.js — jest stub for the expo-video surface used by
// src/home/skyHero.js. `useVideoPlayer` returns a plain object standing in for
// the real VideoPlayer (jest never plays a frame), and VideoView renders as an
// inert View so a render tree can be asserted on.
const React = require('react');
const { View } = require('react-native');

module.exports = {
  useVideoPlayer: jest.fn(() => ({
    loop: false,
    muted: false,
    status: 'readyToPlay',
    play: jest.fn(),
    pause: jest.fn(),
    addListener: jest.fn(() => ({ remove: jest.fn() })),
  })),
  VideoView: (props) => React.createElement(View, props),
  setVideoCacheSizeAsync: jest.fn(() => Promise.resolve()),
};
