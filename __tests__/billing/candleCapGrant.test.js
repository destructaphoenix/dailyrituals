// __tests__/billing/candleCapGrant.test.js — IMP-112.
//
// buyCandles and the Plus-renewal effect are closures inside RitualsApp, not
// exported pure functions, so their cap-respecting behavior can only be
// pinned with source assertions here (see autoFreezeStaysFree.test.js for
// the same pattern) — jest cannot render the whole app to drive them.
const fs = require('fs');
const path = require('path');
const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');

describe('buyCandles refuses a pack that overflows the cap, before checking embers', () => {
  const body = source.slice(source.indexOf('const buyCandles = ('), source.indexOf('const getEmbers = ('));

  test('the cap check exists and names the cap and the balance', () => {
    expect(body).toMatch(/freezes\s*\+\s*pack\.count\s*>\s*MAX_CANDLES/);
    expect(body).toMatch(/You can hold \$\{MAX_CANDLES\} candles — you have \$\{freezes\}/);
  });

  test('the cap check runs before the embers check, so a full user is told they are full, not poor', () => {
    const capAt = body.indexOf('MAX_CANDLES');
    const embersAt = body.indexOf('embers < pack.price');
    expect(capAt).toBeGreaterThan(-1);
    expect(embersAt).toBeGreaterThan(-1);
    expect(capAt).toBeLessThan(embersAt);
  });

  test('the cap refusal returns before any embers or freezes are touched', () => {
    const refusal = body.slice(body.indexOf('freezes + pack.count'), body.indexOf('embers < pack.price'));
    expect(refusal).not.toMatch(/setEmbers/);
    expect(refusal).not.toMatch(/setFreezes/);
    expect(refusal).toMatch(/return;/);
  });
});

describe('the Plus-renewal grant is clamped to the cap and the toast tells the truth', () => {
  const body = source.slice(source.indexOf('React.useEffect(() => {\n    const grant = freezeGrantFor'), source.indexOf('// Cancel: route to the OS'));

  test('the grant is clamped through roomFor before it is applied', () => {
    expect(body).toMatch(/roomFor\(freezes, grant\.freezes\)/);
  });

  test('a zero-room grant sets no freezes and shows no toast', () => {
    expect(body).toMatch(/if\s*\(\s*got\s*>\s*0\s*\)\s*\{/);
    const gated = body.slice(body.indexOf('if (got > 0)'));
    expect(gated).toMatch(/setFreezes/);
    expect(gated).toMatch(/showToast/);
  });

  test('the renewal toast names the actual amount granted, not a hardcoded 3', () => {
    expect(body).not.toMatch(/'\+3 candles/);
    expect(body).toMatch(/\+\$\{got\} \$\{got === 1 \? 'candle' : 'candles'\} — your Plus perk renewed/);
  });
});
