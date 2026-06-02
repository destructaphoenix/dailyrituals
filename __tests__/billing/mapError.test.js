// __tests__/billing/mapError.test.js
import { mapPurchaseError } from '../../src/billing/mapError';

describe('mapPurchaseError', () => {
  test('user cancellation → cancel', () => {
    expect(mapPurchaseError({ userCancelled: true })).toBe('cancel');
    expect(mapPurchaseError({ code: 'PURCHASE_CANCELLED' })).toBe('cancel');
  });
  test('network problems → network', () => {
    expect(mapPurchaseError({ code: 'NETWORK_ERROR' })).toBe('network');
    expect(mapPurchaseError({ code: 'OFFLINE_CONNECTION_ERROR' })).toBe('network');
  });
  test('already-entitled → owned', () => {
    expect(mapPurchaseError({ code: 'PRODUCT_ALREADY_PURCHASED' })).toBe('owned');
    expect(mapPurchaseError({ code: 'RECEIPT_ALREADY_IN_USE_ERROR' })).toBe('owned');
  });
  test('anything else → failed', () => {
    expect(mapPurchaseError({ code: 'STORE_PROBLEM' })).toBe('failed');
    expect(mapPurchaseError({})).toBe('failed');
    expect(mapPurchaseError(null)).toBe('failed');
  });
});
