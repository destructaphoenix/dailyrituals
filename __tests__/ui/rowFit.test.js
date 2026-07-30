import { shouldStackRow } from '../../src/ui/rowFit';

describe('shouldStackRow', () => {
  test('short value at normal scale stays inline (the screenshot that works)', () => {
    expect(shouldStackRow({ label: 'Back up my journal', value: 'Backed up today', availableDp: 245, fontScale: 1.0 })).toBe(false);
  });

  test('long stale-backup value stacks (the screenshot that broke)', () => {
    expect(shouldStackRow({ label: 'Back up my journal', value: 'Backed up 42 days ago — back up again soon', availableDp: 245, fontScale: 1.0 })).toBe(true);
  });

  test('short appearance value stays inline', () => {
    expect(shouldStackRow({ label: 'Appearance', value: 'Night', availableDp: 245, fontScale: 1.0 })).toBe(false);
  });

  test('a 40-char name stacks', () => {
    expect(shouldStackRow({ label: 'Your name', value: 'A'.repeat(40), availableDp: 245, fontScale: 1.0 })).toBe(true);
  });

  test('daily reminder time stays inline at normal scale', () => {
    expect(shouldStackRow({ label: 'Daily reminder', value: '8:30 PM', availableDp: 245, fontScale: 1.0 })).toBe(false);
  });

  test('same strings stack once font scale alone pushes past the threshold', () => {
    expect(shouldStackRow({ label: 'Daily reminder', value: '8:30 PM', availableDp: 245, fontScale: 2.0 })).toBe(true);
  });

  test('no value never stacks', () => {
    expect(shouldStackRow({ label: 'Restore from a backup', value: '', availableDp: 245, fontScale: 1.0 })).toBe(false);
    expect(shouldStackRow({ label: 'Restore from a backup', value: null, availableDp: 245, fontScale: 1.0 })).toBe(false);
  });
});
