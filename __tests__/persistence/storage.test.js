import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveState, loadState, clearState, readRawState,
  writePendingRestore, readPendingRestore, clearPendingRestore,
} from '../../src/persistence/storage';

beforeEach(() => AsyncStorage.clear());

describe('pending-restore stash', () => {
  test('round trip: write → read → clear', async () => {
    await writePendingRestore('{"entries":[]}');
    expect(await readPendingRestore()).toBe('{"entries":[]}');
    await clearPendingRestore();
    expect(await readPendingRestore()).toBeNull();
  });

  test('does not touch the live state key', async () => {
    await saveState({ entries: [{ dayKey: '2026-01-01' }] });
    await writePendingRestore('{"entries":["stashed"]}');
    const live = await loadState();
    expect(live.entries).toEqual([{ dayKey: '2026-01-01' }]);
    await clearPendingRestore();
    expect(live.entries).toEqual([{ dayKey: '2026-01-01' }]); // clearing the stash leaves it live and well
  });
});

describe('readRawState', () => {
  test('returns the exact raw string, not the deserialized slice', async () => {
    await saveState({ entries: [{ dayKey: '2026-01-01' }] });
    const raw = await readRawState();
    expect(typeof raw).toBe('string');
    expect(JSON.parse(raw).entries).toEqual([{ dayKey: '2026-01-01' }]);
  });
  test('no live state ⇒ null', async () => {
    expect(await readRawState()).toBeNull();
  });
});

describe('clearState', () => {
  test('clearing the live key leaves the stash untouched', async () => {
    await saveState({ entries: [] });
    await writePendingRestore('{"entries":["stashed"]}');
    await clearState();
    expect(await loadState()).toBeNull();
    expect(await readPendingRestore()).toBe('{"entries":["stashed"]}');
  });
});
