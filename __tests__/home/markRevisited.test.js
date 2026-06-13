import { markRevisited } from '../../src/home/markRevisited';
import { DAILY_QUESTS } from '../../src/data';

const TODAY = '2026-06-13';
const PAST  = '2026-06-12';

const makeQuests = (revisitCur = 0) => [
  { id: 'write',   cur: 0, goal: 1, xp: 10 },
  { id: 'feel',    cur: 0, goal: 1, xp: 10 },
  { id: 'revisit', cur: revisitCur, goal: 1, xp: 10 },
];

describe('DAILY_QUESTS zero-state invariant', () => {
  test('every quest starts with cur: 0', () => {
    DAILY_QUESTS.forEach((q) => {
      expect(q.cur).toBe(0);
    });
  });
});

describe('markRevisited', () => {
  test('(a) past entry sets revisit.cur to goal', () => {
    const qs = makeQuests(0);
    const result = markRevisited(qs, { dayKey: PAST }, TODAY);
    expect(result.find((q) => q.id === 'revisit').cur).toBe(1);
  });

  test('(b) today\'s own entry leaves quests unchanged', () => {
    const qs = makeQuests(0);
    const result = markRevisited(qs, { dayKey: TODAY }, TODAY);
    expect(result.find((q) => q.id === 'revisit').cur).toBe(0);
    expect(result).toBe(qs);
  });

  test('(c) entry with no dayKey leaves quests unchanged', () => {
    const qs = makeQuests(0);
    const result = markRevisited(qs, {}, TODAY);
    expect(result.find((q) => q.id === 'revisit').cur).toBe(0);
    expect(result).toBe(qs);
  });

  test('(d) idempotent — already-kept revisit stays kept', () => {
    const qs = makeQuests(1);
    const result = markRevisited(qs, { dayKey: PAST }, TODAY);
    expect(result.find((q) => q.id === 'revisit').cur).toBe(1);
    expect(result).toBe(qs);
  });

  test('(e) write and feel quests are never altered', () => {
    const qs = makeQuests(0);
    const result = markRevisited(qs, { dayKey: PAST }, TODAY);
    expect(result.find((q) => q.id === 'write').cur).toBe(0);
    expect(result.find((q) => q.id === 'feel').cur).toBe(0);
  });

  test('(f) returns a new array — input not mutated', () => {
    const qs = makeQuests(0);
    const original = JSON.parse(JSON.stringify(qs));
    const result = markRevisited(qs, { dayKey: PAST }, TODAY);
    expect(result).not.toBe(qs);
    expect(qs).toEqual(original);
  });
});
