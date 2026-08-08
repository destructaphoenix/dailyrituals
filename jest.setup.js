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

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true })),
}));
