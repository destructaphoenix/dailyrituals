// jest.setup.js — silence RN animation native warnings, and stub the expo native
// modules used by src/backup/io.js so any module that imports it doesn't break
// the jsdom test environment.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });

// The package's own in-memory mock — needed now that src/persistence/storage.js
// gets a real round-trip test (IMP-033's pending-restore stash).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// SDK 54 moved the string-based file API to `expo-file-system/legacy`, which is
// the path src/backup/io.js imports. Jest keys mocks on the literal module path,
// so mocking only 'expo-file-system' would leave io.js unstubbed. Both paths get
// the same stub: the legacy path is the one in use, the bare path covers anything
// reaching for the current File/Directory API.
jest.mock('expo-file-system/legacy', () => require('./test-mocks/expoFileSystemStub'));
jest.mock('expo-file-system', () => require('./test-mocks/expoFileSystemStub'));

// expo-video is a native module (IMP-121's SkyHero) — jest never plays a
// frame, so useVideoPlayer/VideoView are stubbed to plain React elements.
jest.mock('expo-video', () => require('./test-mocks/expoVideoStub'));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true })),
}));

// ⚠️ This mock no-ops EVERY Reanimated hook and worklet: useSharedValue returns a
// plain object, useAnimatedStyle returns {}, withTiming/withSpring resolve to their
// target instantly, and nothing is ever scheduled on the UI thread. So a green suite
// proves the screens still RENDER with motion.js wired in, and proves nothing
// whatsoever about the native side — not that Reanimated 4 initialized, not that the
// New Architecture is live under it, not that a single frame actually moved.
// Reanimated 4 is New-Architecture-only; that is why IMP-077 was gated on WALK-16 and
// why its runtime proof is WALK-18 on a device, not this suite. Do not read a passing
// motion test as evidence the animation works.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
