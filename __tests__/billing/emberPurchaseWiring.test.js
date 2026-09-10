// __tests__/billing/emberPurchaseWiring.test.js — IMP-113.
//
// buyEmberPack/getEmbers/applyEmberGrants are closures inside RitualsApp, not
// exported pure functions, so their behaviour can only be pinned with source
// assertions here — see candleCapGrant.test.js for the same pattern. This is
// the regression test for the bug the whole spec exists to fix: "onBuy" used
// to be `setEmbers((e) => e + pack.amount)`, a bare counter increment that
// handed over the goods for free.
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');

test('onBuy is no longer a bare counter increment', () => {
  expect(source).not.toMatch(/onBuy=\{\(pack\)\s*=>\s*\{\s*setEmbers/);
  expect(source).not.toMatch(/onBuy=\{\(pack\)\s*=>\s*setEmbers/);
});

describe('buyEmberPack routes through the real store and the local ledger', () => {
  const body = source.slice(source.indexOf('const applyEmberGrants = '), source.indexOf('const subscribe = ('));

  test('exists and calls the real purchase method, not a fake grant', () => {
    expect(body).toMatch(/service\.buyEmberPack\(/);
  });

  test('runs the result through pendingEmberGrants before touching embers', () => {
    expect(body).toMatch(/pendingEmberGrants\(/);
  });

  test('grants on both success and owned (the same rescue shape as buy())', () => {
    expect(body).toMatch(/kind\s*===\s*'success'/);
    expect(body).toMatch(/kind\s*===\s*'owned'/);
  });
});

describe('getEmbers no longer grants embers directly', () => {
  const body = source.slice(source.indexOf('const getEmbers = ('), source.indexOf('const subscribe = ('));

  test('does not increment embers itself', () => {
    expect(body).not.toMatch(/setEmbers/);
  });

  test('routes an enabled, pack-carrying tap through buyEmberPack', () => {
    expect(body).toMatch(/buyEmberPack\(pack\)/);
  });
});

describe('the applied-ember-transaction ledger is persisted', () => {
  test('appliedEmberTx has state', () => {
    expect(source).toMatch(/const \[appliedEmberTx, setAppliedEmberTx\]/);
  });

  test('appliedEmberTx rides in the debounced autosave slice', () => {
    const autosave = source.slice(source.indexOf('React.useEffect(() => {\n    const id = setTimeout'), source.indexOf('const complete = ('));
    expect(autosave).toMatch(/appliedEmberTx/);
  });

  test('appliedEmberTx rides in the backup/export slice (currentSlice)', () => {
    const slice = source.slice(source.indexOf('const currentSlice = ('), source.indexOf('const doExport = '));
    expect(slice).toMatch(/appliedEmberTx/);
  });
});
