// __tests__/billing/emberGrants.test.js — IMP-113.
//
// nonSubscriptionTransactions is a HISTORY the store keeps forever, not a
// balance — every ember pack ever bought stays in it. pendingEmberGrants is
// the pure core of the local ledger that keeps a grant from firing twice for
// the same transaction, while still being able to catch a purchase that
// completed while the app was killed mid-flight (it just sits unapplied in
// the history until the next customerInfo arrives).
import { pendingEmberGrants } from '../../src/billing/emberGrants';

const PACKS_BY_ID = {
  embers_240: { amount: 240 },
  embers_680: { amount: 680 },
  embers_1500: { amount: 1500 },
};

const tx = (id, productIdentifier) => ({ transactionIdentifier: id, productIdentifier, purchaseDate: '2026-09-10T00:00:00.000Z' });

describe('pendingEmberGrants', () => {
  test('a new transaction grants once', () => {
    const out = pendingEmberGrants([tx('t1', 'embers_240')], [], PACKS_BY_ID);
    expect(out).toEqual({ amount: 240, grantedIds: ['t1'] });
  });

  test('the same transaction seen twice grants once', () => {
    const out = pendingEmberGrants([tx('t1', 'embers_240'), tx('t1', 'embers_240')], [], PACKS_BY_ID);
    expect(out).toEqual({ amount: 240, grantedIds: ['t1'] });
  });

  test('a transaction already in the ledger grants nothing', () => {
    const out = pendingEmberGrants([tx('t1', 'embers_240')], ['t1'], PACKS_BY_ID);
    expect(out).toEqual({ amount: 0, grantedIds: [] });
  });

  test('an empty ledger re-grants the whole history — accepted deliberately (IMP-113)', () => {
    const out = pendingEmberGrants(
      [tx('t1', 'embers_240'), tx('t2', 'embers_680')],
      [],
      PACKS_BY_ID
    );
    expect(out).toEqual({ amount: 920, grantedIds: ['t1', 't2'] });
  });

  test('an unknown productIdentifier grants nothing, never NaN', () => {
    const out = pendingEmberGrants([tx('t1', 'some_other_product')], [], PACKS_BY_ID);
    expect(out.amount).toBe(0);
    expect(Number.isNaN(out.amount)).toBe(false);
    expect(out.grantedIds).toEqual([]);
  });

  test('only the not-yet-applied transactions in a mixed history are granted', () => {
    const out = pendingEmberGrants(
      [tx('t1', 'embers_240'), tx('t2', 'embers_1500'), tx('t3', 'embers_680')],
      ['t1', 't3'],
      PACKS_BY_ID
    );
    expect(out).toEqual({ amount: 1500, grantedIds: ['t2'] });
  });

  test('no transactions or a missing history is a no-op, not a throw', () => {
    expect(pendingEmberGrants([], [], PACKS_BY_ID)).toEqual({ amount: 0, grantedIds: [] });
    expect(pendingEmberGrants(null, [], PACKS_BY_ID)).toEqual({ amount: 0, grantedIds: [] });
    expect(pendingEmberGrants(undefined, undefined, PACKS_BY_ID)).toEqual({ amount: 0, grantedIds: [] });
  });

  test('a transaction with no transactionIdentifier is skipped rather than granted unkeyed', () => {
    const out = pendingEmberGrants([{ productIdentifier: 'embers_240' }], [], PACKS_BY_ID);
    expect(out).toEqual({ amount: 0, grantedIds: [] });
  });
});
