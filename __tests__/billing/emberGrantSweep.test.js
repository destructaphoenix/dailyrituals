// __tests__/billing/emberGrantSweep.test.js — IMP-129.
//
// emberGrants.js documented a self-healing launch sweep that nothing ever
// called: applyEmberGrants had exactly one call site, inside buyEmberPack, so
// a purchase that resolved while the app was being killed was paid for and
// never granted, and relaunching did not fix it. RitualsApp IS renderable
// (see __tests__/screens/FabLabel.test.js) — this mounts it for real, with
// createPurchaseService swapped for a fake whose getCustomerInfoRaw stands in
// for the store, to prove the launch sweep actually moves the balance rather
// than just asserting the wiring exists in source.
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import RitualsApp from '../../src/RitualsApp';
import { DEFAULT_SETTINGS } from '../../src/theme';
import { checkEntitlement } from '../../src/billing/entitlementSync';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(async () => ({ status: 'undetermined' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'undetermined' })),
  cancelAllScheduledNotificationsAsync: jest.fn(async () => {}),
  scheduleNotificationAsync: jest.fn(async () => 'id'),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove() {} })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove() {} })),
  getLastNotificationResponseAsync: jest.fn(async () => null),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const mockSaveState = jest.fn();
jest.mock('../../src/persistence/storage', () => ({ saveState: (...args) => mockSaveState(...args) }));

jest.mock('../../src/billing', () => {
  const actual = jest.requireActual('../../src/billing');
  return { ...actual, createPurchaseService: jest.fn() };
});
const { createPurchaseService } = require('../../src/billing');

const metrics = initialWindowMetrics || {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

function renderApp({ service, initialState = {}, initialPlus = false }) {
  createPurchaseService.mockReturnValue(service);
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <RitualsApp
        settings={DEFAULT_SETTINGS}
        setSettings={() => {}}
        onToggleMode={() => {}}
        onResetData={() => {}}
        onReplaceAllData={() => {}}
        initialPlus={initialPlus}
        initialState={initialState}
      />
    </SafeAreaProvider>
  );
}

const emberTx = (id, productIdentifier = 'embers_240') => ({
  transactionIdentifier: id, productIdentifier, purchaseDate: '2026-09-13T00:00:00.000Z',
});

beforeEach(() => { jest.clearAllMocks(); });

describe('the launch sweep — IMP-129', () => {
  // This is the regression test for the bug the whole spec exists to fix.
  // Before RitualsApp.js wires applyEntitlementResult → applyEmberGrants
  // (step 3), embers stays 0 here regardless of what getCustomerInfoRaw
  // returns — this must fail before that wiring exists.
  test('grants an un-applied transaction from the last launch, silently', async () => {
    const service = {
      getEntitlement: jest.fn(async () => null),
      getCustomerInfoRaw: jest.fn(async () => ({ nonSubscriptionTransactions: [emberTx('rc-1')] })),
    };
    renderApp({ service, initialState: { embers: 0, appliedEmberTx: [] } });

    await waitFor(() => expect(mockSaveState).toHaveBeenCalledWith(
      expect.objectContaining({ embers: 240, appliedEmberTx: ['rc-1'] })
    ), { timeout: 10000 });
  }, 15000);

  test('is idempotent — a transaction already in the ledger grants 0 and mutates nothing', async () => {
    const service = {
      getEntitlement: jest.fn(async () => null),
      getCustomerInfoRaw: jest.fn(async () => ({ nonSubscriptionTransactions: [emberTx('rc-1')] })),
    };
    renderApp({ service, initialState: { embers: 0, appliedEmberTx: ['rc-1'] } });

    await waitFor(() => expect(service.getCustomerInfoRaw).toHaveBeenCalled());
    // Give a (wrongful) second grant a chance to land before asserting its absence.
    await new Promise((r) => setTimeout(r, 600));
    expect(mockSaveState).toHaveBeenCalledWith(
      expect.objectContaining({ embers: 0, appliedEmberTx: ['rc-1'] })
    );
  }, 15000);

  // The control: proves step 1 (threading customerInfo through checkEntitlement)
  // did not leak a new input into nextPlusState's offline-first downgrade policy.
  test('an unreachable store grants nothing and — the control — does not move plus', async () => {
    const service = {
      getEntitlement: jest.fn(async () => { throw new Error('offline'); }),
      getCustomerInfoRaw: jest.fn(async () => ({ nonSubscriptionTransactions: [emberTx('rc-2')] })),
    };
    renderApp({ service, initialPlus: true, initialState: { embers: 0, appliedEmberTx: [] } });

    await waitFor(() => expect(mockSaveState).toHaveBeenCalledWith(
      expect.objectContaining({ plus: true, embers: 0, appliedEmberTx: [] })
    ), { timeout: 10000 });
    // checkEntitlement's catch path never calls getCustomerInfoRaw — see below.
    expect(service.getCustomerInfoRaw).not.toHaveBeenCalled();
  }, 15000);
});

describe("checkEntitlement's catch path — IMP-129", () => {
  test('returns customerInfo: null, and the launch sweep does not throw on it', async () => {
    const svc = {
      getEntitlement: jest.fn(async () => { throw new Error('offline'); }),
      getCustomerInfoRaw: jest.fn(async () => ({ nonSubscriptionTransactions: [] })),
    };
    await expect(checkEntitlement(svc)).resolves.toEqual({ verified: false, entitlement: null, customerInfo: null });
  });
});
