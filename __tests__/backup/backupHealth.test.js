import { backupHealth } from '../../src/backup/backupHealth';

const now = new Date('2026-08-08T12:00:00.000Z');

describe('backupHealth', () => {
  test('never backed up → never', () => {
    expect(backupHealth(null, now)).toBe('never');
  });
  test('backed up today → ok', () => {
    expect(backupHealth('2026-08-08T01:00:00.000Z', now)).toBe('ok');
  });
  test('exactly 30 days ago → ok (boundary is inclusive)', () => {
    expect(backupHealth('2026-07-09T12:00:00.000Z', now)).toBe('ok');
  });
  test('31 days ago → stale', () => {
    expect(backupHealth('2026-07-08T12:00:00.000Z', now)).toBe('stale');
  });
  test('many days ago → stale', () => {
    expect(backupHealth('2026-01-01T12:00:00.000Z', now)).toBe('stale');
  });
});
