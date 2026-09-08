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

// IMP-100 — the Android bridge rejects with the STRINGIFIED NUMERIC code
// (RNPurchasesModule.java:708, `getCode() + ""`), not the name. Every case
// below is what a real device actually sends.
describe('the codes the SDK actually emits — IMP-100', () => {
  test('"1" (PURCHASE_CANCELLED_ERROR) → cancel', () => {
    expect(mapPurchaseError({ code: '1' })).toBe('cancel');
  });
  test('"10" (NETWORK_ERROR) → network', () => {
    expect(mapPurchaseError({ code: '10' })).toBe('network');
  });
  test('"35" (OFFLINE_CONNECTION_ERROR) → network', () => {
    expect(mapPurchaseError({ code: '35' })).toBe('network');
  });
  test('"6" (PRODUCT_ALREADY_PURCHASED_ERROR) → owned', () => {
    expect(mapPurchaseError({ code: '6' })).toBe('owned');
  });
  test('"7" (RECEIPT_ALREADY_IN_USE_ERROR) → owned', () => {
    expect(mapPurchaseError({ code: '7' })).toBe('owned');
  });
  test('"20" (PAYMENT_PENDING_ERROR) → deferred', () => {
    expect(mapPurchaseError({ code: '20' })).toBe('deferred');
  });
  test('"2" (STORE_PROBLEM_ERROR) → failed', () => {
    expect(mapPurchaseError({ code: '2' })).toBe('failed');
  });
});
