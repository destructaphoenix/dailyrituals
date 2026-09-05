// __tests__/billing/format.test.js
import { formatRenewDate, planFromProductId } from '../../src/billing/format';
import { RENEW_DATE } from '../../src/data';

describe('formatRenewDate', () => {
  test('formats an ISO date as "D Mon YYYY"', () => {
    expect(formatRenewDate('2026-06-12T00:00:00.000Z')).toBe('12 Jun 2026');
  });
  // IMP-082: never fabricate a renewal date. No live date ⇒ no claim.
  test('returns null for missing input rather than a fabricated date', () => {
    expect(formatRenewDate(null)).toBeNull();
    expect(formatRenewDate(undefined)).toBeNull();
    expect(formatRenewDate('')).toBeNull();
  });
  test('returns null for an unparseable date string', () => {
    expect(formatRenewDate('not-a-date')).toBeNull();
  });
  test('never returns the design mock constant', () => {
    expect(formatRenewDate(null)).not.toBe(RENEW_DATE);
    expect(formatRenewDate('not-a-date')).not.toBe(RENEW_DATE);
  });
});

describe('planFromProductId', () => {
  test('maps yearly/annual product ids to annual', () => {
    expect(planFromProductId('rituals_plus_annual')).toBe('annual');
    expect(planFromProductId('com.app.plus.yearly')).toBe('annual');
  });
  test('maps monthly product ids to monthly', () => {
    expect(planFromProductId('rituals_plus_monthly')).toBe('monthly');
  });
  test('defaults unknown ids to annual', () => {
    expect(planFromProductId('')).toBe('annual');
    expect(planFromProductId(undefined)).toBe('annual');
  });
});
