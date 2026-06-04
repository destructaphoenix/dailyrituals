# Daily Rituals — Expo App Lift + Real Billing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Also update [`/PROGRESS.md`](../../../PROGRESS.md) at the end of every phase** — it is the cross-chat source of truth when context is lost.

**Goal:** Lift the complete, working `RitualsNative_reference/` Expo app into the live project root and replace the simulated purchase/restore flow with real RevenueCat billing while keeping every designed purchase-state screen pixel-faithful.

**Architecture:** The reference app already implements all four App Store / Play compliance items (single paywall, manage/cancel, purchase-state UX, legal footer) against a **simulation** driven by `settings.storePurchase` / `settings.storeRestore`. We introduce a thin **billing service abstraction** (`src/billing/`) with two interchangeable implementations — `simService` (preserves the existing reviewable simulation, used in Expo Go) and `revenueCatService` (real SDK, used in dev/production builds). `usePurchaseFlow` is refactored to drive its existing pending→result state machine off this async service instead of hard-coded timers. Renewal date, plan, and price are sourced from the live entitlement with the existing constants as fallback. The UI layer (every screen, overlay, copy, token) is lifted **verbatim** — no visual change.

**Tech Stack:** Expo SDK 51, React Native 0.74.5, JavaScript (no TS conversion), `react-native-purchases` (RevenueCat) v8 + its Expo config plugin, `expo-dev-client`, `expo-linear-gradient`, `react-native-svg`, Jest + `jest-expo` + `@testing-library/react-native` for the new billing logic.

**Scope (locked with user 2026-06-03):** Lift the app + wire RevenueCat billing for the four compliance items ONLY. All non-billing app state (entries, embers, streak, settings) stays in-memory exactly as the reference. Build target is a local/custom dev client; EAS submission and full data persistence are explicitly out of scope (tracked as "Future" in PROGRESS.md).

**Source of truth for design:** `design_handoff_plus_compliance/README.md` (screens, copy, tokens, states) and `design_handoff_plus_compliance/RitualsNative_reference/` (working code). The handoff folder is git-ignored — never modify it; copy out of it.

---

## Critical context for any worker picking this up cold

- **Project root** `e:\rsphoenix02\dailyrituals\` currently contains only `.gitignore`, `docs/`, `PROGRESS.md`, and the git-ignored `design_handoff_plus_compliance/`. There is **no app at root yet** — Phase 0 creates it by copying from the reference.
- **The reference is complete and runs.** Do not rewrite screens. The only behavioral change in the whole plan is *where purchase/restore outcomes come from*.
- **Expo Go cannot run RevenueCat** (it needs native modules). The design keeps the app fully runnable in Expo Go by falling back to `simService` when the native module / API key is absent. Real billing requires a dev client build (Phase 6).
- **Windows host:** iOS dev-client builds need a Mac or EAS (out of scope now). Android dev-client builds work locally with Android Studio. UI review works in Expo Go on any phone. Plan all manual billing verification on **Android dev client** or note it as blocked pending a Mac/EAS.
- **The two simulation knobs** today: `usePurchaseFlow` reads `sim.purchase`/`sim.restore` (from `settings.storePurchase`/`storeRestore` in `theme.js`) and uses `setTimeout` (1500ms buy / 1300ms restore). After this plan, timing moves into `simService`; real timing comes from the SDK promise.

---

## File Structure (what gets created / changed)

**Lifted verbatim from `design_handoff_plus_compliance/RitualsNative_reference/` → project root (Phase 0):**
```
App.js, app.json, babel.config.js, package.json
src/  (theme.js, data.js, icons.js, art.js, ui.js, RitualsApp.js, gamify.js, shopui.js,
       and all of src/screens/*.js)
```

**New billing layer (created by this plan):**
```
src/billing/
  config.js            Entitlement id, RevenueCat keys (from env via expo-constants), links, deep-link URLs, feature flag
  format.js            formatRenewDate(iso) → "12 Jun 2026"; planFromProductId(id) → 'annual'|'monthly'  [PURE — TDD]
  mapError.js          mapPurchaseError(e) → 'cancel'|'network'|'owned'|'failed'                          [PURE — TDD]
  simService.js        Simulation implementation of the service interface (preserves design timing)        [TDD]
  revenueCatService.js Real RevenueCat implementation of the service interface
  links.js             openExternal(kind, platform) — Linking to terms/privacy/store subscription settings
  index.js             createPurchaseService({settings, platform}) — picks real vs sim; isBillingConfigured()
```

**Modified (this plan):**
```
App.js                 Initialize RevenueCat once on mount (no-op when unconfigured); pass initial entitlement down
app.config.js          (replaces app.json) — RevenueCat config plugin + extra keys from env + expo-dev-client
package.json           Add deps + jest config + test script
src/screens/PlusFlow.js   usePurchaseFlow refactored to drive off the async service; overlay/components unchanged
src/screens/Paywall.js    buy() now receives the selected plan; price can come from live offerings (fallback to constants)
src/RitualsApp.js         Build the service once; replace openLink toasts with real Linking; cancel/resume reflect live willRenew; source RENEW_DATE/plan/price from entitlement with fallback
.env.example           Document RC_IOS_KEY / RC_ANDROID_KEY / links
```

**New tests:**
```
__tests__/billing/format.test.js
__tests__/billing/mapError.test.js
__tests__/billing/simService.test.js
__tests__/billing/purchaseFlow.test.js   (hook test with a fake service)
```

---

## Service interface contract (the seam everything depends on)

Both `simService` and `revenueCatService` implement this exact shape. Defining it once here; every later task matches these names.

```js
/**
 * @typedef {Object} Entitlement
 * @property {boolean} active          - is Plus currently active
 * @property {boolean} willRenew       - false ⇒ cancelled / ending
 * @property {('annual'|'monthly')} plan
 * @property {string|null} renewISO    - ISO date of next renewal / access-until, or null
 * @property {string|null} priceString - localized price e.g. "$29.99", or null (fallback to constants)
 */

/**
 * @typedef {Object} PurchaseService
 * @property {(plan: 'annual'|'monthly') => Promise<{kind:'success'|'cancel'|'failed'|'network'|'owned', entitlement?:Entitlement}>} buy
 * @property {() => Promise<{kind:'restored'|'restore-empty'|'network'|'failed', entitlement?:Entitlement}>} restore
 * @property {() => Promise<Entitlement|null>} getEntitlement
 * @property {() => Promise<{annual?:{priceString:string}, monthly?:{priceString:string}}>} getPrices
 */
```

`kind` values map 1:1 to the existing `RESULT_META` keys in `PlusFlow.js`, so the overlay needs no changes.

---

## Phase 0 — Bootstrap: lift the reference app to root and prove it boots

### Task 0.1: Copy the reference app into the project root

**Files:**
- Create (copy): root `App.js`, `app.json`, `babel.config.js`, `package.json`, and the whole `src/` tree from `design_handoff_plus_compliance/RitualsNative_reference/`.

- [ ] **Step 1: Copy the app files (PowerShell, Windows host)**

```powershell
$src = "e:\rsphoenix02\dailyrituals\design_handoff_plus_compliance\RitualsNative_reference"
$dst = "e:\rsphoenix02\dailyrituals"
Copy-Item "$src\App.js","$src\app.json","$src\babel.config.js","$src\package.json" $dst
Copy-Item "$src\src" $dst -Recurse
```

- [ ] **Step 2: Verify the tree landed**

Run: `Get-ChildItem e:\rsphoenix02\dailyrituals\src\screens | Select-Object Name`
Expected: lists `Paywall.js`, `PlusFlow.js`, `HomeScreen.js`, `Onboarding.js`, … (15 screens).

- [ ] **Step 3: Commit**

```powershell
git add App.js app.json babel.config.js package.json src
git commit -m "chore: lift RitualsNative reference app to project root"
```

### Task 0.2: Install dependencies and verify the bundler builds

**Files:** none (uses copied `package.json`).

- [ ] **Step 1: Install**

Run: `npm install`
Expected: completes without peer-dependency errors that block install (warnings OK).

- [ ] **Step 2: Start Metro and confirm it bundles**

Run: `npx expo start` (then press `w` for web, or scan the QR with Expo Go). Leave it ~20s.
Expected: "Metro waiting" / a successful bundle with **no red-screen import errors**. Confirm the **Onboarding** screen renders (first-run gate). This is the baseline — the app must boot before any billing work.

- [ ] **Step 3: Stop Metro and commit the lockfile**

```powershell
git add package-lock.json
git commit -m "chore: lock dependencies for lifted app"
```

> ✅ **Update PROGRESS.md Phase 0 → Done.** The app now lives at root and boots with the simulation intact.

---

## Phase 1 — Central config + real external links (no SDK yet)

This phase is safe to ship on its own: it replaces the "Opening Terms…" toasts with real `Linking` calls and centralizes all billing constants, while the purchase flow stays simulated.

### Task 1.1: Create the billing config module

**Files:**
- Create: `src/billing/config.js`

- [ ] **Step 1: Write the config module**

```js
// src/billing/config.js — single source for billing constants. RevenueCat keys
// come from env via app.config.js → expo-constants. When keys are absent (Expo
// Go / no .env), the app falls back to the simulation so every screen stays
// reviewable. RevenueCat SDK keys are publishable (client-safe) but we still
// source them from env to keep them out of source.

import Constants from 'expo-constants';

const extra = (Constants.expoConfig && Constants.expoConfig.extra) || {};

// The RevenueCat "entitlement" that grants Plus. Create this in the RevenueCat
// dashboard and keep this string in sync with it.
export const ENTITLEMENT_ID = 'plus';

// Publishable RevenueCat API keys, per platform.
export const RC_KEYS = {
  ios: extra.rcIosKey || '',
  android: extra.rcAndroidKey || '',
};

// Real legal + store URLs. Replace the placeholders before any store submission.
export const LINKS = {
  terms: extra.termsUrl || 'https://dailyrituals.app/terms',
  privacy: extra.privacyUrl || 'https://dailyrituals.app/privacy',
  // OS-managed subscription settings (used by Cancel / manage deep-links).
  manageIos: 'https://apps.apple.com/account/subscriptions',
  manageAndroid: 'https://play.google.com/store/account/subscriptions',
};

// True only when a key exists for this platform AND the native module loads.
// `index.js` combines this with a runtime module check.
export function hasKeyFor(platform) {
  return Boolean(platform === 'android' ? RC_KEYS.android : RC_KEYS.ios);
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/billing/config.js
git commit -m "feat(billing): add central billing config module"
```

### Task 1.2: Real external links via Linking

**Files:**
- Create: `src/billing/links.js`

- [ ] **Step 1: Write the links helper**

```js
// src/billing/links.js — open real external destinations. Replaces the
// placeholder "Opening…" toasts. `kind` matches the LegalFooter / Manage links.
import { Linking } from 'react-native';
import { LINKS } from './config';

export async function openExternal(kind, platform) {
  const url =
    kind === 'terms' ? LINKS.terms :
    kind === 'privacy' ? LINKS.privacy :
    kind === 'manage' ? (platform === 'android' ? LINKS.manageAndroid : LINKS.manageIos) :
    null;
  if (!url) return false;
  try {
    await Linking.openURL(url);
    return true;
  } catch (e) {
    console.warn('openExternal failed', kind, e); // eslint: surfaced, not swallowed
    return false;
  }
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/billing/links.js
git commit -m "feat(billing): open real Terms/Privacy/store-settings links"
```

### Task 1.3: Wire real links into RitualsApp

**Files:**
- Modify: `src/RitualsApp.js` (the `openLink` definition around lines 82-85, and the `onCancel` handler around line 268).

- [ ] **Step 1: Replace the toast-only `openLink`**

Find (lines ~82-85):
```js
  const openLink = (k) => showToast(
    k === 'terms' ? 'Opening Terms of Service…' :
    k === 'privacy' ? 'Opening Privacy Policy…' : 'Opening…'
  );
```
Replace with:
```js
  const openLink = (k) => { openExternal(k, PLATFORM); };
```

- [ ] **Step 2: Add the import at the top of the file** (next to the other screen imports, after line 27)

```js
import { openExternal } from './billing/links';
```

- [ ] **Step 3: Verify in Expo Go**

Run: `npx expo start`, open the app, get into the Paywall (You tab → tap the Plus banner when not a member, or onboarding), tap **Terms of Service**.
Expected: the device browser opens the terms URL (placeholder domain is fine — it just must navigate, not toast).

- [ ] **Step 4: Commit**

```powershell
git add src/RitualsApp.js
git commit -m "feat(billing): use real Linking for legal links"
```

> ✅ **Update PROGRESS.md Phase 1 → Done.**

---

## Phase 2 — Pure billing logic (TDD) + test harness

### Task 2.1: Stand up the Jest test harness

**Files:**
- Modify: `package.json` (add devDeps, `test` script, jest config)
- Create: `jest.setup.js`

- [ ] **Step 1: Install test deps**

Run:
```powershell
npx expo install jest-expo
npm install --save-dev jest @testing-library/react-native react-test-renderer@18.2.0
```
Expected: installs without errors. (`react-test-renderer` must match React `18.2.0`.)

- [ ] **Step 2: Add jest config + script to `package.json`**

Add inside the top-level object:
```json
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest"
  },
  "jest": {
    "preset": "jest-expo",
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-purchases))"
    ]
  }
```

- [ ] **Step 3: Create `jest.setup.js`**

```js
// jest.setup.js — silence the RN animation/native warnings the lifted screens
// trigger under jsdom; we only unit-test pure logic + the flow hook here.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });
```

- [ ] **Step 4: Verify the harness runs (no tests yet)**

Run: `npm test`
Expected: "No tests found" (exit 0 or the standard jest "0 total") — confirms config loads.

- [ ] **Step 5: Commit**

```powershell
git add package.json package-lock.json jest.setup.js
git commit -m "test: add jest-expo harness"
```

### Task 2.2: `formatRenewDate` + `planFromProductId` (TDD)

**Files:**
- Test: `__tests__/billing/format.test.js`
- Create: `src/billing/format.js`

- [ ] **Step 1: Write the failing test**

```js
// __tests__/billing/format.test.js
import { formatRenewDate, planFromProductId } from '../../src/billing/format';

describe('formatRenewDate', () => {
  test('formats an ISO date as "D Mon YYYY"', () => {
    expect(formatRenewDate('2026-06-12T00:00:00.000Z')).toBe('12 Jun 2026');
  });
  test('returns the fallback constant for null/invalid input', () => {
    expect(formatRenewDate(null)).toBe('12 Jun 2026');
    expect(formatRenewDate('not-a-date')).toBe('12 Jun 2026');
  });
});

describe('planFromProductId', () => {
  test('maps yearly/annual product ids to annual', () => {
    expect(planFromProductId('rituals_plus_annual')).toBe('annual');
    expect(planFromProductId('com.app.plus.yearly')).toBe('annual');
  });
  test('maps monthly product ids to monthly', () => {
    expect(planFromProductId('rituals_plus_monthly')).toBe('monthly');
  });
  test('defaults unknown ids to annual', () => {
    expect(planFromProductId('')).toBe('annual');
    expect(planFromProductId(undefined)).toBe('annual');
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npm test -- format`
Expected: FAIL — "Cannot find module '../../src/billing/format'".

- [ ] **Step 3: Implement `src/billing/format.js`**

```js
// src/billing/format.js — pure formatters bridging SDK data to the existing UI
// strings. Falls back to the design constant so the UI never shows a blank.
import { RENEW_DATE } from '../data';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatRenewDate(iso) {
  if (!iso) return RENEW_DATE;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return RENEW_DATE;
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function planFromProductId(productId) {
  const id = String(productId || '').toLowerCase();
  if (id.includes('month')) return 'monthly';
  return 'annual'; // annual/yearly and unknowns default to annual
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `npm test -- format`
Expected: PASS (5 assertions).

- [ ] **Step 5: Commit**

```powershell
git add src/billing/format.js __tests__/billing/format.test.js
git commit -m "feat(billing): add date/plan formatters with tests"
```

### Task 2.3: `mapPurchaseError` (TDD)

**Files:**
- Test: `__tests__/billing/mapError.test.js`
- Create: `src/billing/mapError.js`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run to confirm it fails**

Run: `npm test -- mapError`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/billing/mapError.js`**

```js
// src/billing/mapError.js — pure mapping from a RevenueCat purchase error to one
// of the overlay's RESULT_META kinds. RevenueCat surfaces both a boolean
// `userCancelled` and a string `code` (PurchasesErrorCode); we handle both.
export function mapPurchaseError(e) {
  if (!e) return 'failed';
  if (e.userCancelled === true) return 'cancel';
  const code = String(e.code || '').toUpperCase();
  if (code.includes('CANCEL')) return 'cancel';
  if (code.includes('NETWORK') || code.includes('OFFLINE')) return 'network';
  if (code.includes('ALREADY_PURCHASED') || code.includes('ALREADY_IN_USE')) return 'owned';
  return 'failed';
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `npm test -- mapError`
Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/billing/mapError.js __tests__/billing/mapError.test.js
git commit -m "feat(billing): map RevenueCat errors to overlay kinds with tests"
```

> ✅ **Update PROGRESS.md Phase 2 → Done.**

---

## Phase 3 — Simulation service + refactor `usePurchaseFlow` onto the seam

This is the keystone change. After it, the app behaves exactly as before (sim), but routed through the service interface — so the real SDK can drop in without touching the UI.

### Task 3.1: `simService` (TDD)

**Files:**
- Test: `__tests__/billing/simService.test.js`
- Create: `src/billing/simService.js`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run to confirm it fails**

Run: `npm test -- simService`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/billing/simService.js`**

```js
// src/billing/simService.js — the design simulation, now behind the service
// interface. Preserves the original reviewable timing (1500ms buy / 1300ms
// restore) so the pending overlay is still visible. `delayMs` is injectable so
// tests can run with 0.
import { RENEW_DATE } from '../data';

const FALLBACK_RENEW_ISO = '2026-06-12T00:00:00.000Z'; // matches RENEW_DATE

function ent(plan) {
  return { active: true, willRenew: true, plan, renewISO: FALLBACK_RENEW_ISO, priceString: null };
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// sim = { purchase, restore }; alreadyPlus reflects current member state.
export function createSimService(sim, alreadyPlus, buyDelay = 1500, restoreDelay = 1300) {
  return {
    async buy(plan) {
      await wait(buyDelay);
      const o = (sim && sim.purchase) || 'success';
      if (o === 'success' || o === 'owned') return { kind: o, entitlement: ent(plan) };
      return { kind: o }; // cancel | failed | network — no entitlement
    },
    async restore() {
      await wait(restoreDelay);
      const found = alreadyPlus || (sim && sim.restore) === 'found';
      return found ? { kind: 'restored', entitlement: ent('annual') } : { kind: 'restore-empty' };
    },
    async getEntitlement() {
      return alreadyPlus ? ent('annual') : null;
    },
    async getPrices() {
      return {}; // sim uses the PLUS_PRICES constants in the UI
    },
    renewLabel: RENEW_DATE, // convenience for callers that want the constant
  };
}
```

- [ ] **Step 4: Run to confirm pass**

Run: `npm test -- simService`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```powershell
git add src/billing/simService.js __tests__/billing/simService.test.js
git commit -m "feat(billing): simulation service behind the service interface"
```

### Task 3.2: Refactor `usePurchaseFlow` to drive off the service (TDD)

The hook keeps its `flow` state (`{phase:'pending'|'result', kind, mode}`) and `overlay`, but `buy`/`restore` now `await` the injected service instead of using `setTimeout`+`sim`. `buy` accepts the selected `plan`.

**Files:**
- Test: `__tests__/billing/purchaseFlow.test.js`
- Modify: `src/screens/PlusFlow.js` (the `usePurchaseFlow` function, lines ~136-168). `PurchaseOverlay`, `RESULT_META`, `LegalFooter`, `ManageSubscription`, `CancelSheet` are **unchanged**.

- [ ] **Step 1: Write the failing hook test**

```js
// __tests__/billing/purchaseFlow.test.js
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePurchaseFlow } from '../../src/screens/PlusFlow';

function fakeService(buyResult, restoreResult) {
  return {
    buy: jest.fn(async () => buyResult),
    restore: jest.fn(async () => restoreResult),
    getEntitlement: jest.fn(async () => null),
    getPrices: jest.fn(async () => ({})),
  };
}

describe('usePurchaseFlow', () => {
  test('buy goes pending then shows the result kind', async () => {
    const svc = fakeService({ kind: 'failed' }, { kind: 'restore-empty' });
    const onComplete = jest.fn();
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete }));

    act(() => { result.current.buy('annual'); });
    expect(result.current.flow).toMatchObject({ phase: 'pending', mode: 'buy' });

    await waitFor(() => expect(result.current.flow).toMatchObject({ phase: 'result', kind: 'failed' }));
    expect(svc.buy).toHaveBeenCalledWith('annual');
  });

  test('cancel resolves to a silent dismiss (no flow)', async () => {
    const svc = fakeService({ kind: 'cancel' }, { kind: 'restore-empty' });
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));
    act(() => { result.current.buy('annual'); });
    await waitFor(() => expect(result.current.flow).toBeNull());
  });

  test('restore shows restored on success', async () => {
    const svc = fakeService({ kind: 'success' }, { kind: 'restored' });
    const { result } = renderHook(() => usePurchaseFlow({ service: svc, onComplete: jest.fn() }));
    act(() => { result.current.restore(); });
    expect(result.current.flow).toMatchObject({ phase: 'pending', mode: 'restore' });
    await waitFor(() => expect(result.current.flow).toMatchObject({ phase: 'result', kind: 'restored' }));
  });
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `npm test -- purchaseFlow`
Expected: FAIL — `usePurchaseFlow` still expects `{ sim, alreadyPlus }` and uses timers; `service.buy` is never called / signature mismatch.

- [ ] **Step 3: Replace `usePurchaseFlow` in `src/screens/PlusFlow.js`**

Replace the entire existing `usePurchaseFlow` function (lines ~135-168) with:
```js
// Shared store state machine. Drives its pending→result overlay off an injected
// async PurchaseService (sim in Expo Go, RevenueCat in dev/prod builds). The
// service owns timing/outcomes; this hook owns transient UI state.
export function usePurchaseFlow({ service, platform, onComplete }) {
  const [flow, setFlow] = useState(null);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  const lastEntitlement = useRef(null);

  const run = async (mode, fn) => {
    setFlow({ phase: 'pending', mode });
    let res;
    try {
      res = await fn();
    } catch (e) {
      res = { kind: 'failed' };
    }
    if (!alive.current) return;
    lastEntitlement.current = res.entitlement || null;
    if (res.kind === 'cancel') { setFlow(null); return; }
    setFlow({ phase: 'result', kind: res.kind });
  };

  const buy = (plan) => run('buy', () => service.buy(plan));
  const restore = () => run('restore', () => service.restore());

  const overlay = (
    <PurchaseOverlay
      flow={flow}
      platform={platform}
      onRetry={() => { setFlow(null); buy(lastPlanRef.current); }}
      onDismiss={() => setFlow(null)}
      onComplete={() => { setFlow(null); onComplete(lastEntitlement.current); }}
    />
  );
  return { flow, buy, restore, overlay, reset: () => setFlow(null) };
}
```

Note the `lastPlanRef` for retry: add it just above `run` so "Try again" re-buys the same plan:
```js
  const lastPlanRef = useRef('annual');
```
and set it in `buy`:
```js
  const buy = (plan) => { lastPlanRef.current = plan; return run('buy', () => service.buy(plan)); };
```

- [ ] **Step 4: Update `PurchaseOverlay` platform source**

`PurchaseOverlay` previously read `platform` from `sim.platform`. It now receives `platform` directly (already a prop). No change needed inside `PurchaseOverlay` — confirm its signature is `({ flow, platform, onRetry, onDismiss, onComplete })` (it is). Remove the now-unused `import { ... } from '../data'` only if `PLUS_PRICES`/`RENEW_DATE` are still used elsewhere in the file (they are — keep the import).

- [ ] **Step 5: Run the hook test to confirm pass**

Run: `npm test -- purchaseFlow`
Expected: PASS (3 tests).

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: all billing tests PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/screens/PlusFlow.js __tests__/billing/purchaseFlow.test.js
git commit -m "refactor(billing): drive usePurchaseFlow off injected async service"
```

### Task 3.3: Update `Paywall.js` to pass the service + plan

**Files:**
- Modify: `src/screens/Paywall.js`

- [ ] **Step 1: Change the props + hook call**

Replace the component signature + `usePurchaseFlow` call (lines ~15-23):
```js
export default function Paywall({ insets, platform = 'ios', service, alreadyPlus, onClose, onSubscribe, onLink }) {
  const t = useTheme();
  const c = t.colors;
  const [plan, setPlan] = useState('annual');
  const flow = usePurchaseFlow({
    service,
    platform,
    onComplete: (entitlement) => onSubscribe(plan, entitlement),
  });
```

- [ ] **Step 2: Pass the selected plan into `buy`**

Find the CTA (line ~88):
```js
        <PrimaryButton label="Start 7-day free trial" onPress={flow.buy} />
```
Replace with:
```js
        <PrimaryButton label="Start 7-day free trial" onPress={() => flow.buy(plan)} />
```

- [ ] **Step 3: Confirm it still bundles in Expo Go**

Run: `npx expo start`, open Paywall, tap **Start 7-day free trial**.
Expected: pending spinner ("Confirming with App Store…") then the success card "You're in." (because `DEFAULT_SETTINGS.storePurchase = 'success'`). Tapping **Begin** flips to member and toasts "Welcome to Plus — enjoy." — i.e. identical to before, now via the service. (Requires Task 3.4's wiring to inject the service; do 3.4 before this manual check, or it will error on `service` undefined.)

- [ ] **Step 4: Commit**

```powershell
git add src/screens/Paywall.js
git commit -m "refactor(paywall): consume injected service and pass selected plan"
```

### Task 3.4: Build the service in `RitualsApp.js` and inject it

**Files:**
- Modify: `src/RitualsApp.js`

- [ ] **Step 1: Import the factory** (top of file, after line 27)

```js
import { createPurchaseService } from './billing';
```
> `createPurchaseService` is created in Phase 4 (Task 4.2). For Phase 3, temporarily import the sim directly so 3.x is independently runnable:
> ```js
> import { createSimService } from './billing/simService';
> ```
> Replace with `createPurchaseService` in Task 4.3.

- [ ] **Step 2: Build the service from current sim + member state**

Replace the `sim` definition (lines ~81):
```js
  const sim = { purchase: settings.storePurchase || 'success', restore: settings.storeRestore || 'empty' };
```
with:
```js
  const sim = { purchase: settings.storePurchase || 'success', restore: settings.storeRestore || 'empty' };
  // Phase 3: sim only. Phase 4 swaps this for createPurchaseService({...}).
  const service = useMemo(() => createSimService(sim, plus), [sim.purchase, sim.restore, plus]);
```

- [ ] **Step 3: Update `subscribe` to accept the entitlement**

Replace `subscribe` (lines ~114-120):
```js
  const subscribe = (plan, entitlement) => {
    setPlus(true); setSubCanceled(false);
    if (entitlement && entitlement.plan) setActivePlan(entitlement.plan);
    else if (plan) setActivePlan(plan);
    if (entitlement) setLiveEntitlement(entitlement);
    setPaywall(false);
    setFreezes((f) => f + 3);
    showToast('Welcome to Plus — enjoy.');
  };
```
Add the entitlement state near the other subscription state (after line 78):
```js
  const [liveEntitlement, setLiveEntitlement] = useState(null);
```

- [ ] **Step 4: Pass `service` into the Paywall modal**

Replace the `<Paywall .../>` props (lines ~256-257):
```js
            <Paywall insets={insets} platform={PLATFORM} service={service} alreadyPlus={plus}
              onClose={() => setPaywall(false)} onSubscribe={subscribe} onLink={openLink} />
```

- [ ] **Step 5: Verify the full purchase happy-path in Expo Go**

Run: `npx expo start`. Onboarding → "Maybe later" → You tab → tap Plus banner → Paywall → Start trial → success card → Begin.
Expected: returns to app as a member; You/Shop Plus banner now shows "Manage ›". Toggle `DEFAULT_SETTINGS.storePurchase` to `'failed'` / `'network'` / `'cancel'` / `'owned'` in `theme.js` and re-check each state renders.

- [ ] **Step 6: Commit**

```powershell
git add src/RitualsApp.js
git commit -m "refactor(app): inject purchase service and capture entitlement on subscribe"
```

> ✅ **Update PROGRESS.md Phase 3 → Done.** The app is now fully on the service seam, still simulated.

---

## Phase 4 — RevenueCat service + provider selection

### Task 4.1: Add the SDK + Expo config plugin + dev client

**Files:**
- Modify: `package.json` (deps), replace `app.json` → `app.config.js`
- Create: `.env.example`

- [ ] **Step 1: Install**

Run:
```powershell
npx expo install react-native-purchases expo-dev-client expo-constants
```
Expected: installs `react-native-purchases` (v8.x) compatible with Expo 51.

- [ ] **Step 2: Convert `app.json` to `app.config.js`** (so keys come from env)

Create `app.config.js`:
```js
// app.config.js — dynamic config so RevenueCat keys + URLs come from env.
// Keys are publishable but kept out of source. `.env` is git-ignored.
export default {
  expo: {
    name: 'Daily Rituals',
    slug: 'daily-rituals',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    splash: { backgroundColor: '#f9f7f4' },
    ios: { supportsTablet: false, bundleIdentifier: 'app.dailyrituals.mobile' },
    android: {
      adaptiveIcon: { backgroundColor: '#f9f7f4' },
      package: 'app.dailyrituals.mobile',
    },
    plugins: ['expo-dev-client', 'react-native-purchases'],
    extra: {
      rcIosKey: process.env.RC_IOS_KEY || '',
      rcAndroidKey: process.env.RC_ANDROID_KEY || '',
      termsUrl: process.env.TERMS_URL || '',
      privacyUrl: process.env.PRIVACY_URL || '',
    },
  },
};
```
Then delete `app.json`:
```powershell
Remove-Item e:\rsphoenix02\dailyrituals\app.json
```

- [ ] **Step 3: Create `.env.example`**

```
# RevenueCat publishable SDK keys (RevenueCat dashboard → Project → API keys)
RC_IOS_KEY=
RC_ANDROID_KEY=
# Real legal URLs (leave blank to use the in-app placeholders)
TERMS_URL=
PRIVACY_URL=
```

- [ ] **Step 4: Confirm config resolves**

Run: `npx expo config --type public`
Expected: prints JSON including `extra.rcIosKey` (empty string when no `.env`). No errors.

- [ ] **Step 5: Commit**

```powershell
git add package.json package-lock.json app.config.js .env.example
git rm app.json
git commit -m "build(billing): add RevenueCat SDK, dev client, dynamic config"
```

### Task 4.2: Implement `revenueCatService`

**Files:**
- Create: `src/billing/revenueCatService.js`

- [ ] **Step 1: Write the service**

```js
// src/billing/revenueCatService.js — real RevenueCat implementation of the
// PurchaseService interface. Resolves the same `kind` strings the overlay uses.
import Purchases from 'react-native-purchases';
import { ENTITLEMENT_ID } from './config';
import { formatRenewDate, planFromProductId } from './format';
import { mapPurchaseError } from './mapError';

// Build the UI Entitlement from a RevenueCat CustomerInfo object.
function toEntitlement(customerInfo) {
  const ent = customerInfo && customerInfo.entitlements
    && customerInfo.entitlements.active && customerInfo.entitlements.active[ENTITLEMENT_ID];
  if (!ent) return null;
  return {
    active: true,
    willRenew: ent.willRenew !== false,
    plan: planFromProductId(ent.productIdentifier),
    renewISO: ent.expirationDate || null,
    priceString: null, // price comes from offerings (getPrices), not the entitlement
  };
}

async function findPackage(plan) {
  const offerings = await Purchases.getOfferings();
  const current = offerings && offerings.current;
  if (!current) return null;
  // Prefer RevenueCat's standard package types; fall back to id matching.
  if (plan === 'annual') return current.annual || current.availablePackages.find((p) => /annual|year/i.test(p.identifier));
  return current.monthly || current.availablePackages.find((p) => /month/i.test(p.identifier));
}

export function createRevenueCatService() {
  return {
    async buy(plan) {
      try {
        const pkg = await findPackage(plan);
        if (!pkg) return { kind: 'failed' };
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const entitlement = toEntitlement(customerInfo);
        return entitlement
          ? { kind: 'success', entitlement }
          : { kind: 'failed' };
      } catch (e) {
        const kind = mapPurchaseError(e);
        if (kind === 'owned') {
          const info = await Purchases.getCustomerInfo().catch(() => null);
          return { kind: 'owned', entitlement: toEntitlement(info) || undefined };
        }
        return { kind };
      }
    },
    async restore() {
      try {
        const customerInfo = await Purchases.restorePurchases();
        const entitlement = toEntitlement(customerInfo);
        return entitlement ? { kind: 'restored', entitlement } : { kind: 'restore-empty' };
      } catch (e) {
        const kind = mapPurchaseError(e);
        return { kind: kind === 'owned' ? 'restored' : kind === 'network' ? 'network' : 'restore-empty' };
      }
    },
    async getEntitlement() {
      const info = await Purchases.getCustomerInfo().catch(() => null);
      return toEntitlement(info);
    },
    async getPrices() {
      try {
        const offerings = await Purchases.getOfferings();
        const current = offerings && offerings.current;
        if (!current) return {};
        const out = {};
        if (current.annual) out.annual = { priceString: current.annual.product.priceString };
        if (current.monthly) out.monthly = { priceString: current.monthly.product.priceString };
        return out;
      } catch (e) {
        return {};
      }
    },
  };
}

export { formatRenewDate };
```

- [ ] **Step 2: Commit**

```powershell
git add src/billing/revenueCatService.js
git commit -m "feat(billing): RevenueCat purchase service implementation"
```

### Task 4.3: Provider selection (`index.js`) + initialization

**Files:**
- Create: `src/billing/index.js`
- Modify: `src/RitualsApp.js` (swap `createSimService` → `createPurchaseService`)
- Modify: `App.js` (configure RevenueCat once at startup, guarded)

- [ ] **Step 1: Write `src/billing/index.js`**

```js
// src/billing/index.js — choose the real service when RevenueCat is configured
// AND the native module is present (a dev/prod build); otherwise fall back to the
// simulation so Expo Go stays fully reviewable.
import { createSimService } from './simService';
import { hasKeyFor } from './config';

let _rcModuleOk = false;
try {
  // Presence check only — importing is safe; it throws/no-ops in Expo Go.
  require.resolve('react-native-purchases');
  _rcModuleOk = true;
} catch (e) {
  _rcModuleOk = false;
}

export function isBillingConfigured(platform) {
  return _rcModuleOk && hasKeyFor(platform);
}

export function createPurchaseService({ sim, alreadyPlus, platform }) {
  if (isBillingConfigured(platform)) {
    // Lazy require so Expo Go never evaluates native code.
    const { createRevenueCatService } = require('./revenueCatService');
    return createRevenueCatService();
  }
  return createSimService(sim, alreadyPlus);
}
```

- [ ] **Step 2: Configure RevenueCat at startup in `App.js`**

Add near the top of `App.js` (after imports):
```js
import { Platform } from 'react-native';
import { RC_KEYS } from './src/billing/config';
import { isBillingConfigured } from './src/billing';
```
Inside `export default function App()`, before the `return`, add a one-time configure effect:
```js
  React.useEffect(() => {
    const platform = Platform.OS === 'android' ? 'android' : 'ios';
    if (!isBillingConfigured(platform)) return; // Expo Go / no key → simulation
    const Purchases = require('react-native-purchases').default;
    Purchases.configure({ apiKey: platform === 'android' ? RC_KEYS.android : RC_KEYS.ios });
  }, []);
```

- [ ] **Step 3: Swap the factory in `RitualsApp.js`**

Change the Phase-3 import:
```js
import { createSimService } from './billing/simService';
```
to:
```js
import { createPurchaseService } from './billing';
```
and the service memo:
```js
  const service = useMemo(
    () => createPurchaseService({ sim, alreadyPlus: plus, platform: PLATFORM }),
    [sim.purchase, sim.restore, plus]
  );
```

- [ ] **Step 4: Verify Expo Go still works (fallback path)**

Run: `npx expo start` (Expo Go). With no `.env`, `isBillingConfigured` is false → sim path.
Expected: purchase flow behaves exactly as Phase 3 (success card, etc.). No native crash.

- [ ] **Step 5: Run the test suite**

Run: `npm test`
Expected: all PASS (the require-guard in `index.js` is exercised under jest; `react-native-purchases` is in `transformIgnorePatterns`).

- [ ] **Step 6: Commit**

```powershell
git add src/billing/index.js App.js src/RitualsApp.js
git commit -m "feat(billing): select RevenueCat vs sim and configure SDK at startup"
```

> ✅ **Update PROGRESS.md Phase 4 → Done.** Real SDK is wired but inactive until keys + a dev build exist (Phase 6).

---

## Phase 5 — Live entitlement drives renewal date / plan / price + cancel reflects willRenew

### Task 5.1: Source RENEW_DATE / plan / price from the live entitlement

**Files:**
- Modify: `src/RitualsApp.js` (the `ManageSubscription` props, lines ~263-271) and the manage/cancel handlers.
- Modify: `src/screens/PlusFlow.js` `ManageSubscription` to accept an optional `renewLabel` + `priceString` override (fallback to constants).

- [ ] **Step 1: Add optional live overrides to `ManageSubscription`**

In `src/screens/PlusFlow.js`, change the signature:
```js
export function ManageSubscription({ insets, platform, plan, canceled, renewLabel, priceString, onClose, onChangePlan, onRestore, onCancel, onResume, onLink }) {
```
Add a local fallback right after `const p = PLUS_PRICES[plan] || PLUS_PRICES.annual;`:
```js
  const renew = renewLabel || RENEW_DATE;
  const priceText = priceString || p.price;
```
Then replace every `RENEW_DATE` usage *inside this component* with `renew`, and the status/plan-detail `p.price` with `priceText`. Specifically:
- status sub line (line ~209): `${p.label} · renews ${renew}` and `Ends ${renew} · access until then`
- plan detail (line ~224): `{priceText} {p.per} · {p.sub.toLowerCase()}`
- footer note (lines ~249-250): use `${renew}`

- [ ] **Step 2: Compute live values in `RitualsApp.js`**

Add near the other derived values (after `liveEntitlement` state):
```js
  const renewLabel = liveEntitlement ? formatRenewDate(liveEntitlement.renewISO) : RENEW_DATE;
  const livePlan = liveEntitlement ? liveEntitlement.plan : activePlan;
  const livePrice = liveEntitlement ? liveEntitlement.priceString : null;
```
Import the formatter (top of file):
```js
import { formatRenewDate } from './billing/format';
```

- [ ] **Step 3: Pass them into the Manage modal**

Update `<ManageSubscription .../>` (lines ~263-271):
```js
            <ManageSubscription
              insets={insets} platform={PLATFORM} plan={livePlan} canceled={subCanceled}
              renewLabel={renewLabel} priceString={livePrice}
              onClose={() => setManageOpen(false)}
              onChangePlan={() => { setManageOpen(false); setPaywall(true); }}
              onRestore={() => doRestore()}
              onCancel={() => doCancel()}
              onResume={() => doResume()}
              onLink={openLink}
            />
```
(`doRestore`/`doCancel`/`doResume` are defined in Task 5.2.)

- [ ] **Step 4: Verify in Expo Go (constants fallback path)**

Run: `npx expo start`, become a member, open Manage from the You banner.
Expected: shows "Annual · renews 12 Jun 2026", "$29.99 per year" — identical to reference (live values are null → fallback).

- [ ] **Step 5: Commit**

```powershell
git add src/screens/PlusFlow.js src/RitualsApp.js
git commit -m "feat(billing): source renewal/plan/price from live entitlement with fallback"
```

### Task 5.2: Cancel / restore / resume reflect real subscription state

In production, cancellation happens in the OS settings (we deep-link there), and the app should reflect `willRenew` by re-reading the entitlement when it regains focus. Restore re-runs the SDK restore.

**Files:**
- Modify: `src/RitualsApp.js`

- [ ] **Step 1: Add the handlers**

Add after `subscribe`:
```js
  // Cancel: route to the OS subscription settings (Apple/Google own cancellation),
  // then optimistically mark ending. A focus-refresh (Step 3) corrects from truth.
  const doCancel = async () => {
    await openExternal('manage', PLATFORM);
    setSubCanceled(true);
    showToast('Manage your subscription in ' + (PLATFORM === 'android' ? 'Google Play' : 'the App Store'));
  };
  const doResume = async () => {
    await openExternal('manage', PLATFORM);
    showToast('Resume your subscription in ' + (PLATFORM === 'android' ? 'Google Play' : 'the App Store'));
  };
  const doRestore = async () => {
    const res = await service.restore();
    if (res.kind === 'restored') {
      setPlus(true);
      if (res.entitlement) { setLiveEntitlement(res.entitlement); setActivePlan(res.entitlement.plan); setSubCanceled(res.entitlement.willRenew === false); }
      showToast('Your subscription is active');
    } else {
      showToast('Nothing to restore');
    }
  };
```

- [ ] **Step 2: Refresh entitlement when the app returns to foreground**

Add an effect (needs `AppState` from `react-native` — extend the existing import on line 9 to include `AppState`):
```js
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', async (s) => {
      if (s !== 'active' || !plus) return;
      const ent = await service.getEntitlement();
      if (!ent) return;
      setLiveEntitlement(ent);
      setSubCanceled(ent.willRenew === false);
      setActivePlan(ent.plan);
    });
    return () => sub.remove();
  }, [plus, service]);
```

- [ ] **Step 3: Verify in Expo Go (sim getEntitlement is null → no-op)**

Run: `npx expo start`. Become a member → Manage → Cancel subscription → confirm sheet → "Open App Store settings".
Expected: the OS subscription URL opens in the browser; returning to the app, status shows "ENDING" (optimistic). "Resume Plus" appears. In sim, `getEntitlement` returns null so the optimistic state stays — acceptable for review. With real billing, the focus-refresh corrects it.

- [ ] **Step 4: Commit**

```powershell
git add src/RitualsApp.js
git commit -m "feat(billing): deep-link cancel/resume and refresh entitlement on foreground"
```

### Task 5.3: Onboarding routes through the same service

**Files:**
- Modify: `src/screens/Onboarding.js` (it builds its own `sim` and renders `Paywall`).

- [ ] **Step 1: Replace Onboarding's `sim` + Paywall props**

In `src/screens/Onboarding.js`, replace the `sim` line (line ~36):
```js
  const sim = { purchase: settings.storePurchase || 'success', restore: settings.storeRestore || 'empty' };
```
with a service built from the same factory (add import at top: `import { createPurchaseService } from '../billing';` and `import { Platform } from 'react-native';` already present):
```js
  const service = createPurchaseService({
    sim: { purchase: settings.storePurchase || 'success', restore: settings.storeRestore || 'empty' },
    alreadyPlus: false,
    platform: OB_PLATFORM,
  });
```
Then find where `<Paywall ... sim={sim} .../>` is rendered in this file and change `sim={sim}` to `service={service}`, and ensure `onSubscribe` accepts `(plan, entitlement)` and calls `onDone(true)` (member). If the existing handler is `onSubscribe={() => { setPayOpen(false); onDone(true); }}`, leave it — the extra args are ignored.

- [ ] **Step 2: Verify onboarding purchase in Expo Go**

Run: `npx expo start`. On first run, go to the Premium step → "See Plus & start free trial" → Paywall → Start trial → success → Begin.
Expected: enters the app as a member (`initialPlus` true). Plus banner shows "Manage ›".

- [ ] **Step 3: Commit**

```powershell
git add src/screens/Onboarding.js
git commit -m "feat(billing): route onboarding paywall through the shared service"
```

> ✅ **Update PROGRESS.md Phase 5 → Done.**

---

## Phase 6 — Dev client build + real-billing verification (Android-first on Windows)

> iOS dev builds require a Mac or EAS (out of current scope) — mark iOS verification "blocked: needs Mac/EAS" in PROGRESS.md. Do the real-billing pass on Android.

### Task 6.1: RevenueCat dashboard + store products (manual, documented)

**Files:** none (external setup). Record the IDs you create in PROGRESS.md "Config you must supply".

- [ ] **Step 1:** In RevenueCat, create a project, an **entitlement** with identifier exactly `plus` (matches `ENTITLEMENT_ID`), and an **offering** (`current`) with an **Annual** and **Monthly** package.
- [ ] **Step 2:** Create the matching subscription products in Google Play Console (and App Store Connect when iOS is in scope). Attach them to the RevenueCat packages.
- [ ] **Step 3:** Copy the **Android publishable key** into `.env` as `RC_ANDROID_KEY` (create `.env` from `.env.example`). Set `TERMS_URL` / `PRIVACY_URL` to the real pages.
- [ ] **Step 4:** Add a **license tester** in Play Console so purchases don't charge real money.

### Task 6.2: Build and run an Android dev client

**Files:** none.

- [ ] **Step 1: Build the dev client**

If a local Android toolchain is set up:
Run: `npx expo run:android`
Expected: builds a custom dev client APK with the RevenueCat native module and installs it on a connected device/emulator (Google account signed in for billing).

(If no local Android SDK, use `npx eas build --profile development --platform android` — note this needs an Expo account; record as the chosen path in PROGRESS.md.)

- [ ] **Step 2: Confirm real billing activates**

Open the app in the **dev client** (not Expo Go). With `RC_ANDROID_KEY` set, `isBillingConfigured('android')` is true → RevenueCat path.
Expected: the Paywall plan prices come from `getPrices()` (live Play prices), and "Start 7-day free trial" opens the **real Google Play purchase sheet**.

- [ ] **Step 3: Walk every state with a license tester**
  - [ ] Purchase success → "You're in." → Begin → member.
  - [ ] Cancel the Play sheet → silent dismiss (no card).
  - [ ] Airplane mode → "No connection."
  - [ ] Already-owned (buy again on an owned account) → "You already have Plus."
  - [ ] Restore on a fresh install of the same account → "Plus restored."
  - [ ] Restore on an account with no purchase → "Nothing to restore."
  - [ ] Manage → Cancel → opens Play subscription settings; after cancelling there and returning, status flips to "ENDING" (willRenew false via focus-refresh).

- [ ] **Step 4: Commit any config tweaks** (e.g. eas.json if used)

```powershell
git add eas.json
git commit -m "build: add EAS development profile for Android dev client"
```

> ✅ **Update PROGRESS.md Phase 6 → Done (Android) / iOS blocked.**

---

## Phase 7 — Final verification + docs

### Task 7.1: Full self-check against the handoff spec

**Files:** none (review). Then a docs touch-up.

- [ ] **Step 1: Re-read `design_handoff_plus_compliance/README.md` "Store integration"** and confirm each bullet is satisfied: buy/restore wired, error→kind mapping, deep-links for change-plan/store-settings, renewal/plan/price from entitlement, real Terms/Privacy.
- [ ] **Step 2: Run the whole suite**

Run: `npm test`
Expected: all PASS.

- [ ] **Step 3: Confirm Expo Go still boots and reviews every state** (sim path) and the dev client does real billing (Android).

- [ ] **Step 4: Write a short `README.md` at root** describing: run in Expo Go (sim), run dev client (real billing), where billing lives (`src/billing/`), and the env keys required. Commit.

```powershell
git add README.md
git commit -m "docs: project readme for run + billing wiring"
```

> ✅ **Update PROGRESS.md Phase 7 → Done. Project complete for the agreed scope.**

---

## Self-Review (performed against the handoff spec)

**Spec coverage:**
- One purchase surface (onboarding → real Paywall): Task 5.3. ✓
- Manage/cancel reachable from You & Shop banners: lifted verbatim (Phase 0); deep-link + state in Tasks 5.1-5.2. ✓
- Purchase-state UX (all 7 kinds + silent cancel): preserved via unchanged `RESULT_META`/`PurchaseOverlay`; driven by service (Phase 3) and real SDK (Phase 4/6). ✓
- Compliant legal footer + platform wording: lifted verbatim; real links Task 1.2-1.3. ✓
- Replace `buy()`/`restore()` with RevenueCat + error mapping: Tasks 2.3, 4.2. ✓
- Deep-link change-plan/store-settings: Task 1.2 (links), 5.2 (cancel/resume); change-plan opens the paywall (RevenueCat upgrade/crossgrade) per reference behavior — documented alternative. ✓
- Source RENEW_DATE/plan/price from entitlement: Task 5.1. ✓
- Real Terms/Privacy URLs: config + env (Task 1.1, 4.1, 6.1). ✓

**Placeholder scan:** No "TBD"/"add error handling" placeholders — every code step has full code. Legal/SDK URLs and keys are intentionally env-sourced placeholders (the one thing the user must supply; tracked in PROGRESS.md). ✓

**Type/name consistency:** `PurchaseService` methods (`buy`/`restore`/`getEntitlement`/`getPrices`), `Entitlement` fields (`active`/`willRenew`/`plan`/`renewISO`/`priceString`), and `kind` values are used identically across `simService`, `revenueCatService`, `usePurchaseFlow`, `Paywall`, and `RitualsApp`. `createPurchaseService({sim, alreadyPlus, platform})` signature matches every call site. ✓

---

## Execution Handoff

This plan is intended to be executed by Sonnet across multiple sessions. Each session should:
1. Open `PROGRESS.md`, find the first unchecked phase/task.
2. Execute its bite-sized steps in order, committing as specified.
3. Update `PROGRESS.md` at the phase boundary before ending the session.

Recommended: **superpowers:subagent-driven-development** (fresh subagent per task with review between) or **superpowers:executing-plans** (inline batch with checkpoints).

---
---

# PART II — Beyond the original scope (Phases 8–11, added 2026-06-04)

> **Read this first.** Phases 0–7 are **complete** (the lift + RevenueCat billing, dev-only, in-memory state). Part II deliberately steps past the original **Locked decisions** ("dev only", "all state in-memory"). Each phase below lists the **decisions to confirm with the owner before starting** — do not begin a Part II phase until its decisions are answered, because they change what you build (bundle id, real domains, store accounts, persistence engine).
>
> **Recommended order:** 8 → 9 → 10 → 11. Rationale: 8 is a free correctness pass; 9 (persistence) must land **before** 10 because shipping an app that loses data on restart is not acceptable for real users; 11 (iOS) is last because it needs a Mac or paid EAS macOS builds.
>
> Same rules as Part I: one task per chat where possible, commit per task with the exact message, update `PROGRESS.md` at every phase boundary.

---

## Phase 8 — Runtime verification closeout (no new production code)

Closes the three manual-verification checkboxes deferred across Phases 3, 4, and 6. This is a **read-only runtime walk** in Expo Go (plus the existing Android dev client from Phase 6). If any state renders wrong, **STOP and record it in PROGRESS.md "Open items / blockers"** — do not fix inline; a broken state becomes its own follow-up task so the verification stays honest.

> **Decisions to confirm:** none. This phase invents nothing.

### Task 8.1: Walk every sim purchase/restore state in Expo Go

**Files:** none. You will temporarily edit `src/theme.js` `DEFAULT_SETTINGS` to drive each outcome, then revert.

- [ ] **Step 1: Start Expo Go**

Run: `npx expo start`. Open in Expo Go (no `.env` → `isBillingConfigured` is false → sim path).

- [ ] **Step 2: Drive each purchase outcome.** For each value below, set `DEFAULT_SETTINGS.storePurchase` in `src/theme.js`, reload, open the Paywall (You tab → Plus banner, or Onboarding → Premium), tap **Start 7-day free trial**, and confirm the overlay:
  - [ ] `success` → pending "Confirming…" then **"You're in."** → Begin → becomes member.
  - [ ] `cancel` → silent dismiss, **no** result card.
  - [ ] `failed` → **"Something went wrong."** with Try again.
  - [ ] `network` → **"No connection."**
  - [ ] `owned` → **"You already have Plus."**

- [ ] **Step 3: Drive each restore outcome.** Set `DEFAULT_SETTINGS.storeRestore`, reload, open Paywall → **Restore purchases**:
  - [ ] `found` → **"Plus restored."**
  - [ ] `empty` → **"Nothing to restore."**

- [ ] **Step 4: Revert `theme.js`** back to its committed defaults (`storePurchase: 'success'`, `storeRestore: 'empty'`). Confirm `git diff src/theme.js` is empty.

### Task 8.2: Confirm Expo Go sim fallback never crashes

- [ ] **Step 1:** With no `.env` present, open the app cold in Expo Go and exercise a purchase. Expected: the sim path runs end-to-end with **no red screen** and no "native module RNPurchases not found" error (the lazy require-guard in `src/billing/index.js` must hold).

### Task 8.3: Record the verification and tick the deferred boxes

**Files:** `PROGRESS.md` only (no code commit).

- [ ] **Step 1:** In `PROGRESS.md`, tick Phase 3 "Verify all 6 sim states…" and Phase 4 "Verify Expo Go still falls back to sim…". Add a dated Last session note listing pass/fail per state.
- [ ] **Step 2: Commit**

```powershell
git add PROGRESS.md
git commit -m "docs: record Phase 8 runtime verification of sim states + fallback"
```

> ✅ **Update PROGRESS.md Phase 8 → Done.** No production code changed; the deferred boxes are now closed with evidence.

---

## Phase 9 — Local persistence (state survives app restart) via AsyncStorage

The original scope kept **all non-billing state in-memory** (a deliberate v1 cut). This phase makes entries, streak, XP, quests, freezes, embers, owned cosmetics, and settings durable across restarts so the app behaves like a real product. Billing truth is **not** persisted as source-of-truth — it is re-derived from the RevenueCat SDK on launch (a cached mirror of `plus`/`activePlan`/`subCanceled` is persisted only for instant first paint).

> **Decisions to confirm before starting:**
> 1. **Engine:** ✅ **CONFIRMED 2026-06-04 — AsyncStorage** (`@react-native-async-storage/async-storage`). The entire app state is a few KB of JSON loaded once at launch; SQLite/MMKV were considered and rejected as overkill (no lazy queries, no large dataset). Revisit only if entries gain full-text search or pagination later.
> 2. **Reset affordance:** add a "Reset app data" row in the You/Settings screen? (recommended — invaluable for testing and a real user feature). Steps include it as optional Task 9.6.
> 3. **First-run seed:** keep the existing `SAMPLE_ENTRIES` / starting embers etc. as the seed for a fresh install? (recommended yes — preserves the current demo-friendly first run.)

**Architecture:** a **pure, tested** persistence core (versioned schema + migration + validation, all immutable) is separated from a thin async **storage adapter** (the only file that touches AsyncStorage). `App.js` hydrates once on mount behind a loading gate, passes the persisted slice into `RitualsApp` as `initialState`, and a single **debounced autosave** effect writes changes back. No screen logic changes.

### Persistent state inventory (the exact slice to round-trip)

From `src/RitualsApp.js`: `entries, streak, xp, done, quests, freezes, embers, plus, activePalette, ownedPalettes, activeSky, ownedSkies, subCanceled, activePlan`, plus `lastActiveDay` (new, for daily reset). From `App.js`: the full `settings` object. **Excluded:** `liveEntitlement` (re-fetched from the SDK), all transient UI flags (`tab, writing, reading, celebrate, paywall, manageOpen, toast, …`).

### Task 9.1: Install AsyncStorage

- [ ] **Step 1:** Run `npx expo install @react-native-async-storage/async-storage`
- [ ] **Step 2: Commit**

```powershell
git add package.json package-lock.json
git commit -m "build(persist): add AsyncStorage dependency"
```

### Task 9.2: Pure persistence core (TDD)

**Files:**
- Test: `__tests__/persistence/state.test.js`
- Create: `src/persistence/state.js`

- [ ] **Step 1: Write the failing test**

```js
// __tests__/persistence/state.test.js
import { SCHEMA_VERSION, serialize, deserialize, mergeWithDefaults } from '../../src/persistence/state';

const sample = { version: SCHEMA_VERSION, embers: 360, streak: 4, ownedSkies: ['classic'] };

describe('serialize/deserialize round-trip', () => {
  test('serialize tags the current schema version', () => {
    const out = JSON.parse(serialize({ embers: 10 }));
    expect(out.version).toBe(SCHEMA_VERSION);
    expect(out.embers).toBe(10);
  });
  test('deserialize returns null for empty/garbage input', () => {
    expect(deserialize(null)).toBeNull();
    expect(deserialize('not json')).toBeNull();
  });
  test('deserialize drops a payload from an unknown future version', () => {
    expect(deserialize(JSON.stringify({ version: 9999, embers: 1 }))).toBeNull();
  });
  test('round-trips a valid payload', () => {
    expect(deserialize(serialize(sample))).toMatchObject({ embers: 360, streak: 4 });
  });
});

describe('mergeWithDefaults', () => {
  test('fills missing keys from defaults but keeps loaded values', () => {
    const merged = mergeWithDefaults({ embers: 999 }, { embers: 360, streak: 4 });
    expect(merged).toMatchObject({ embers: 999, streak: 4 });
  });
  test('null loaded yields the defaults unchanged (immutably)', () => {
    const defaults = { embers: 360 };
    const merged = mergeWithDefaults(null, defaults);
    expect(merged).toEqual(defaults);
    expect(merged).not.toBe(defaults);
  });
});
```

- [ ] **Step 2:** Run `npm test -- persistence/state` → FAIL (module missing).

- [ ] **Step 3: Implement `src/persistence/state.js`**

```js
// src/persistence/state.js — pure, storage-agnostic persistence core. The only
// file that knows the schema shape + version. No I/O here (testable in jsdom).
// All operations are immutable.

export const SCHEMA_VERSION = 1;

// The exact slice of app state we persist. Transient UI flags are never included.
export const PERSISTED_KEYS = [
  'entries', 'streak', 'xp', 'done', 'quests', 'freezes', 'embers',
  'plus', 'activePalette', 'ownedPalettes', 'activeSky', 'ownedSkies',
  'subCanceled', 'activePlan', 'lastActiveDay', 'settings',
];

// Pick only the persisted keys from a larger state object (immutable copy).
export function pickPersisted(state) {
  const out = {};
  for (const k of PERSISTED_KEYS) if (state[k] !== undefined) out[k] = state[k];
  return out;
}

export function serialize(slice) {
  return JSON.stringify({ version: SCHEMA_VERSION, ...slice });
}

// Returns a plain object (sans `version`) or null if absent/corrupt/incompatible.
export function deserialize(raw) {
  if (!raw) return null;
  let parsed;
  try { parsed = JSON.parse(raw); } catch (e) { return null; }
  if (!parsed || typeof parsed !== 'object') return null;
  const migrated = migrate(parsed);
  if (!migrated) return null;
  const { version, ...rest } = migrated;
  return rest;
}

// Forward-migrate older payloads to SCHEMA_VERSION. Unknown/newer → drop (null).
function migrate(parsed) {
  let v = parsed.version || 0;
  let data = parsed;
  if (v > SCHEMA_VERSION) return null; // a newer build wrote this; don't guess
  // while (v < SCHEMA_VERSION) { data = migrators[v](data); v += 1; }
  return { ...data, version: SCHEMA_VERSION };
}

// Shallow-merge loaded over defaults (defaults supply any missing key). Immutable.
export function mergeWithDefaults(loaded, defaults) {
  return { ...defaults, ...(loaded || {}) };
}
```

- [ ] **Step 4:** Run `npm test -- persistence/state` → PASS.
- [ ] **Step 5: Commit**

```powershell
git add src/persistence/state.js __tests__/persistence/state.test.js
git commit -m "feat(persist): versioned, immutable persistence core with tests"
```

### Task 9.3: Storage adapter (the only AsyncStorage I/O)

**Files:** Create `src/persistence/storage.js`

- [ ] **Step 1: Write it**

```js
// src/persistence/storage.js — thin async adapter over AsyncStorage. The ONLY
// module that performs persistence I/O. Errors are surfaced (warned) and degrade
// to a clean in-memory start, never a crash.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { serialize, deserialize } from './state';

const KEY = 'dailyrituals:v1:state';

export async function loadState() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return deserialize(raw); // null on miss/corrupt → caller uses defaults
  } catch (e) {
    console.warn('loadState failed; starting fresh', e);
    return null;
  }
}

export async function saveState(slice) {
  try {
    await AsyncStorage.setItem(KEY, serialize(slice));
    return true;
  } catch (e) {
    console.warn('saveState failed', e);
    return false;
  }
}

export async function clearState() {
  try { await AsyncStorage.removeItem(KEY); return true; }
  catch (e) { console.warn('clearState failed', e); return false; }
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/persistence/storage.js
git commit -m "feat(persist): AsyncStorage adapter (load/save/clear)"
```

### Task 9.4: Hydrate on startup in `App.js` (loading gate)

**Files:** Modify `App.js`.

- [ ] **Step 1:** On mount, `loadState()`; until it resolves, render the existing splash/null (do **not** flash default state then overwrite). After it resolves, hold the loaded slice in state and pass it into `RitualsApp` as `initialState={...}` and seed `settings` from `loaded.settings` (fall back to the current `DEFAULT_SETTINGS`). Pattern:

```js
const [hydrated, setHydrated] = React.useState(null); // null = still loading
React.useEffect(() => { loadState().then((s) => setHydrated(s || {})); }, []);
if (hydrated === null) return null; // or the existing splash component
// ...seed settings: useState(hydrated.settings || DEFAULT_SETTINGS)
// ...render: <RitualsApp initialState={hydrated} ... />
```

- [ ] **Step 2: Commit**

```powershell
git add App.js
git commit -m "feat(persist): hydrate persisted state on startup behind a loading gate"
```

### Task 9.5: Seed `RitualsApp` from `initialState` + debounced autosave

**Files:** Modify `src/RitualsApp.js`.

- [ ] **Step 1: Seed each persistent `useState` from `initialState`.** Add `initialState = {}` to the component props, then change each persistent atom's initializer to read it, e.g.:

```js
export default function RitualsApp({ mode = 'day', settings, setSettings, onToggleMode, initialPlus = false, initialState = {} }) {
  const [entries, setEntries] = useState(initialState.entries ?? SAMPLE_ENTRIES);
  const [streak,  setStreak]  = useState(initialState.streak  ?? 4);
  const [xp,      setXp]      = useState(initialState.xp      ?? 320);
  const [embers,  setEmbers]  = useState(initialState.embers  ?? 360);
  const [plus,    setPlus]    = useState(initialState.plus    ?? initialPlus);
  // …apply the same `initialState.X ?? <current default>` to: done, quests,
  //   freezes, activePalette, ownedPalettes, activeSky, ownedSkies,
  //   subCanceled, activePlan. (liveEntitlement stays null — SDK re-fetches it.)
```

- [ ] **Step 2: Add a debounced autosave effect** (write the persisted slice ~400ms after any change settles, so rapid updates coalesce):

```js
const persistData = { entries, streak, xp, done, quests, freezes, embers, plus,
  activePalette, ownedPalettes, activeSky, ownedSkies, subCanceled, activePlan,
  lastActiveDay, settings };
React.useEffect(() => {
  const id = setTimeout(() => { saveState(pickPersisted(persistData)); }, 400);
  return () => clearTimeout(id);
}, [entries, streak, xp, done, quests, freezes, embers, plus, activePalette,
    ownedPalettes, activeSky, ownedSkies, subCanceled, activePlan, lastActiveDay, settings]);
```

Add imports: `import { saveState } from './persistence/storage';` and `import { pickPersisted } from './persistence/state';`.

- [ ] **Step 3: Daily reset.** Add `lastActiveDay` (seed `initialState.lastActiveDay ?? todayKey()`). On mount, if `lastActiveDay !== todayKey()`, reset `done → false`, reset each daily quest `cur → 0`, and set `lastActiveDay = todayKey()`. (`todayKey()` = `new Date().toISOString().slice(0,10)`.) This prevents a stale "completed today" surviving overnight.

- [ ] **Step 4: Commit**

```powershell
git add src/RitualsApp.js
git commit -m "feat(persist): seed app state from storage and autosave on change"
```

### Task 9.6 (optional): "Reset app data" affordance

**Files:** `src/screens/YouScreen.js` (+ a handler in `RitualsApp.js`).

- [ ] **Step 1:** Add a destructive "Reset app data" row that confirms, calls `clearState()`, and reloads to a fresh first-run seed. Guard with a confirm dialog. Commit `feat(persist): add reset-app-data control`.

### Task 9.7: Verify persistence end-to-end

- [ ] **Step 1:** `npm test` → all green (new persistence tests included).
- [ ] **Step 2:** In Expo Go: write an entry / spend embers / unlock a sky → fully close the app → reopen. Expected: the changes are **still there**. Then (if 9.6 done) Reset app data → confirm it returns to the first-run seed.
- [ ] **Step 3:** Commit any PROGRESS note.

> ✅ **Update PROGRESS.md Phase 9 → Done.** Non-billing state now persists; billing truth still comes from the SDK. (This reverses the original "all state in-memory" locked decision — note that in PROGRESS.md.)

---

## Phase 10 — Production Android release (EAS build → Play Console)

Moves from the local Android **dev client** (Phase 6) to a **signed production AAB** on Google Play. This phase is **mostly external/manual** (accounts, dashboards, store forms); the repo changes are a config file plus production hardening. Treat the checkboxes as a release runbook.

> **Decisions to confirm before starting:**
> 1. **Expo/EAS account** owner + project (`eas init` links a project id). Free tier builds queue; paid tier is faster.
> 2. **Real application id** — ✅ **CONFIRMED 2026-06-04: keep `app.dailyrituals.mobile`** (both `android.package` and `ios.bundleIdentifier`). No domain ownership is required for the id itself; it is permanent on Play once published. No `app.config.js` change needed — the value is already set.
> 3. **Real Terms/Privacy URLs** on a live domain (Play requires a reachable privacy policy URL). The app currently falls back to `https://dailyrituals.app/{terms,privacy}` placeholders.
> 4. **Google Play Developer account** (one-time $25) and **Google Play App Signing** (recommended — Google holds the signing key).
> 5. **RevenueCat production key** — the `.env` currently holds a **`test_…` sandbox key**. Production needs the real Android key + products attached to **live** Play subscriptions.

### Task 10.1: Release decisions + accounts (manual checklist)

- [ ] Confirm final `package` / application id (10.2 decision #2).
- [ ] Create/confirm Expo account; run `npx expo install eas-cli` (or use `npx eas-cli@latest`); `eas login`; `eas init`.
- [ ] Google Play Console account created; new app drafted.
- [ ] Live Terms + Privacy URLs reachable; set them in `.env` (`TERMS_URL`, `PRIVACY_URL`).

### Task 10.2: Add `eas.json` build profiles

**Files:** Create `eas.json`.

- [ ] **Step 1: Write it**

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

> `play-service-account.json` is a Play Console service-account key — **secret, git-ignored** (add it to `.gitignore`). Used only by `eas submit`.

- [ ] **Step 2: Commit**

```powershell
git add eas.json .gitignore
git commit -m "build(release): add EAS build/submit profiles for Android"
```

### Task 10.3: Production hardening of `app.config.js`

**Files:** Modify `app.config.js`.

- [ ] **Step 1:** Set the **final** `android.package` (decision #2); add `version` + let EAS manage `android.versionCode` via `autoIncrement`; add real `icon`, `adaptiveIcon.foregroundImage`, and `splash` assets; add `runtimeVersion` (e.g. `{ "policy": "appVersion" }`); trim `android.permissions` to only what's needed (RevenueCat needs `com.android.vending.BILLING`, added by the SDK). Keep keys env-sourced via `extra`.
- [ ] **Step 2: Commit** `build(release): production app.config (final id, versioning, assets)`.

### Task 10.4: RevenueCat + Play products for production

**Files:** none (external) + `.env`.

- [ ] Swap `RC_ANDROID_KEY` from the `test_…` sandbox key to the **production** Android API key.
- [ ] In Play Console, create the **live** subscription products (annual + monthly) matching the RevenueCat `current` offering packages; activate them.
- [ ] In RevenueCat, confirm the entitlement `plus` and offering `current` point at the live Play products.
- [ ] Record the final product ids in PROGRESS.md "Config you must supply".

### Task 10.5: Build, upload, and verify on the internal track

- [ ] **Step 1:** `eas build --platform android --profile production` → produces a signed `.aab`.
- [ ] **Step 2:** Upload to Play Console **Internal testing** (or `eas submit -p android --profile production`). Complete the required forms: **Data safety**, **content rating**, **target audience**, **store listing** (screenshots, description), and the **privacy policy URL**.
- [ ] **Step 3:** Install from the internal-testing link on a real device signed into a tester account. Verify a **real (non-sandbox) purchase** opens the Play sheet, grants `plus`, and that restore/cancel/manage all behave (re-walk the Phase 6.2 state list against production billing).
- [ ] **Step 4:** When green, promote internal → **production** rollout (staged % if desired).

### Task 10.6: Record the release

- [ ] Commit any final config; update PROGRESS.md with the build id, versionCode, and track status.

> ✅ **Update PROGRESS.md Phase 10 → Done (Android production).** This reverses the original "dev only" locked decision — note it.

---

## Phase 11 — iOS parity (App Store Connect + TestFlight)

Brings iOS to the same state as Android. **Blocked on tooling:** iOS builds need a **Mac** (local Xcode) **or** EAS macOS builds (paid). Until one exists, this phase stays ⛔ exactly as the Phase 6 iOS row.

> **Decisions to confirm before starting:**
> 1. **Build path:** local Mac + Xcode, or `eas build -p ios` (needs an Apple Developer account on the EAS project). 
> 2. **Apple Developer Program** enrollment ($99/yr) — required to ship to TestFlight/App Store.
> 3. **Final `ios.bundleIdentifier`** (can differ from Android `package`; permanent once used).

### Task 11.1: Apple Developer + App Store Connect setup (manual)

- [ ] Enroll in the Apple Developer Program; create the App ID / bundle identifier; create the app record in App Store Connect.

### Task 11.2: StoreKit subscription products

- [ ] In App Store Connect, create an **auto-renewable subscription group** with **annual** and **monthly** products matching the RevenueCat `current` offering. Fill localizations + review screenshot.

### Task 11.3: RevenueCat iOS wiring

- [ ] Add the RevenueCat **iOS (App Store) API key**; set `RC_IOS_KEY` in `.env`. Attach the iOS products to the **same** entitlement `plus` and offering `current` so no app code changes (`createPurchaseService` already keys off platform).

### Task 11.4: iOS config in `app.config.js`

**Files:** Modify `app.config.js`.

- [ ] Set the final `ios.bundleIdentifier`, `ios.buildNumber` (EAS auto-increment), `ios.infoPlist.ITSAppUsesNonExemptEncryption = false` (unless using non-exempt crypto), and any required usage strings. Commit `build(release): iOS production config`.

### Task 11.5: Build + sandbox verification

- [ ] **Step 1:** `eas build --platform ios --profile preview` (or local `npx expo run:ios` on a Mac).
- [ ] **Step 2:** With a **StoreKit sandbox** Apple ID, walk the full state list (Phase 6.2) on iOS: purchase, cancel, network, owned, restore found/empty, manage deep-link.

### Task 11.6: TestFlight + submission

- [ ] **Step 1:** `eas submit -p ios` (or Xcode/Transporter) → TestFlight; test with internal/external testers.
- [ ] **Step 2:** Complete **App Privacy** ("nutrition label"), provide **review notes** with a demo account and restore instructions, then **Submit for Review**.
- [ ] **Step 3:** Record build/version in PROGRESS.md.

> ✅ **Update PROGRESS.md Phase 11 → Done (iOS)** once a Mac/EAS path is available; otherwise keep ⛔ with the exact blocker (no Mac / no Apple Developer account).

---

## Part II self-review (decisions & scope honesty)

- **Reverses two locked decisions on purpose:** "dev only" (Phases 10–11) and "all state in-memory" (Phase 9). Both are flagged at the top of Part II and inside each phase's PROGRESS marker so the change is never silent. The owner must confirm the per-phase decision lists before work starts.
- **Money/accounts gates** ($25 Play, $99 Apple, possible paid EAS) are called out as decisions, not buried in steps — none can be satisfied by Claude; they are owner actions.
- **Secrets:** production RevenueCat keys and the Play service-account JSON are env/git-ignored; the current `.env` `test_…` key is explicitly marked as sandbox-only and must be swapped for Phase 10.
- **Ordering rationale** (8 → 9 → 10 → 11) is stated and load-bearing: persistence precedes any public release.
- **Test discipline preserved:** the only net-new logic with branches (the persistence core, Task 9.2) is TDD'd; release phases are runbooks (no unit-testable pure logic) and say so.
