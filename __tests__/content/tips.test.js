import { TIPS, EXPLAINERS, pendingTip, markTipSeen } from '../../src/content/tips';

const SCREENS = ['today', 'archive', 'you'];

describe('pendingTip', () => {
  it('returns the tip for an unseen screen', () => {
    const tip = pendingTip('today', []);
    expect(tip).not.toBeNull();
    expect(tip.screen).toBe('today');
  });

  it('returns null once its id is in seenTips', () => {
    const tip = pendingTip('today', []);
    expect(pendingTip('today', [tip.id])).toBeNull();
  });

  it("returns null for a screen with no tip ('insights')", () => {
    expect(pendingTip('insights', [])).toBeNull();
  });

  it('tolerates undefined/null seenTips', () => {
    expect(pendingTip('today', undefined)).not.toBeNull();
    expect(pendingTip('today', null)).not.toBeNull();
  });
});

describe('markTipSeen', () => {
  it('returns a new array and does not mutate the input', () => {
    const input = [];
    const result = markTipSeen(input, 'today-streak');
    expect(result).not.toBe(input);
    expect(input).toEqual([]);
    expect(result).toEqual(['today-streak']);
  });

  it('is idempotent (adding a seen id twice yields one entry)', () => {
    const once = markTipSeen([], 'today-streak');
    const twice = markTipSeen(once, 'today-streak');
    expect(twice).toEqual(['today-streak']);
  });
});

describe('TIPS', () => {
  it('has every id unique', () => {
    const ids = TIPS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has every screen one of today/archive/you', () => {
    TIPS.forEach((t) => expect(SCREENS).toContain(t.screen));
  });
});

describe('EXPLAINERS', () => {
  it('has exactly six entries', () => {
    expect(EXPLAINERS.length).toBe(6);
  });

  it('has a non-empty label, title and body for every entry', () => {
    EXPLAINERS.forEach((e) => {
      expect(typeof e.label).toBe('string');
      expect(e.label.length).toBeGreaterThan(0);
      expect(typeof e.title).toBe('string');
      expect(e.title.length).toBeGreaterThan(0);
      expect(typeof e.body).toBe('string');
      expect(e.body.length).toBeGreaterThan(0);
    });
  });

  it('has every id unique', () => {
    const ids = EXPLAINERS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
