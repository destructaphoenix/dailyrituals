import { greetingFor, todayLabel } from '../../src/time/clock';

describe('greetingFor', () => {
  it('returns Good morning before noon', () => {
    expect(greetingFor(new Date(2026, 0, 1, 9, 0))).toBe('Good morning');
  });
  it('returns Good morning at 11:59', () => {
    expect(greetingFor(new Date(2026, 0, 1, 11, 59))).toBe('Good morning');
  });
  it('returns Good evening at noon exactly', () => {
    expect(greetingFor(new Date(2026, 0, 1, 12, 0))).toBe('Good evening');
  });
  it('returns Good evening at 23:00', () => {
    expect(greetingFor(new Date(2026, 0, 1, 23, 0))).toBe('Good evening');
  });
  it('returns Good morning at midnight', () => {
    expect(greetingFor(new Date(2026, 0, 1, 0, 0))).toBe('Good morning');
  });
});

describe('todayLabel', () => {
  it('formats a Thursday correctly', () => {
    expect(todayLabel(new Date(2026, 0, 1))).toBe('Thursday, 1 January');
  });
  it('formats a Sunday correctly', () => {
    expect(todayLabel(new Date(2026, 4, 31))).toBe('Sunday, 31 May');
  });
});
