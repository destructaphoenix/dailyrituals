// jest.setup.js — silence the RN animation/native warnings the lifted screens
// trigger under jsdom; we only unit-test pure logic + the flow hook here.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });
