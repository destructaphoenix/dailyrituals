# Daily Rituals

A React Native / Expo app with real RevenueCat billing for the Plus subscription.

---

## Running the app

### Expo Go — simulated billing (no native build required)

```bash
npx expo start
```

Scan the QR code with Expo Go. The app falls back to a **simulated purchase service** automatically when no RevenueCat key is present or the native module is unavailable. Every purchase-state screen (success, cancel, failed, network error, already owned, restore) is exercisable via the in-app dev settings toggle.

### Android dev client — real billing

Requires Android Studio + a connected device or emulator with a Google account.

1. Copy `.env.example` to `.env` and fill in `RC_ANDROID_KEY` (your RevenueCat Android publishable key).
2. Build and launch:

```bash
npx expo run:android
```

The app picks up the key, initialises the RevenueCat SDK on boot, and routes all purchases through the real Google Play billing sheet.

### iOS

iOS real-billing requires a Mac or an EAS build. Out of scope for the current phase — the sim path works in Expo Go on iOS.

---

## Environment variables

Copy `.env.example` → `.env` (git-ignored). Never commit `.env`.

| Variable | Description |
| --- | --- |
| `RC_ANDROID_KEY` | RevenueCat Android publishable key |
| `RC_IOS_KEY` | RevenueCat iOS publishable key (iOS build, future) |
| `TERMS_URL` | Public terms-of-service URL |
| `PRIVACY_URL` | Public privacy-policy URL |

---

## Billing layer

All billing code lives in `src/billing/`:

| File | Purpose |
| --- | --- |
| `config.js` | Entitlement id, RC keys (from env), legal + store-settings URLs |
| `format.js` | Pure helpers: `formatRenewDate`, `planFromProductId` |
| `mapError.js` | Maps SDK errors → `cancel \| network \| owned \| failed` |
| `simService.js` | Simulation implementation (Expo Go / review) |
| `revenueCatService.js` | Real RevenueCat implementation |
| `index.js` | `createPurchaseService` — picks real vs sim at runtime; `isBillingConfigured` |
| `links.js` | `openExternal` — deep-links to terms, privacy, OS subscription settings |

The service interface: `buy(plan)` / `restore()` / `getEntitlement()` / `getPrices()`. Both implementations satisfy the same contract so `usePurchaseFlow` in `src/screens/PlusFlow.js` is unaware of which is running.

---

## Tests

```bash
npm test
```

17 tests across 4 suites covering format helpers, error mapping, the sim service, and the `usePurchaseFlow` hook. All green.
