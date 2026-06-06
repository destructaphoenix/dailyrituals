import { profileIdentity } from '../../src/profile/identity';

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
