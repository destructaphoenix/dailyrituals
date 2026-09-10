// __tests__/billing/simService.test.js
import { createSimService } from '../../src/billing/simService';

describe('createSimService', () => {
  test('buy resolves to the configured purchase outcome', async () => {
    const svc = createSimService({ purchase: 'failed', restore: 'empty' }, false, 0);
    await expect(svc.buy('annual')).resolves.toMatchObject({ kind: 'failed' });
  });
  test('successful buy returns an active entitlement for the chosen plan', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'empty' }, false, 0);
    const res = await svc.buy('monthly');
    expect(res.kind).toBe('success');
    expect(res.entitlement).toMatchObject({ active: true, willRenew: true, plan: 'monthly' });
  });
  test('restore finds an entitlement when already a member', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'empty' }, true, 0);
    await expect(svc.restore()).resolves.toMatchObject({ kind: 'restored' });
  });
  test('restore is empty when not a member and sim says empty', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'empty' }, false, 0);
    await expect(svc.restore()).resolves.toMatchObject({ kind: 'restore-empty' });
  });
  // IMP-083: manageUrl is only reachable if the productId survives the trip from
  // the store to RitualsApp. This stops a refactor quietly dropping the field and
  // silently restoring the account-wide Play list.
  test('every sim entitlement carries a productId for the manage deep link', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'found' }, false, 0, 0);
    expect((await svc.buy('annual')).entitlement.productId).toBe('plus_annual');
    expect((await svc.buy('monthly')).entitlement.productId).toBe('plus_monthly');
    expect((await svc.restore()).entitlement.productId).toBe('plus_annual');
  });
  test('getEntitlement carries it too', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'empty' }, true, 0, 0);
    expect((await svc.getEntitlement()).productId).toBe('plus_annual');
  });
  test('restore finds when sim says found', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'found' }, false, 0);
    await expect(svc.restore()).resolves.toMatchObject({ kind: 'restored' });
  });
});

// ── IMP-113 — the sim must carry the same shape or the suite exercises a
// method that does not exist on the real service. `npm test` runs simService,
// never revenueCatService — a green suite is not evidence about billing.
describe('createSimService — ember packs', () => {
  test('getEmberProducts returns a product per EMBER_PACKS, keyed by productId', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'empty' }, false, 0);
    const products = await svc.getEmberProducts();
    expect(products.map((p) => p.identifier)).toEqual(['embers_240', 'embers_680', 'embers_1500']);
  });

  test('buyEmberPack resolves to the configured purchase outcome', async () => {
    const svc = createSimService({ purchase: 'failed', restore: 'empty' }, false, 0);
    const products = await svc.getEmberProducts();
    await expect(svc.buyEmberPack(products[0])).resolves.toMatchObject({ kind: 'failed' });
  });

  test('a successful buyEmberPack carries a customerInfo with a fresh, grantable transaction', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'empty' }, false, 0);
    const products = await svc.getEmberProducts();
    const res = await svc.buyEmberPack(products[0]);
    expect(res.kind).toBe('success');
    const [txn] = res.customerInfo.nonSubscriptionTransactions;
    expect(txn.productIdentifier).toBe('embers_240');
    expect(typeof txn.transactionIdentifier).toBe('string');
  });

  test('two buys in a row mint two different transaction ids, so both are grantable', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'empty' }, false, 0);
    const products = await svc.getEmberProducts();
    const a = await svc.buyEmberPack(products[0]);
    const b = await svc.buyEmberPack(products[0]);
    const [txA] = a.customerInfo.nonSubscriptionTransactions;
    const [txB] = b.customerInfo.nonSubscriptionTransactions;
    expect(txA.transactionIdentifier).not.toBe(txB.transactionIdentifier);
  });
});
