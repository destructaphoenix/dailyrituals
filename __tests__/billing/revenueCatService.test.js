// __tests__/billing/revenueCatService.test.js — IMP-083.
// The real SDK is never loaded here: react-native-purchases pulls in an
// untransformable ESM dependency, which is why this module had no test until
// now. `toEntitlement` is pure over a CustomerInfo shape, so a bare stub is
// enough — and the field this guards is exactly what a refactor would drop.
jest.mock('react-native-purchases', () => ({ __esModule: true, default: {} }));

import { toEntitlement } from '../../src/billing/revenueCatService';

const customerInfo = (ent) => ({ entitlements: { active: { plus: ent } } });

describe('toEntitlement — IMP-083', () => {
  test('keeps the raw RevenueCat product identifier, suffix and all', () => {
    const e = toEntitlement(customerInfo({
      productIdentifier: 'plus_annual:annual', expirationDate: '2027-03-03T00:00:00.000Z',
    }));
    // Raw: manageUrl owns the `product:basePlan` strip, not this mapper.
    expect(e.productId).toBe('plus_annual:annual');
    expect(e.plan).toBe('annual'); // unchanged by IMP-083
  });

  test('null-safe when the store omits the identifier', () => {
    expect(toEntitlement(customerInfo({ expirationDate: null })).productId).toBeNull();
  });

  test('no active entitlement is still null overall', () => {
    expect(toEntitlement({ entitlements: { active: {} } })).toBeNull();
    expect(toEntitlement(null)).toBeNull();
  });
});
