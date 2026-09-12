// __tests__/home/videoSkyGate.test.js — IMP-122. The manifest lookup behind
// the streak hero: ownership gates it (never `plus` directly), and a
// two-clip sky picks its source by app mode.
jest.mock('../../src/data', () => ({
  SHOP_SKIES: [
    { id: 'classic', tier: 'owned' },
    { id: 'onegemble', tier: 300, clip: 'https://skies.test/onegemble.mp4', credit: 'Pexels, 2026-09-12' },
    { id: 'twoclip', tier: 'plus', clipDay: 'https://skies.test/twoclip-day.mp4', clipNight: 'https://skies.test/twoclip-night.mp4', credit: 'Pexels, 2026-09-12' },
  ],
}));
const { activeSkyManifest, skyVideoSource } = require('../../src/home/videoSkyGate');

describe('activeSkyManifest', () => {
  test('an unowned sky never resolves a manifest (no URL)', () => {
    expect(activeSkyManifest('onegemble', [], false)).toBeNull();
  });

  test('an owned ember-priced sky resolves even without plus', () => {
    expect(activeSkyManifest('onegemble', ['onegemble'], false)).toMatchObject({ id: 'onegemble' });
  });

  test('a plus sky resolves for a member who has not individually bought it', () => {
    expect(activeSkyManifest('twoclip', [], true)).toMatchObject({ id: 'twoclip' });
  });

  test('a plus sky does not resolve for a lapsed, non-owning member', () => {
    expect(activeSkyManifest('twoclip', [], false)).toBeNull();
  });

  test('a sky with no clip never resolves, even when owned', () => {
    expect(activeSkyManifest('classic', [], false)).toBeNull();
  });
});

describe('skyVideoSource', () => {
  test('a two-clip sky returns different sources per mode', () => {
    const sky = { clipDay: 'https://skies.test/twoclip-day.mp4', clipNight: 'https://skies.test/twoclip-night.mp4' };
    expect(skyVideoSource(sky, 'day')).toEqual({ uri: sky.clipDay, useCaching: true });
    expect(skyVideoSource(sky, 'night')).toEqual({ uri: sky.clipNight, useCaching: true });
  });

  test('a one-clip sky returns the same source in both modes', () => {
    const sky = { clip: 'https://skies.test/one.mp4' };
    expect(skyVideoSource(sky, 'day')).toEqual({ uri: sky.clip, useCaching: true });
    expect(skyVideoSource(sky, 'night')).toEqual({ uri: sky.clip, useCaching: true });
  });

  test('resolves nothing without a sky', () => {
    expect(skyVideoSource(null, 'day')).toBeNull();
  });
});
