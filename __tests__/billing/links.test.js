// __tests__/billing/links.test.js — IMP-083.
// The manage/cancel deep link must land on the Daily Rituals subscription, not
// on the account-wide list. `manageUrl` is pure, and the URL shape is the whole
// defect — so it is tested without going near `Linking`.
import { manageUrl } from '../../src/billing/links';
import { LINKS } from '../../src/billing/config';

const PKG = 'app.dailyrituals.mobile';

describe('manageUrl — IMP-083', () => {
  test('android + a product id deep-links to that subscription', () => {
    expect(manageUrl({ platform: 'android', productId: 'plus_annual', packageName: PKG })).toBe(
      'https://play.google.com/store/account/subscriptions?sku=plus_annual&package=app.dailyrituals.mobile'
    );
  });

  // RevenueCat returns Google Play ids as `product:basePlan`. Play's `sku` wants
  // the product alone — the full string resolves to nothing.
  test('the base-plan suffix is stripped', () => {
    expect(manageUrl({ platform: 'android', productId: 'plus_annual:annual', packageName: PKG })).toBe(
      manageUrl({ platform: 'android', productId: 'plus_annual', packageName: PKG })
    );
    expect(manageUrl({ platform: 'android', productId: 'plus_monthly:monthly', packageName: PKG })).toBe(
      'https://play.google.com/store/account/subscriptions?sku=plus_monthly&package=app.dailyrituals.mobile'
    );
  });

  // A degraded link must be today's link, never a 404.
  test('no product id falls back to the generic Play list', () => {
    expect(manageUrl({ platform: 'android', packageName: PKG })).toBe(LINKS.manageAndroid);
    expect(manageUrl({ platform: 'android', productId: null, packageName: PKG })).toBe(LINKS.manageAndroid);
    expect(manageUrl({ platform: 'android', productId: '', packageName: PKG })).toBe(LINKS.manageAndroid);
  });

  test('no package name falls back to the generic Play list', () => {
    expect(manageUrl({ platform: 'android', productId: 'plus_annual' })).toBe(LINKS.manageAndroid);
    expect(manageUrl({ platform: 'android', productId: 'plus_annual', packageName: '' })).toBe(LINKS.manageAndroid);
  });

  test('a product id that is nothing but a suffix marker degrades, not 404s', () => {
    expect(manageUrl({ platform: 'android', productId: ':annual', packageName: PKG })).toBe(LINKS.manageAndroid);
  });

  // Apple has no equivalent parameter, so iOS is unchanged in every case.
  test('ios always gets the Apple subscriptions URL', () => {
    expect(manageUrl({ platform: 'ios', productId: 'plus_annual', packageName: PKG })).toBe(LINKS.manageIos);
    expect(manageUrl({ platform: 'ios' })).toBe(LINKS.manageIos);
  });

  test('both values are URL-encoded', () => {
    expect(manageUrl({ platform: 'android', productId: 'a b', packageName: 'x&y' })).toBe(
      'https://play.google.com/store/account/subscriptions?sku=a%20b&package=x%26y'
    );
  });
});

