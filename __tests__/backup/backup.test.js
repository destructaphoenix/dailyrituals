import { createBackup, readBackup, backupFilename, BACKUP_FORMAT } from '../../src/backup/backup';
import { SCHEMA_VERSION } from '../../src/persistence/state';

const state = {
  entries: [
    { id: 'a', dayKey: '2026-06-10', did: 'x' },
    { id: 'b', dayKey: '2026-06-10', did: 'y' }, // same day → counts as 1 day, 2 entries
    { id: 'c', dayKey: '2026-06-11', did: 'z' },
  ],
  streak: 3, xp: 150, settings: { name: 'Maya' }, junk: 'dropped',
};

describe('createBackup', () => {
  const env = createBackup(state, { appVersion: '1.0.0', now: new Date('2026-06-14T08:00:00.000Z') });

  test('tags format, version-stamped payload, and metadata', () => {
    expect(env.format).toBe(BACKUP_FORMAT);
    expect(env.appVersion).toBe('1.0.0');
    expect(env.exportedAt).toBe('2026-06-14T08:00:00.000Z');
    expect(JSON.parse(env.payload).version).toBe(SCHEMA_VERSION);
  });

  test('counts entries and unique days', () => {
    expect(env.counts).toEqual({ entries: 3, days: 2 });
  });

  test('payload only contains persisted keys (junk dropped)', () => {
    expect(JSON.parse(env.payload).junk).toBeUndefined();
  });
});

describe('readBackup', () => {
  const good = JSON.stringify(createBackup(state, { appVersion: '1.0.0' }));

  test('round-trips a good backup back to state', () => {
    const res = readBackup(good);
    expect(res.ok).toBe(true);
    expect(res.state.xp).toBe(150); // streak is derived from entries now, not persisted
    expect(res.state.settings).toEqual({ name: 'Maya' });
    expect(res.meta.counts).toEqual({ entries: 3, days: 2 });
  });

  test('rejects non-JSON', () => {
    expect(readBackup('not json')).toEqual({ ok: false, reason: 'not-json' });
  });

  test('rejects a JSON file that is not our backup format', () => {
    expect(readBackup(JSON.stringify({ hello: 'world' }))).toEqual({ ok: false, reason: 'not-backup' });
  });

  test('rejects a backup made by a newer app (future schema)', () => {
    const future = JSON.stringify({
      format: BACKUP_FORMAT, appVersion: '9.9', exportedAt: 'x',
      counts: { entries: 0, days: 0 }, payload: JSON.stringify({ version: SCHEMA_VERSION + 99, streak: 1 }),
    });
    expect(readBackup(future)).toEqual({ ok: false, reason: 'too-new' });
  });

  test('rejects a corrupt payload', () => {
    const bad = JSON.stringify({
      format: BACKUP_FORMAT, appVersion: '1', exportedAt: 'x',
      counts: { entries: 0, days: 0 }, payload: 'not json either',
    });
    expect(readBackup(bad)).toEqual({ ok: false, reason: 'unreadable' });
  });
});

describe('backupFilename', () => {
  test('is dated YYYY-MM-DD', () => {
    expect(backupFilename(new Date('2026-06-14T08:00:00.000Z'))).toBe('daily-rituals-2026-06-14.json');
  });
});
