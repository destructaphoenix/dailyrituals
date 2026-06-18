import { profileIdentity, sanitizeName } from '../../src/profile/identity';

describe('profileIdentity', () => {
  it('returns display and upper-cased initial for a plain name', () => {
    expect(profileIdentity('Maya')).toEqual({ display: 'Maya', initial: 'M' });
  });

  it('trims whitespace and upper-cases the initial', () => {
    expect(profileIdentity('  amara ')).toEqual({ display: 'amara', initial: 'A' });
  });

  it('falls back to Friend / F for empty string', () => {
    expect(profileIdentity('')).toEqual({ display: 'Friend', initial: 'F' });
  });

  it('falls back to Friend / F for undefined', () => {
    expect(profileIdentity(undefined)).toEqual({ display: 'Friend', initial: 'F' });
  });
});

describe('sanitizeName', () => {
  it('returns a normal name unchanged', () => {
    expect(sanitizeName('Maya')).toBe('Maya');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeName('  Sam  ')).toBe('Sam');
  });

  it('returns null for an empty string', () => {
    expect(sanitizeName('')).toBeNull();
  });

  it('returns null for whitespace-only input', () => {
    expect(sanitizeName('   ')).toBeNull();
  });

  it('caps overlong input at 40 characters', () => {
    const long = 'A'.repeat(60);
    expect(sanitizeName(long)).toBe('A'.repeat(40));
  });

  it('preserves unicode and emoji', () => {
    expect(sanitizeName('Amara 🌙')).toBe('Amara 🌙');
  });

  it('preserves accented characters', () => {
    expect(sanitizeName('Zoë')).toBe('Zoë');
  });
});
