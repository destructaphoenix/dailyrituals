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
  test('restore finds when sim says found', async () => {
    const svc = createSimService({ purchase: 'success', restore: 'found' }, false, 0);
    await expect(svc.restore()).resolves.toMatchObject({ kind: 'restored' });
  });
});
