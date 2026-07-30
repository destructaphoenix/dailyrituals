import { nextOccurrences, formatReminderTime, reminderRowValue } from '../../src/reminders/schedule';

describe('nextOccurrences', () => {
  it('starts today when the target time has not passed yet', () => {
    const now = new Date(2026, 6, 31, 10, 0, 0);
    const occ = nextOccurrences(now, { hour: 20, minute: 30 }, { count: 3 });
    expect(occ[0].toDateString()).toBe(new Date(2026, 6, 31).toDateString());
    expect(occ[0].getHours()).toBe(20);
    expect(occ[0].getMinutes()).toBe(30);
    expect(occ[1].toDateString()).toBe(new Date(2026, 7, 1).toDateString());
    expect(occ[2].toDateString()).toBe(new Date(2026, 7, 2).toDateString());
  });

  it('rolls to tomorrow when the target time has already passed today', () => {
    const now = new Date(2026, 6, 31, 21, 0, 0);
    const occ = nextOccurrences(now, { hour: 20, minute: 30 }, { count: 1 });
    expect(occ[0].toDateString()).toBe(new Date(2026, 7, 1).toDateString());
  });

  it('treats the exact-now instant as already passed', () => {
    const now = new Date(2026, 6, 31, 20, 30, 0, 0);
    const occ = nextOccurrences(now, { hour: 20, minute: 30 }, { count: 1 });
    expect(occ[0].toDateString()).toBe(new Date(2026, 7, 1).toDateString());
  });

  it('skips today when the user already wrote today, even if the time has not passed', () => {
    const now = new Date(2026, 6, 31, 10, 0, 0);
    const occ = nextOccurrences(now, { hour: 20, minute: 30 }, { wroteToday: true, count: 1 });
    expect(occ[0].toDateString()).toBe(new Date(2026, 7, 1).toDateString());
  });

  it('rolls correctly across a month/year boundary', () => {
    const now = new Date(2025, 11, 31, 10, 0, 0);
    const occ = nextOccurrences(now, { hour: 20, minute: 30 }, { count: 3 });
    expect(occ[0].toDateString()).toBe(new Date(2025, 11, 31).toDateString());
    expect(occ[1].toDateString()).toBe(new Date(2026, 0, 1).toDateString());
    expect(occ[2].toDateString()).toBe(new Date(2026, 0, 2).toDateString());
  });

  it('preserves the wall-clock hour/minute on every occurrence', () => {
    const now = new Date(2026, 6, 31, 10, 0, 0);
    const occ = nextOccurrences(now, { hour: 6, minute: 15 }, { count: 5 });
    for (const d of occ) {
      expect(d.getHours()).toBe(6);
      expect(d.getMinutes()).toBe(15);
    }
  });

  it('defaults to a 7-day rolling window', () => {
    const now = new Date(2026, 6, 31, 10, 0, 0);
    const occ = nextOccurrences(now, { hour: 20, minute: 30 });
    expect(occ).toHaveLength(7);
  });
});

describe('formatReminderTime', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatReminderTime({ hour: 0, minute: 0 })).toBe('12:00 AM');
  });
  it('formats noon as 12:00 PM', () => {
    expect(formatReminderTime({ hour: 12, minute: 0 })).toBe('12:00 PM');
  });
  it('formats 12:30 PM correctly (not 0:30 PM)', () => {
    expect(formatReminderTime({ hour: 12, minute: 30 })).toBe('12:30 PM');
  });
  it('zero-pads single-digit minutes', () => {
    expect(formatReminderTime({ hour: 20, minute: 5 })).toBe('8:05 PM');
  });
  it('formats a morning hour without a leading zero', () => {
    expect(formatReminderTime({ hour: 6, minute: 15 })).toBe('6:15 AM');
  });
});

describe('reminderRowValue', () => {
  it('reads Off when disabled', () => {
    expect(reminderRowValue({ enabled: false, hour: 20, minute: 30 }, 'granted')).toBe('Off');
  });
  it('reads Off when there is no reminder settings object at all', () => {
    expect(reminderRowValue(undefined, 'undetermined')).toBe('Off');
  });
  it('reads the formatted time when enabled and permission is granted', () => {
    expect(reminderRowValue({ enabled: true, hour: 20, minute: 30 }, 'granted')).toBe('8:30 PM');
  });
  it('reads Blocked in settings when enabled but permission is denied', () => {
    expect(reminderRowValue({ enabled: true, hour: 20, minute: 30 }, 'denied')).toBe('Blocked in settings');
  });
});
