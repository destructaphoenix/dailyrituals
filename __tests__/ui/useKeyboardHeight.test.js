import { renderHook, act } from '@testing-library/react-native';
import { Keyboard, Platform } from 'react-native';
import { useKeyboardHeight } from '../../src/ui/useKeyboardHeight';

describe('useKeyboardHeight', () => {
  let listeners;
  let removeMocks;

  beforeEach(() => {
    listeners = {};
    removeMocks = [];
    jest.spyOn(Keyboard, 'addListener').mockImplementation((event, cb) => {
      listeners[event] = cb;
      const remove = jest.fn();
      removeMocks.push(remove);
      return { remove };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Platform.OS = 'ios';
  });

  test('starts at 0', () => {
    Platform.OS = 'android';
    const { result } = renderHook(() => useKeyboardHeight());
    expect(result.current).toBe(0);
  });

  test('reports the shown height on Android (keyboardDidShow)', () => {
    Platform.OS = 'android';
    const { result } = renderHook(() => useKeyboardHeight());
    act(() => { listeners.keyboardDidShow({ endCoordinates: { height: 312 } }); });
    expect(result.current).toBe(312);
  });

  test('resets to 0 after keyboardDidHide on Android', () => {
    Platform.OS = 'android';
    const { result } = renderHook(() => useKeyboardHeight());
    act(() => { listeners.keyboardDidShow({ endCoordinates: { height: 312 } }); });
    act(() => { listeners.keyboardDidHide(); });
    expect(result.current).toBe(0);
  });

  test('subscribes to the did* events on Android, not will*', () => {
    Platform.OS = 'android';
    renderHook(() => useKeyboardHeight());
    expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardDidShow', expect.any(Function));
    expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardDidHide', expect.any(Function));
    expect(Keyboard.addListener).not.toHaveBeenCalledWith('keyboardWillShow', expect.any(Function));
    expect(Keyboard.addListener).not.toHaveBeenCalledWith('keyboardWillHide', expect.any(Function));
  });

  test('subscribes to the will* events on iOS', () => {
    Platform.OS = 'ios';
    renderHook(() => useKeyboardHeight());
    expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardWillShow', expect.any(Function));
    expect(Keyboard.addListener).toHaveBeenCalledWith('keyboardWillHide', expect.any(Function));
  });

  test('removes both subscriptions on unmount', () => {
    Platform.OS = 'android';
    const { unmount } = renderHook(() => useKeyboardHeight());
    expect(removeMocks.length).toBe(2);
    unmount();
    removeMocks.forEach((fn) => expect(fn).toHaveBeenCalled());
  });
});
