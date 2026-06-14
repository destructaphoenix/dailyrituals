import { HELLOS } from '../../src/content/greetings';

describe('HELLOS', () => {
  it('has at least 12 greetings', () => {
    expect(HELLOS.length).toBeGreaterThanOrEqual(12);
  });
  it('are all non-empty strings', () => {
    HELLOS.forEach((h) => { expect(typeof h).toBe('string'); expect(h.length).toBeGreaterThan(0); });
  });
  it('contains no duplicates', () => {
    expect(new Set(HELLOS).size).toBe(HELLOS.length);
  });
});
