// __tests__/billing/format.test.js
import { formatRenewDate, planFromProductId } from '../../src/billing/format';

describe('formatRenewDate', () => {
  test('formats an ISO date as "D Mon YYYY"', () => {
    expect(formatRenewDate('2026-06-12T00:00:00.000Z')).toBe('12 Jun 2026');
  });
  test('returns the fallback constant for null/invalid input', () => {
    expect(formatRenewDate(null)).toBe('12 Jun 2026');
    expect(formatRenewDate('not-a-date')).toBe('12 Jun 2026');
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
