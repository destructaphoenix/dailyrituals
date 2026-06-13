import { buildHeatmap, buildWeekStrip, buildLifetimeHeatmap } from '../../src/home/calendar';

// 2026-06-07 is a Sunday; 2026-06-03 is a Wednesday. Use a midday UTC time so
// toISOString().slice(0,10) yields the intended date regardless of test host TZ.
const sun = new Date('2026-06-07T12:00:00Z');
const wed = new Date('2026-06-03T12:00:00Z');

describe('buildHeatmap', () => {
  it('returns 35 cells with today as the last cell', () => {
    const cells = buildHeatmap([], sun);
    expect(cells).toHaveLength(35);
    expect(cells[34].today).toBe(true);
    expect(cells[0].today).toBe(false);
  });

  it('renders no-entry days as quiet empties (no skull, no emoji)', () => {
    const cells = buildHeatmap([], sun);
    expect(cells[0]).toEqual({ dayKey: '2026-05-04', empty: true, today: false });
    expect(cells[34]).toEqual({ dayKey: '2026-06-07', empty: true, today: true });
  });

  it('places an entry on its real date with the mood emoji', () => {
    const cells = buildHeatmap([{ dayKey: '2026-06-01', mood: 'Proud' }], sun);
    const cell = cells.find((c) => c.dayKey === '2026-06-01');
    expect(cell).toEqual({ dayKey: '2026-06-01', mood: 'Proud', emoji: '😌', today: false });
  });

  it('marks today when an entry exists for today', () => {
    const cells = buildHeatmap([{ dayKey: '2026-06-07', mood: 'Tender' }], sun);
    expect(cells[34]).toEqual({ dayKey: '2026-06-07', mood: 'Tender', emoji: '🫶', today: true });
  });

  it('entry outside the 35-day window does not render but sets firstKey (past in-window days become missed)', () => {
    const cells = buildHeatmap([{ dayKey: '2026-01-01', mood: 'Proud' }], sun);
    expect(cells.some((c) => c.mood === 'Proud')).toBe(false); // entry itself not shown
    expect(cells.slice(0, 34).every((c) => c.missed)).toBe(true); // past days all missed
    expect(cells[34]).toEqual({ dayKey: '2026-06-07', empty: true, today: true }); // today unchanged
  });

  it('keeps the newest entry when two share a dayKey', () => {
    const cells = buildHeatmap(
      [{ dayKey: '2026-06-05', mood: 'Tender' }, { dayKey: '2026-06-05', mood: 'Proud' }],
      sun
    );
    expect(cells.find((c) => c.dayKey === '2026-06-05').mood).toBe('Tender');
  });
});

describe('buildWeekStrip', () => {
  it('labels Monday-first', () => {
    expect(buildWeekStrip([], wed).map((c) => c.l)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
  });

  it('marks today, future, done and empty states', () => {
    const cells = buildWeekStrip([{ dayKey: '2026-06-02', mood: 'Proud' }], wed);
    expect(cells.map((c) => c.state)).toEqual([
      'empty',   // Mon 06-01, before firstKey (Tue 06-02)
      'done',    // Tue 06-02, has entry
      'today',   // Wed 06-03
      'future',  // Thu 06-04
      'future',  // Fri 06-05
      'future',  // Sat 06-06
      'future',  // Sun 06-07
    ]);
  });
});

describe('buildHeatmap — missed days', () => {
  it('marks a past gap day on/after the first entry as missed', () => {
    // entry on Jun 1; Jun 2–6 are missed; today (Jun 7) stays empty+today
    const cells = buildHeatmap([{ dayKey: '2026-06-01', mood: 'Proud' }], sun);
    const cell = cells.find((c) => c.dayKey === '2026-06-02');
    expect(cell).toEqual({ dayKey: '2026-06-02', missed: true, today: false });
  });

  it('leaves a past day before the first entry as empty (not missed)', () => {
    // entry on Jun 1; May 31 is before firstKey → empty
    const cells = buildHeatmap([{ dayKey: '2026-06-01', mood: 'Proud' }], sun);
    const cell = cells.find((c) => c.dayKey === '2026-05-31');
    expect(cell).toEqual({ dayKey: '2026-05-31', empty: true, today: false });
  });

  it('today with no entry is empty+today, never missed', () => {
    const cells = buildHeatmap([{ dayKey: '2026-06-01', mood: 'Proud' }], sun);
    expect(cells[34]).toEqual({ dayKey: '2026-06-07', empty: true, today: true });
  });

  it('no entries → zero missed cells', () => {
    const cells = buildHeatmap([], sun);
    expect(cells.some((c) => c.missed)).toBe(false);
  });
});

describe('buildWeekStrip — missed days', () => {
  it('marks a past gap day on/after the first entry as missed', () => {
    // entry on Mon 06-01; Tue 06-02 is missed (>= firstKey, no entry)
    const cells = buildWeekStrip([{ dayKey: '2026-06-01', mood: 'Proud' }], wed);
    expect(cells.map((c) => c.state)).toEqual([
      'done',    // Mon 06-01, has entry
      'missed',  // Tue 06-02, no entry, >= firstKey
      'today',   // Wed 06-03
      'future',  // Thu 06-04
      'future',  // Fri 06-05
      'future',  // Sat 06-06
      'future',  // Sun 06-07
    ]);
  });

  it('leaves a past day before the first entry as empty (not missed)', () => {
    // entry on Tue 06-02; Mon 06-01 < firstKey → empty
    const cells = buildWeekStrip([{ dayKey: '2026-06-02', mood: 'Proud' }], wed);
    expect(cells[0].state).toBe('empty'); // Mon 06-01 before firstKey
  });

  it('today is never missed regardless of entries', () => {
    const cells = buildWeekStrip([{ dayKey: '2026-06-01', mood: 'Proud' }], wed);
    expect(cells[2].state).toBe('today'); // Wed = index 2
  });

  it('no entries → zero missed states', () => {
    const cells = buildWeekStrip([], wed);
    expect(cells.every((c) => c.state !== 'missed')).toBe(true);
  });
});

const today = new Date('2026-06-14T12:00:00.000Z'); // a Sunday

describe('buildLifetimeHeatmap', () => {
  test('no entries → empty array', () => {
    expect(buildLifetimeHeatmap([], today)).toEqual([]);
  });

  test('each row is a Monday-first week of 7 cells', () => {
    const rows = buildLifetimeHeatmap([{ dayKey: '2026-06-14' }], today);
    expect(rows.length).toBe(1);          // first entry is in the current week
    expect(rows[0].length).toBe(7);
  });

  test('window spans the first-entry week through the current week', () => {
    // 2026-06-01 is a Monday; 2026-06-14 is a Sunday → 2 calendar weeks
    const rows = buildLifetimeHeatmap([{ dayKey: '2026-06-01' }, { dayKey: '2026-06-14' }], today);
    expect(rows.length).toBe(2);
  });

  test('cell states: done where an entry exists, missed for a gap day before today', () => {
    const rows = buildLifetimeHeatmap([{ dayKey: '2026-06-08', mood: 'calm' }], today);
    // week of 06-08 (Mon) .. 06-14 (Sun). 06-08 has an entry; 06-09 is a past gap.
    const flat = rows.flat();
    const mon = flat.find((c) => c.dayKey === '2026-06-08');
    const tue = flat.find((c) => c.dayKey === '2026-06-09');
    const sun = flat.find((c) => c.dayKey === '2026-06-14');
    expect(mon.mood).toBe('calm');     // done
    expect(tue.missed).toBe(true);     // past gap after first entry
    expect(sun.today).toBe(true);      // today
  });
});
