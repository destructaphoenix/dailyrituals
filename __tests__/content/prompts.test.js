import { PROMPTS } from '../../src/content/prompts';

describe('PROMPTS', () => {
  it('has 60 prompts (~2 months before the deck recycles)', () => {
    expect(PROMPTS.length).toBe(60);
  });
  it('are all non-empty strings', () => {
    PROMPTS.forEach((p) => { expect(typeof p).toBe('string'); expect(p.trim().length).toBeGreaterThan(0); });
  });
  it('contains no duplicates', () => {
    expect(new Set(PROMPTS).size).toBe(PROMPTS.length);
  });
});
