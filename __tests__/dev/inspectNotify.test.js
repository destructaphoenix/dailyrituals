// __tests__/dev/inspectNotify.test.js
import { describePending, diffIntendedVsPending } from '../../src/dev/inspectNotify';

const NOW = new Date('2026-06-14T10:00:00.000Z');
const HOUR = 3600_000;

describe('describePending', () => {
  test('normalises a {type:"date", value} trigger', () => {
    const scheduled = [
      { identifier: 'a', content: { title: 'Hello' }, trigger: { type: 'date', value: NOW.getTime() + HOUR } },
    ];
    const rows = describePending(scheduled, NOW);
    expect(rows).toHaveLength(1);
    expect(rows[0].title).toBe('Hello');
    expect(rows[0].when.getTime()).toBe(NOW.getTime() + HOUR);
    expect(rows[0].inLabel).toBe('in 1h');
  });

  test('normalises a {date} trigger, both Date instance and ISO string', () => {
    const when = new Date(NOW.getTime() + 2 * 24 * HOUR);
    const scheduled = [
      { identifier: 'b1', content: { title: 'B1' }, trigger: { date: when } },
      { identifier: 'b2', content: { title: 'B2' }, trigger: { date: when.toISOString() } },
    ];
    const rows = describePending(scheduled, NOW);
    expect(rows[0].when.getTime()).toBe(when.getTime());
    expect(rows[0].inLabel).toBe('in 2d');
    expect(rows[1].when.getTime()).toBe(when.getTime());
  });

  test('treats a seconds-based (time-interval) trigger as now + seconds', () => {
    const scheduled = [
      { identifier: 'c', content: { title: 'Test fire' }, trigger: { seconds: 10, repeats: false } },
    ];
    const rows = describePending(scheduled, NOW);
    expect(rows[0].when.getTime()).toBe(NOW.getTime() + 10_000);
    expect(rows[0].inLabel).toBe('in 10s');
  });

  test('falls back to an unreadable-trigger row instead of crashing', () => {
    const scheduled = [
      { identifier: 'd', content: { title: 'Mystery' }, trigger: { weird: true } },
      { identifier: 'e', content: {}, trigger: null },
    ];
    const rows = describePending(scheduled, NOW);
    expect(rows).toHaveLength(2);
    for (const r of rows) {
      expect(r.when).toBeNull();
      expect(r.inLabel).toBe('unreadable trigger');
    }
    expect(rows[1].title).toBe('(untitled)');
  });

  test('sorts ascending by time, with unreadable rows last', () => {
    const scheduled = [
      { identifier: 'later', content: { title: 'Later' }, trigger: { type: 'date', value: NOW.getTime() + 3 * HOUR } },
      { identifier: 'unreadable', content: { title: 'Unreadable' }, trigger: {} },
      { identifier: 'sooner', content: { title: 'Sooner' }, trigger: { type: 'date', value: NOW.getTime() + HOUR } },
    ];
    const rows = describePending(scheduled, NOW);
    expect(rows.map((r) => r.title)).toEqual(['Sooner', 'Later', 'Unreadable']);
  });

  test('labels a past-due trigger as overdue', () => {
    const scheduled = [
      { identifier: 'x', content: { title: 'Late' }, trigger: { type: 'date', value: NOW.getTime() - 1000 } },
    ];
    const rows = describePending(scheduled, NOW);
    expect(rows[0].inLabel).toBe('overdue');
  });

  test('empty/undefined input yields an empty list', () => {
    expect(describePending([], NOW)).toEqual([]);
    expect(describePending(undefined, NOW)).toEqual([]);
  });
});

describe('diffIntendedVsPending', () => {
  const mkPending = (offsetsMs, titles) =>
    offsetsMs.map((ms, i) => ({ when: new Date(NOW.getTime() + ms), inLabel: '', title: titles ? titles[i] : `t${i}` }));

  test('all intended matched exactly', () => {
    const intended = [new Date(NOW.getTime() + HOUR), new Date(NOW.getTime() + 2 * HOUR)];
    const pending = mkPending([HOUR, 2 * HOUR]);
    const { matched, missing, extra } = diffIntendedVsPending(intended, pending);
    expect(matched).toHaveLength(2);
    expect(missing).toHaveLength(0);
    expect(extra).toHaveLength(0);
  });

  test('within tolerance still matches', () => {
    const intended = [new Date(NOW.getTime() + HOUR)];
    const pending = mkPending([HOUR + 30_000]); // 30s off, default tolerance is 60s
    const { matched, missing } = diffIntendedVsPending(intended, pending);
    expect(matched).toHaveLength(1);
    expect(missing).toHaveLength(0);
  });

  test('beyond tolerance does not match -> missing + extra', () => {
    const intended = [new Date(NOW.getTime() + HOUR)];
    const pending = mkPending([HOUR + 120_000]); // 2min off
    const { matched, missing, extra } = diffIntendedVsPending(intended, pending);
    expect(matched).toHaveLength(0);
    expect(missing).toHaveLength(1);
    expect(extra).toHaveLength(1);
  });

  test('extra pending with no corresponding intended', () => {
    const pending = mkPending([HOUR]);
    const { matched, missing, extra } = diffIntendedVsPending([], pending);
    expect(extra).toHaveLength(1);
    expect(missing).toHaveLength(0);
    expect(matched).toHaveLength(0);
  });

  test('missing intended with no pending at all', () => {
    const intended = [new Date(NOW.getTime() + HOUR)];
    const { matched, missing, extra } = diffIntendedVsPending(intended, []);
    expect(missing).toHaveLength(1);
    expect(matched).toHaveLength(0);
    expect(extra).toHaveLength(0);
  });

  test('unreadable (when=null) pending rows are ignored, never counted as extra', () => {
    const intended = [new Date(NOW.getTime() + HOUR)];
    const pending = [{ when: null, inLabel: 'unreadable trigger', title: 'Mystery' }, ...mkPending([HOUR])];
    const { matched, missing, extra } = diffIntendedVsPending(intended, pending);
    expect(matched).toHaveLength(1);
    expect(missing).toHaveLength(0);
    expect(extra).toHaveLength(0);
  });

  test('custom tolerance is respected', () => {
    const intended = [new Date(NOW.getTime() + HOUR)];
    const pending = mkPending([HOUR + 5000]);
    expect(diffIntendedVsPending(intended, pending, 1000).matched).toHaveLength(0);
    expect(diffIntendedVsPending(intended, pending, 10000).matched).toHaveLength(1);
  });
});
