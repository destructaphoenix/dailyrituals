import { AppState } from 'react-native';
import { renderHook, act } from '@testing-library/react-native';
import { useMoodTick } from '../../src/ui/useMoodTick';

beforeEach(() => {
  jest.useFakeTimers();
  AppState.currentState = 'active';
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe('useMoodTick', () => {
  test('ticks while enabled', () => {
    const { result } = renderHook(() => useMoodTick({ enabled: true, seed: 0 }));
    const start = result.current;
    act(() => { jest.advanceTimersByTime(2500); });
    expect(result.current).toBe(start + 1);
  });

  test('does not tick when enabled is false', () => {
    const { result } = renderHook(() => useMoodTick({ enabled: false, seed: 3 }));
    act(() => { jest.advanceTimersByTime(10000); });
    expect(result.current).toBe(3);
  });

  test('returns seed when disabled', () => {
    const { result } = renderHook(() => useMoodTick({ enabled: false, seed: 7 }));
    expect(result.current).toBe(7);
  });

  test('clears its interval on unmount', () => {
    const { unmount } = renderHook(() => useMoodTick({ enabled: true, seed: 0 }));
    const before = jest.getTimerCount();
    expect(before).toBeGreaterThan(0);
    unmount();
    expect(jest.getTimerCount()).toBeLessThan(before);
  });
});
