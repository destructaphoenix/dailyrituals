import { applyAutoFreeze } from '../../src/home/streakFreeze';

const entry = (dayKey) => ({ id: dayKey, dayKey });

describe('applyAutoFreeze — IMP-039 streak insurance', () => {
  const TODAY = '2026-06-14';

  test('no entries → no-op, same references, spent 0', () => {
    const frozenDays = [];
    const result = applyAutoFreeze([], frozenDays, 5, TODAY);
    expect(result).toEqual({ frozenDays, freezes: 5, spent: 0 });
    expect(result.frozenDays).toBe(frozenDays);
  });

  test('no freezes owned → no-op even with a real gap', () => {
    const entries = [entry('2026-06-10')];
    const result = applyAutoFreeze(entries, [], 0, TODAY);
    expect(result).toEqual({ frozenDays: [], freezes: 0, spent: 0 });
  });

  test('no gap (wrote yesterday) → nothing to freeze', () => {
    const entries = [entry('2026-06-13')];
    const result = applyAutoFreeze(entries, [], 3, TODAY);
    expect(result.spent).toBe(0);
    expect(result.frozenDays).toEqual([]);
    expect(result.freezes).toBe(3);
  });

  test('a single missed day is covered by one freeze', () => {
    const entries = [entry('2026-06-12')]; // 06-13 missed, today not yet written
    const result = applyAutoFreeze(entries, [], 3, TODAY);
    expect(result.frozenDays).toEqual(['2026-06-13']);
    expect(result.freezes).toBe(2);
    expect(result.spent).toBe(1);
  });

  test('a multi-day gap consumes one freeze per missed day, in order', () => {
    const entries = [entry('2026-06-10')]; // 06-11,12,13 missed
    const result = applyAutoFreeze(entries, [], 5, TODAY);
    expect(result.frozenDays).toEqual(['2026-06-11', '2026-06-12', '2026-06-13']);
    expect(result.freezes).toBe(2);
    expect(result.spent).toBe(3);
  });

  test('freezes run out mid-gap → only the affordable prefix is covered', () => {
    const entries = [entry('2026-06-10')]; // 06-11,12,13 missed, only 2 candles
    const result = applyAutoFreeze(entries, [], 2, TODAY);
    expect(result.frozenDays).toEqual(['2026-06-11', '2026-06-12']);
    expect(result.freezes).toBe(0);
    expect(result.spent).toBe(2);
  });

  test('idempotent: days already frozen are never re-spent', () => {
    const entries = [entry('2026-06-10')];
    const result = applyAutoFreeze(entries, ['2026-06-11'], 5, TODAY);
    expect(result.frozenDays).toEqual(['2026-06-11', '2026-06-12', '2026-06-13']);
    expect(result.freezes).toBe(3);
    expect(result.spent).toBe(2);
  });

  test('calling twice in a row the second time is a true no-op', () => {
    const entries = [entry('2026-06-10')];
    const first = applyAutoFreeze(entries, [], 5, TODAY);
    const second = applyAutoFreeze(entries, first.frozenDays, first.freezes, TODAY);
    expect(second.spent).toBe(0);
    expect(second.frozenDays).toBe(first.frozenDays);
    expect(second.freezes).toBe(first.freezes);
  });

  test('only the gap after the most recent entry is ever considered — older gaps are untouched', () => {
    const entries = [entry('2026-06-05'), entry('2026-06-12')]; // old gap before 06-05..06-11 is irrelevant
    const result = applyAutoFreeze(entries, [], 5, TODAY);
    expect(result.frozenDays).toEqual(['2026-06-13']);
  });

  test('today itself is never frozen — the day is not over yet', () => {
    const entries = [entry('2026-06-13')];
    const result = applyAutoFreeze(entries, [], 5, TODAY);
    expect(result.frozenDays).not.toContain(TODAY);
  });
});
