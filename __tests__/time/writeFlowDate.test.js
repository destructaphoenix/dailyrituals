import * as data from '../../src/data';
import { todayLabel } from '../../src/time/clock';

// Bug 2: the reflection (write) flow showed a hardcoded "Saturday, 31 May".
// WriteFlow now renders todayLabel() instead; the dead constant is deleted.
describe('reflection flow date is the real device date (kill 31 May)', () => {
  test('the hardcoded TODAY_LABEL constant no longer exists', () => {
    expect(data.TODAY_LABEL).toBeUndefined();
  });

  test('the date source WriteFlow uses tracks the real date, never "31 May"', () => {
    // For any given day, the epitaph reflects THAT day — not the old constant.
    expect(todayLabel(new Date(2026, 5, 8))).toBe('Monday, 8 June');
    expect(todayLabel(new Date(2026, 4, 31))).not.toBe('Saturday, 31 May');
  });
});
