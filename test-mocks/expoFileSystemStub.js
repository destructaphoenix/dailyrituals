// expoFileSystemStub.js — one stub for the expo-file-system surface used by
// src/backup/io.js, shared by both module paths jest.setup.js mocks.
//
// It lives in its own file because `jest.mock()` factories must be inline
// function literals (babel-plugin-jest-hoist), so the two mocks cannot share a
// named factory variable — but they CAN each `require` this. One definition, no
// drift between the legacy and current paths.
module.exports = {
  cacheDirectory: 'file:///cache/',
  documentDirectory: 'file:///docs/',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: jest.fn(async () => {}),
  readAsStringAsync: jest.fn(async () => '{}'),
};
