// __tests__/billing/candleCapGrant.test.js — IMP-112, IMP-114.
//
// buyCandles and the Plus-renewal effect are closures inside RitualsApp, not
// exported pure functions, so their cap-respecting behavior can only be
// pinned with source assertions here (see autoFreezeStaysFree.test.js for
// the same pattern) — jest cannot render the whole app to drive them.
// Shop.js itself IS renderable, so IMP-114's regression (a disabled
// Pressable swallowing the tap) gets both a source assertion and a render test.
const fs = require('fs');
const path = require('path');
const React = require('react');
const { render, fireEvent } = require('@testing-library/react-native');
const Shop = require('../../src/screens/Shop').default;
const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'RitualsApp.js'), 'utf8');
const shopSource = fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'screens', 'Shop.js'), 'utf8');

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

describe('the candle pack Pressable is never disabled — IMP-114', () => {
  const block = shopSource.slice(
    shopSource.indexOf('CANDLE_PACKS.map'),
    shopSource.indexOf('{/* Palettes */}')
  );

  test('the Pressable carries no disabled prop', () => {
    expect(block).not.toMatch(/disabled=/);
  });

  test('afford still drives the opacity dimming', () => {
    expect(block).toMatch(/opacity:\s*afford\s*\?\s*1\s*:\s*0\.5/);
  });
});

describe('tapping an unaffordable candle pack still calls onBuyCandles — IMP-114', () => {
  function renderShop(props = {}) {
    return render(
      <Shop
        insets={{ top: 0, bottom: 0 }} onClose={() => {}} embers={15} plus={false}
        activePalette="classic" ownedPalettes={[]} onApplyPalette={() => {}} onBuyPalette={() => {}}
        activeSky="classic" ownedSkies={[]} onApplySky={() => {}} onBuySky={() => {}}
        freezes={0} onBuyCandles={() => {}} onOpenPaywall={() => {}} onGetEmbers={() => {}} onManage={() => {}}
        {...props}
      />
    );
  }

  test('the tap reaches onBuyCandles instead of being swallowed', () => {
    const onBuyCandles = jest.fn();
    const view = renderShop({ embers: 15, onBuyCandles });
    fireEvent.press(view.getByText('120'));
    expect(onBuyCandles).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1', price: 120 }));
  });
});
