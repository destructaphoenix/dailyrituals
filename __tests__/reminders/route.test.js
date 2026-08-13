import { isOurReminder, reminderAction } from '../../src/reminders/route';

describe('isOurReminder', () => {
  it('is true for a notification stamped with our kind', () => {
    const n = { request: { content: { data: { kind: 'daily-reminder' } } } };
    expect(isOurReminder(n)).toBe(true);
  });

  it('is false for a foreign notification', () => {
    const n = { request: { content: { data: { kind: 'something-else' } } } };
    expect(isOurReminder(n)).toBe(false);
  });

  it('is false for null', () => {
    expect(isOurReminder(null)).toBe(false);
  });

  it('is false for an empty object', () => {
    expect(isOurReminder({})).toBe(false);
  });

  it('is false when content is missing', () => {
    expect(isOurReminder({ request: {} })).toBe(false);
  });
});

describe('reminderAction', () => {
  it('nudges when foreground and not written', () => {
    expect(reminderAction({ wroteToday: false, foreground: true })).toBe('nudge');
  });

  it('does nothing when foreground and already written', () => {
    expect(reminderAction({ wroteToday: true, foreground: true })).toBe('none');
  });

  it('opens write when a background tap arrives and the day is unwritten', () => {
    expect(reminderAction({ wroteToday: false, foreground: false })).toBe('write');
  });

  it('does nothing on a background tap when the day is already written', () => {
    expect(reminderAction({ wroteToday: true, foreground: false })).toBe('none');
  });
});
