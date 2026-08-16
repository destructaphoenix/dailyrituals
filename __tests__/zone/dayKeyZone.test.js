// The ONE place the local-vs-UTC divergence is actually proven, and the only
// place in the suite that needs a specific timezone.
//
// Why it lives alone, in its own directory, run by its own npm script:
//
// Jest cannot change the timezone from inside a test. Each test file gets a
// COPY of process.env, so `process.env.TZ = 'Somewhere'` never reaches Node's
// clock — it is inert, and always was. Four tests across the suite relied on
// exactly that assignment and so only passed on a machine already sitting at a
// positive offset; they failed the moment CI ran them on a UTC runner. The zone
// therefore has to be set BEFORE the process starts, which is what
// `npm run test:zone` does — running this file once at UTC+14 and once at
// UTC-11, so both signs are covered.
//
// Everything else in __tests__/ is excluded from that pinning and runs at
// whatever zone the machine happens to be in (see jest.testPathIgnorePatterns).
// That is deliberate: it keeps CI genuinely exercising UTC for the other ~860
// tests instead of reproducing the author's laptop.
//
// If you are adding a test that needs a particular zone, it belongs here. If it
// does not need one, build your dates with the LOCAL constructor
// (`new Date(y, m, d, h)`), never from a UTC instant or a date-only string —
// both of those mean a different calendar day in a different zone, which is how
// the annualRecap 30 Nov / 1 Dec boundary silently flipped at UTC+14.

import { dayKeyOf } from '../../src/time/dayKey';

// Read the offset off a fixed winter date so DST cannot make this ambiguous.
//
// Normalising -0 is not pedantry: at UTC, getTimezoneOffset() returns 0, so
// negating it gives -0, and Jest's toBe uses Object.is — where
// Object.is(-0, 0) is FALSE. A bare `expect(offset).not.toBe(0)` therefore
// PASSES at UTC, which is precisely the case the guard below exists to catch.
const rawOffset = -new Date(2026, 0, 15, 12).getTimezoneOffset();
const offsetMinutes = rawOffset === 0 ? 0 : rawOffset;

describe(`dayKeyOf under a pinned zone (offset ${offsetMinutes} min)`, () => {
  // Without this guard the file would pass vacuously if it were ever run
  // unpinned at UTC — where local and UTC cannot differ, so "they differ"
  // becomes untestable rather than false.
  it('refuses to pass vacuously — the process must really be off UTC', () => {
    expect(offsetMinutes).not.toBe(0);
  });

  it('reads the LOCAL calendar day, which differs from the UTC day at the edges', () => {
    // Pick the local wall-clock time that lands on the far side of UTC
    // midnight for this offset's sign: 00:30 local in a positive-offset zone
    // is still yesterday in UTC, and 23:30 local in a negative-offset zone is
    // already tomorrow.
    const d = offsetMinutes > 0
      ? new Date(2026, 0, 15, 0, 30)
      : new Date(2026, 0, 15, 23, 30);

    expect(dayKeyOf(d)).toBe('2026-01-15');                       // the user's calendar
    expect(d.toISOString().slice(0, 10)).not.toBe('2026-01-15');  // UTC disagrees
  });

  it('still round-trips a plain midday date, where no zone can disagree', () => {
    expect(dayKeyOf(new Date(2026, 0, 15, 12, 0))).toBe('2026-01-15');
  });
});
