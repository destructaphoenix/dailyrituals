import { isValidName } from '../../src/profile/name';

describe('isValidName', () => {
  it('empty string → false', () => expect(isValidName('')).toBe(false));
  it('whitespace-only → false', () => expect(isValidName('   ')).toBe(false));
  it('single space → false', () => expect(isValidName(' ')).toBe(false));
  it('"Sam" → true', () => expect(isValidName('Sam')).toBe(true));
  it('"  Sam  " → true (trims)', () => expect(isValidName('  Sam  ')).toBe(true));
  it('tab-only → false', () => expect(isValidName('\t')).toBe(false));
});
