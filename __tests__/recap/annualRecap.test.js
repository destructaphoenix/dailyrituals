import { recapYears, buildRecap } from '../../src/recap/annualRecap';

const e = (dayKey, extra = {}) => ({ dayKey, did: 'a day', wished: 'more', moods: [], ...extra });

// recapYears/buildRecap read the LOCAL calendar off `now` (now.getFullYear(),
// now.getMonth()), so a fixture built from a UTC instant is a different
// calendar day in a different zone. `new Date('2027-11-30T12:00:00Z')` is
// already 1 Dec at UTC+14, which flipped the boundary test below; and a
// date-only string is parsed as UTC too, so a bare '2030-01-01' is
// 31 Dec 2029 at any negative offset. Build `now` the way the code reads it —
// local — and these hold in every zone.
const at = (y, m, d, h = 12) => new Date(y, m - 1, d, h);

// 10 entries in `year`, spread out (no run > 1), so any year clears the
// RECAP_MIN_ENTRIES floor without accidentally building a long streak.
function tenSpreadEntries(year) {
  return [1, 3, 5, 7, 9, 11, 13, 15, 17, 19].map((d) => e(`${year}-01-${String(d).padStart(2, '0')}`));
}

describe('recapYears', () => {
  test('offers the current year on 1 Dec and not on 30 Nov (boundary, both sides)', () => {
    const entries = tenSpreadEntries(2027);
    expect(recapYears(entries, at(2027, 11, 30))).toEqual([]);
    expect(recapYears(entries, at(2027, 12, 1))).toEqual([2027]);
  });

  test('offers every prior year with enough entries, forever', () => {
    const entries = [...tenSpreadEntries(2020), ...tenSpreadEntries(2025)];
    expect(recapYears(entries, at(2030, 6, 1))).toEqual([2025, 2020]);
  });

  test('omits a year with fewer than 10 entries', () => {
    const entries = tenSpreadEntries(2026).slice(0, 9);
    expect(recapYears(entries, at(2030, 1, 1))).toEqual([]);
  });

  test('returns [] for empty history', () => {
    expect(recapYears([], at(2027, 12, 15))).toEqual([]);
  });

  test('newest first', () => {
    const entries = [...tenSpreadEntries(2019), ...tenSpreadEntries(2022), ...tenSpreadEntries(2021)];
    expect(recapYears(entries, at(2030, 1, 1))).toEqual([2022, 2021, 2019]);
  });

  test('malformed entries never throw', () => {
    const entries = [null, undefined, {}, { dayKey: 42 }, { dayKey: 'not-a-date' }, ...tenSpreadEntries(2026)];
    expect(() => recapYears(entries, at(2030, 1, 1))).not.toThrow();
    expect(recapYears(entries, at(2030, 1, 1))).toEqual([2026]);
  });
});

describe('buildRecap', () => {
  test('returns null below the 10-entry floor', () => {
    const entries = tenSpreadEntries(2026).slice(0, 9);
    expect(buildRecap(entries, 2026, { now: at(2030, 1, 1) })).toBeNull();
  });

  test('counts only that year\'s entries — 31 Dec prior-year and 1 Jan next-year both excluded', () => {
    const entries = [
      e('2026-12-31'), // prior year — excluded
      ...tenSpreadEntries(2027),
      e('2028-01-01'), // next year — excluded
    ];
    const r = buildRecap(entries, 2027, { now: at(2030, 1, 1) });
    expect(r.daysRemembered).toBe(10);
    expect(r.firstEntry).toBe('2027-01-01');
    expect(r.lastEntry).toBe('2027-01-19');
  });

  test('longestStreak is computed within the year, not across it', () => {
    // A 6-day consecutive run spans the year boundary: 3 days in 2026, 3 in
    // 2027. Within 2027 alone the run is only 3, not 6.
    const entries = [
      e('2026-12-29'), e('2026-12-30'), e('2026-12-31'),
      e('2027-01-01'), e('2027-01-02'), e('2027-01-03'),
      // pad 2027 to the 10-entry floor without extending any run
      e('2027-01-05'), e('2027-01-07'), e('2027-01-09'), e('2027-01-11'), e('2027-01-13'), e('2027-01-15'), e('2027-01-17'),
    ];
    const r = buildRecap(entries, 2027, { now: at(2030, 1, 1) });
    expect(r.longestStreak).toBe(3);
  });

  test('topMoods returns at most 3 and is stable on a tie (alphabetical)', () => {
    const entries = [
      e('2027-01-01', { moods: ['Alpha'] }), e('2027-01-02', { moods: ['Alpha'] }), e('2027-01-03', { moods: ['Alpha'] }),
      e('2027-01-04', { moods: ['Beta'] }), e('2027-01-05', { moods: ['Beta'] }), e('2027-01-06', { moods: ['Beta'] }),
      e('2027-01-07', { moods: ['Zeta'] }), e('2027-01-08', { moods: ['Zeta'] }), e('2027-01-09', { moods: ['Zeta'] }),
      e('2027-01-10', { moods: ['Gamma'] }), e('2027-01-11', { moods: ['Gamma'] }),
    ];
    const r = buildRecap(entries, 2027, { now: at(2030, 1, 1) });
    expect(r.topMoods).toEqual([
      { m: 'Alpha', n: 3 },
      { m: 'Beta', n: 3 },
      { m: 'Zeta', n: 3 },
    ]);
  });

  test('peakMonth/quietestMonth on a tie return the earlier month', () => {
    const entries = [
      e('2027-01-01'), e('2027-01-02'), e('2027-01-03'),
      e('2027-02-01'), e('2027-02-02'), e('2027-02-03'),
      e('2027-03-01'), e('2027-03-02'),
      e('2027-04-01'), e('2027-04-02'),
    ];
    const r = buildRecap(entries, 2027, { now: at(2030, 1, 1) });
    expect(r.peakMonth).toBe('January');
    // Jan 3, Feb 3, Mar 2, Apr 2 — the journal covers Jan–Apr, so the tie is
    // between March and April and the earlier one wins. Before IMP-094 this
    // read 'May': the empty May–Dec tail was eligible and the Jan → Dec scan
    // handed the title to the first 0 it met.
    expect(r.quietestMonth).toBe('March');
  });

  // IMP-094 — a month the journal did not cover is absent, not quiet.
  describe('quietestMonth ignores months outside the journal\'s span', () => {
    // Every day from `from` to `to` inclusive, both 'YYYY-MM-DD'.
    const everyDay = (from, to) => {
      const out = [];
      const end = new Date(`${to}T00:00:00Z`).getTime();
      for (let t = new Date(`${from}T00:00:00Z`).getTime(); t <= end; t += 86400000) {
        out.push(e(new Date(t).toISOString().slice(0, 10)));
      }
      return out;
    };

    test('a journal that starts 6 Jun is quietest in June, never in January', () => {
      const r = buildRecap(everyDay('2027-06-06', '2027-12-31'), 2027, { now: at(2030, 1, 1) });
      expect(r.quietestMonth).not.toBe('January');
      // June is the only partial month in the span (25 of 30 days), so it is
      // the genuine quietest.
      expect(r.quietestMonth).toBe('June');
      expect(r.peakMonth).toBe('July'); // 31 days, earliest of the 31-day ties
    });

    test('a full Jan–Dec journal is unchanged — the empty-month rule never fires', () => {
      const entries = [
        ...everyDay('2027-01-01', '2027-01-31'),
        ...everyDay('2027-02-01', '2027-02-10'), // the real trough
        ...everyDay('2027-03-01', '2027-03-31'),
        ...everyDay('2027-04-01', '2027-04-30'),
        ...everyDay('2027-05-01', '2027-05-31'),
        ...everyDay('2027-06-01', '2027-06-30'),
        ...everyDay('2027-07-01', '2027-07-31'),
        ...everyDay('2027-08-01', '2027-08-31'),
        ...everyDay('2027-09-01', '2027-09-30'),
        ...everyDay('2027-10-01', '2027-10-31'),
        ...everyDay('2027-11-01', '2027-11-30'),
        ...everyDay('2027-12-01', '2027-12-31'),
      ];
      const r = buildRecap(entries, 2027, { now: at(2030, 1, 1) });
      expect(r.quietestMonth).toBe('February');
      expect(r.peakMonth).toBe('January');
    });

    test('a journal that stops in March takes its quietest from Jan–Mar, not the empty tail', () => {
      const entries = [
        ...everyDay('2027-01-01', '2027-01-31'),
        ...everyDay('2027-02-01', '2027-02-28'),
        ...everyDay('2027-03-01', '2027-03-05'), // the trough, and the last month
      ];
      const r = buildRecap(entries, 2027, { now: at(2030, 1, 1) });
      expect(r.quietestMonth).toBe('March');
      expect(r.peakMonth).toBe('January');
    });

    test('a single-month journal is both busiest and quietest, no crash', () => {
      const r = buildRecap(everyDay('2027-09-01', '2027-09-30'), 2027, { now: at(2030, 1, 1) });
      expect(r.quietestMonth).toBe('September');
      expect(r.peakMonth).toBe('September');
    });
  });

  test('milestones lists only milestones actually crossed in that year', () => {
    // A 10-day consecutive run: Dec 25-31 2026 (7 days — crosses the "7"
    // milestone ON 2026-12-31, i.e. in the PRIOR year) then continues into
    // Jan 1-3 2027. 2027's own milestones must NOT include the 7-day
    // crossing, because it happened in 2026.
    const entries = [
      e('2026-12-25'), e('2026-12-26'), e('2026-12-27'), e('2026-12-28'),
      e('2026-12-29'), e('2026-12-30'), e('2026-12-31'),
      e('2027-01-01'), e('2027-01-02'), e('2027-01-03'),
      // pad 2027 to the 10-entry floor
      e('2027-01-05'), e('2027-01-07'), e('2027-01-09'), e('2027-01-11'), e('2027-01-13'), e('2027-01-15'), e('2027-01-17'),
    ];
    const r = buildRecap(entries, 2027, { now: at(2030, 1, 1) });
    expect(r.milestones.some((m) => m.label === 'Seven Suns')).toBe(false);
    expect(r.milestones.some((m) => m.day === '2027-01-01')).toBe(true); // the year's first entry

    // Now cross "7" for real, entirely inside 2027.
    const entries2 = [
      e('2027-01-01'), e('2027-01-02'), e('2027-01-03'), e('2027-01-04'),
      e('2027-01-05'), e('2027-01-06'), e('2027-01-07'),
      e('2027-01-09'), e('2027-01-11'), e('2027-01-13'),
    ];
    const r2 = buildRecap(entries2, 2027, { now: at(2030, 1, 1) });
    const crossing = r2.milestones.find((m) => m.label === 'Seven Suns');
    expect(crossing).toBeTruthy();
    expect(crossing.day).toBe('2027-01-07');
  });

  test('malformed entries never throw', () => {
    const entries = [null, undefined, {}, { dayKey: 42 }, ...tenSpreadEntries(2026)];
    expect(() => buildRecap(entries, 2026, { now: at(2030, 1, 1) })).not.toThrow();
    expect(buildRecap(entries, 2026, { now: at(2030, 1, 1) })).not.toBeNull();
  });
});
