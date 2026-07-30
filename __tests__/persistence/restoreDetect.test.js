import { isRestoredInstall, formatBackupDate } from '../../src/persistence/restoreDetect';

describe('isRestoredInstall', () => {
  test('install newer than the data ⇒ true (data outlived an install)', () => {
    expect(isRestoredInstall({ lastSavedAt: 1000, installedAt: 2000 })).toBe(true);
  });
  test('data newer than the install ⇒ false', () => {
    expect(isRestoredInstall({ lastSavedAt: 2000, installedAt: 1000 })).toBe(false);
  });
  test('equal timestamps ⇒ false', () => {
    expect(isRestoredInstall({ lastSavedAt: 1500, installedAt: 1500 })).toBe(false);
  });
  test('missing lastSavedAt ⇒ false', () => {
    expect(isRestoredInstall({ installedAt: 2000 })).toBe(false);
  });
  test('missing installedAt ⇒ false', () => {
    expect(isRestoredInstall({ lastSavedAt: 1000 })).toBe(false);
  });
  test('null installedAt ⇒ false (does not coerce to 0)', () => {
    expect(isRestoredInstall({ lastSavedAt: 1000, installedAt: null })).toBe(false);
  });
  test('non-numeric junk ⇒ false', () => {
    expect(isRestoredInstall({ lastSavedAt: 'nope', installedAt: 2000 })).toBe(false);
    expect(isRestoredInstall({ lastSavedAt: 1000, installedAt: 'nope' })).toBe(false);
  });
});

describe('formatBackupDate', () => {
  test('formats a timestamp as day, abbreviated month, year', () => {
    expect(formatBackupDate(new Date(2026, 5, 14).getTime())).toBe('14 Jun 2026');
  });
  test('invalid input returns an empty string rather than throwing', () => {
    expect(formatBackupDate(NaN)).toBe('');
    expect(formatBackupDate(undefined)).toBe('');
  });
});
