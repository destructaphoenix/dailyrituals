import { lastBackupLabel } from '../../src/backup/lastBackupLabel';

const now = new Date('2026-06-14T12:00:00.000Z');

describe('lastBackupLabel', () => {
  test('null → never backed up', () => {
    expect(lastBackupLabel(null, now)).toBe('Not backed up yet');
  });
  test('same day → today', () => {
    expect(lastBackupLabel('2026-06-14T01:00:00.000Z', now)).toBe('Backed up today');
  });
  test('one day → yesterday', () => {
    expect(lastBackupLabel('2026-06-13T01:00:00.000Z', now)).toBe('Backed up yesterday');
  });
  test('several days → N days ago', () => {
    expect(lastBackupLabel('2026-06-01T12:00:00.000Z', now)).toBe('Backed up 13 days ago');
  });
  test('over 30 days → gentle nudge appended', () => {
    expect(lastBackupLabel('2026-05-01T12:00:00.000Z', now)).toBe('Backed up 44 days ago — back up again soon');
  });
});
