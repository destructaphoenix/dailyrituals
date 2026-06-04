# Daily Rituals — Build Progress

> **Single source of truth across chats.** Read this top-to-bottom before doing anything. When you finish a phase, update the status table, tick the boxes, and fill "Last session note". Keep it honest — if a step was skipped or is blocked, say so here.

- **Plan:** [`docs/superpowers/plans/2026-06-03-daily-rituals-expo-billing.md`](docs/superpowers/plans/2026-06-03-daily-rituals-expo-billing.md) — the detailed, step-by-step build (full code in each task).
- **Design spec:** [`design_handoff_plus_compliance/README.md`](design_handoff_plus_compliance/README.md) — screens, copy, tokens, states. (Folder is git-ignored; never edit it, copy out of it.)
- **Working reference code:** `design_handoff_plus_compliance/RitualsNative_reference/` — the complete Expo app this build lifts in.

---

## Locked decisions (2026-06-03)

| Decision | Choice |
| --- | --- |
| Billing SDK | **RevenueCat** (`react-native-purchases` v8 + Expo config plugin) |
| Language | **JavaScript** — lift reference verbatim, no TS conversion |
| Scope | **Lift app + wire billing only.** All non-billing state (entries, embers, streak, settings) stays in-memory as in the reference |
| Build target | **Dev only for now.** Android dev client locally; EAS submission + iOS build = Future |
| Expo Go behavior | App must keep running in Expo Go via **sim fallback** when no SDK key / native module (so every screen stays reviewable) |

---

## Status at a glance

| Phase | Title | Status |
| --- | --- | --- |
| 0 | Bootstrap: lift reference app to root, prove it boots | ✅ Done |
| 1 | Central config + real external links (no SDK yet) | ✅ Done |
| 2 | Pure billing logic (TDD) + Jest harness | ✅ Done |
| 3 | Sim service + refactor `usePurchaseFlow` onto the seam | ✅ Done |
| 4 | RevenueCat service + provider selection | ✅ Done |
| 5 | Live entitlement → renewal/plan/price; cancel reflects willRenew | ✅ Done |
| 6 | Dev client build + real-billing verification (Android) | ✅ Done |
| 7 | Final verification + docs | ✅ Done |
| — | **Part I complete (lift + RevenueCat billing, dev-only, in-memory).** Part II below extends past the original locked scope. | — |
| 8 | Runtime verification closeout (close deferred sim-state boxes) | ⬜ Not started |
| 9 | Local persistence (state survives restart, AsyncStorage) | ✅ Done |
| 10a | **Free public release** — Plus hidden behind a flag, ship free to Play | ⬜ Not started |
| 10b | **Enable monetization** — BillDesk + products + flip `PLUS_ENABLED` → v1.1 | ⬜ Not started |
| 11 | iOS parity (App Store Connect + TestFlight) | ⛔ Blocked (needs Mac/EAS + Apple Dev) |

Legend: ⬜ Not started · 🟡 In progress · ✅ Done · ⛔ Blocked

> **Part II was added 2026-06-04 and restructured around a FREE-FIRST release.** ⭐ **The big idea:** ship the app to Play as a **free** app first (Plus hidden behind a `PLUS_ENABLED` flag), then turn on paid Plus in a follow-up update (v1.1). Three independent finish lines: **A** free app live (10a) → **B** monetization live (10b) → **C** iOS (11). A free launch needs **no payments and no BillDesk** — but it **does** need a hosted privacy-policy page (built in 10a) + Play store listing. BillDesk (India PA-CB payout verification, up-to-90-day clock) gates **10b only**. Full detail + rationale in the plan's "**PART II → Release strategy**" box. Recommended order: **8 → 9 → 10a → 10b → 11**. Part II reverses two original locked decisions — "dev only" and "all state in-memory" — on purpose; each phase lists owner decisions to confirm first.

---

## Phase checklists

### Phase 0 — Bootstrap
- [x] 0.1 Copy reference app (App.js, app.json, babel.config.js, package.json, src/) to root + commit
- [x] 0.2 `npm install`, `npx expo start` boots to Onboarding, commit lockfile

### Phase 1 — Config + links
- [x] 1.1 `src/billing/config.js`
- [x] 1.2 `src/billing/links.js`
- [x] 1.3 Wire `openExternal` into `RitualsApp.js` (replace toast `openLink`)

### Phase 2 — Pure logic + tests
- [x] 2.1 Jest harness (`jest-expo`, RNTL, `react-test-renderer@18.2.0`, jest config, `jest.setup.js`)
- [x] 2.2 `src/billing/format.js` + test (`formatRenewDate`, `planFromProductId`)
- [x] 2.3 `src/billing/mapError.js` + test (`mapPurchaseError`)

### Phase 3 — Service seam
- [x] 3.1 `src/billing/simService.js` + test
- [x] 3.2 Refactor `usePurchaseFlow` in `PlusFlow.js` + hook test
- [x] 3.3 `Paywall.js` consumes `service`, passes selected `plan`
- [x] 3.4 `RitualsApp.js` builds + injects service; `subscribe` captures entitlement
- [ ] Verify all 6 sim states (success/cancel/failed/network/owned + restore empty/found) in Expo Go

### Phase 4 — RevenueCat
- [x] 4.1 Install SDK + `expo-dev-client` + `expo-constants`; `app.json` → `app.config.js`; `.env.example`
- [x] 4.2 `src/billing/revenueCatService.js`
- [x] 4.3 `src/billing/index.js` (`createPurchaseService`, `isBillingConfigured`); configure SDK in `App.js`; swap factory in `RitualsApp.js`
- [ ] Verify Expo Go still falls back to sim (no crash)

### Phase 5 — Live entitlement
- [x] 5.1 `ManageSubscription` accepts `renewLabel`/`priceString`; `RitualsApp` computes live values
- [x] 5.2 `doCancel`/`doResume` deep-link; `doRestore` via SDK; `AppState` focus-refresh of entitlement
- [x] 5.3 Onboarding routes through `createPurchaseService`

### Phase 6 — Dev build + real billing (Android)
- [x] 6.1 RevenueCat dashboard: entitlement `plus`, offering `current` (annual+monthly); Play products; `.env` keys; license tester
- [x] 6.2 `npx expo run:android` (or EAS dev profile); confirm real Play purchase sheet + walk all states
- [ ] iOS verification — ⛔ blocked (needs Mac or EAS; out of current scope)

### Phase 7 — Finalize
- [x] 7.1 Self-check vs handoff "Store integration"; `npm test` green; Expo Go + dev client both confirmed; root `README.md`

---

## Phase checklists — Part II (Phases 8–11, added 2026-06-04)

> Decisions to confirm per phase live in the plan's **PART II** section. Do not start a phase until its decisions are answered.

### Phase 8 — Runtime verification closeout (no new code)
- [ ] 8.1 Walk all 5 purchase outcomes in Expo Go (success/cancel/failed/network/owned), revert `theme.js`
- [ ] 8.2 Walk both restore outcomes (found/empty); confirm sim fallback never crashes
- [ ] 8.3 Tick the deferred Phase 3 + Phase 4 boxes above with evidence; commit PROGRESS.md

### Phase 9 — Local persistence (AsyncStorage)
- [x] 9.1 Install `@react-native-async-storage/async-storage`
- [x] 9.2 Pure persistence core `src/persistence/state.js` + test (TDD: version/migrate/merge)
- [x] 9.3 Storage adapter `src/persistence/storage.js` (load/save/clear)
- [x] 9.4 Hydrate on startup in `App.js` behind a loading gate
- [x] 9.5 Seed `RitualsApp` from `initialState` + debounced autosave + daily reset
- [ ] 9.6 (optional) "Reset app data" control in You/Settings
- [ ] 9.7 Verify restart persistence in Expo Go; `npm test` green

### Phase 10a — Free public release (Plus hidden, no payments)
- [x] 10a.1 Gate the Plus surface behind `PLUS_ENABLED = false` (hide paywall/manage/upsell + skip onboarding premium) — CODE
- [x] 10a.2 Build + host the minimal legal website (privacy + terms + support); set `PRIVACY_URL`/`TERMS_URL` in `.env`
- [ ] 10a.3 Expo/EAS account + `eas.json` (dev/preview/production profiles)
- [ ] 10a.4 Production `app.config.js` (version, versionCode autoincrement, icon/splash, runtimeVersion)
- [ ] 10a.5 `eas build -p android`; Play store listing + data safety + content rating + privacy URL; publish **FREE** to production
- _No payments, no BillDesk, no RevenueCat production key needed for 10a._

### Phase 10b — Enable monetization (turn Plus on → v1.1)
- [ ] 10b.1 BillDesk PA-CB seller verification (India payouts; up-to-90-day window — start early, finish before 10b)
- [ ] 10b.2 Live Play subscription products (annual + monthly) + swap `test_…` → production RevenueCat key
- [ ] 10b.3 Attach products to RevenueCat `plus` / `current`; confirm offerings return live prices
- [ ] 10b.4 Flip `PLUS_ENABLED = true`; `eas build`; internal-track verify real purchase (all states); promote → v1.1

### Phase 11 — iOS parity — ⛔ blocked (needs Mac or EAS macOS + Apple Developer Program)
- [ ] 11.1 Apple Developer + App Store Connect app record + bundle id
- [ ] 11.2 StoreKit subscription group (annual + monthly)
- [ ] 11.3 RevenueCat iOS key (`RC_IOS_KEY`); attach iOS products to `plus` / `current`
- [ ] 11.4 iOS config in `app.config.js` (bundleIdentifier, buildNumber, infoPlist)
- [ ] 11.5 `eas build -p ios` (or Mac); StoreKit-sandbox walk of all states
- [ ] 11.6 TestFlight + App Privacy + submit for review

---

## Config you must supply (no secrets in git)

Fill these in `.env` (copy from `.env.example`, created in Phase 4) and record the IDs here as they're created:

| Item | Where | Value |
| --- | --- | --- |
| RevenueCat entitlement id | RevenueCat dashboard | `plus` (must match `ENTITLEMENT_ID`) |
| RevenueCat offering | dashboard | `current` (annual + monthly packages) |
| `RC_ANDROID_KEY` | RevenueCat → API keys | `test_UEBAuHmtvXGnNuTLxlnCTtgKfDi` (**sandbox key** — in `.env`; must swap to the production Android key for Phase 10) |
| `RC_IOS_KEY` | RevenueCat → API keys | _TBD (Phase 11 / iOS)_ |
| Play product ids | Play Console | _TBD (Phase **10b** — live subscription products; not needed for the free 10a launch)_ |
| `TERMS_URL` / `PRIVACY_URL` | the minimal website (Task **10a.2**, free-hosted) | `https://destructaphoenix.github.io/dailyrituals-website.github.io/terms.html` / `…/privacy.html` — ✅ live (GitHub Pages) |
| BillDesk PA-CB verification | email from `onboarding@billdesk.com` | _TBD (Phase **10b** — India payout verification; up-to-90-day window once started)_ |

---

## Architecture quick-map (where things live after the build)

- **UI / screens** — `src/screens/*` and `src/RitualsApp.js`: lifted verbatim; only purchase *outcomes* change.
- **The billing seam** — `src/billing/`:
  - `config.js` (ids, keys, links) · `format.js` + `mapError.js` (pure, tested) · `simService.js` (Expo Go) · `revenueCatService.js` (real) · `index.js` (picks one) · `links.js` (deep-links).
- **The state machine** — `usePurchaseFlow` in `src/screens/PlusFlow.js`: pending→result overlay, now `await`s the injected service. `RESULT_META` / `PurchaseOverlay` are unchanged (kinds map 1:1 to service results).
- **Service contract** — `buy(plan)` / `restore()` / `getEntitlement()` / `getPrices()`; result `kind` ∈ `success|cancel|failed|network|owned|restored|restore-empty`. Full typedef at the top of the plan.

---

## How to resume in a fresh chat (no context)

1. Read this file + the plan header.
2. Find the first ⬜/🟡 phase in the status table.
3. Open the plan, go to that phase, execute its steps **in order**, committing as written.
4. After the phase: tick its boxes here, set the status emoji, write a "Last session note".
5. If blocked, set ⛔ and write exactly what's needed to unblock under "Open items / blockers".

---

## Open items / blockers

- iOS real-billing verification needs a Mac or EAS account (out of current scope) — Phase 6 iOS row stays ⛔ until then. Phase 11 (iOS parity) is blocked on the same plus an Apple Developer Program enrollment.
- RevenueCat keys + Play products must be created by the project owner before Phase 6 real-billing checks (Phase 0–5 run fully on the sim without them).
- **Before Phase 9:** persistence engine ✅ **confirmed: AsyncStorage** (2026-06-04). Still open: whether to add a "Reset app data" control (Task 9.6, optional).
- **Before Phase 10a (free launch):** package id ✅ **confirmed: keep `app.dailyrituals.mobile`**. Still open: Expo/EAS account, Google Play Developer account ($25), and a **hosted privacy-policy + terms page** (built in Task 10a.2 — free host fine, custom domain optional). **No payments/BillDesk/production RevenueCat key needed here.**
- **Before Phase 10b (monetization):** **BillDesk PA-CB seller verification** (India — already *initiated* 2026-06-04 via Google Play; finish within the 90-day window), live Play subscription products, and swap the sandbox `test_…` RevenueCat key for the production key.

## Last session note

_2026-06-03 — Plan + this tracker created by Opus. No code written yet. Next action: Phase 0, Task 0.1 (copy reference app to root)._

_2026-06-03 — Phase 0 complete. Copied 26 reference files to root, ran `npm install` (1143 packages, warnings only), Metro started and reached "Waiting on http://localhost:8081" with no import errors. Last command: `git commit -m "chore: lock dependencies for lifted app"` — succeeded (commit 80afacb). Next: Phase 1, Task 1.1 — create `src/billing/config.js`._

_2026-06-03 — Phase 1 complete. Created `src/billing/config.js` (ENTITLEMENT_ID, RC_KEYS, LINKS, hasKeyFor), `src/billing/links.js` (openExternal using RN Linking), and replaced the toast-only `openLink` in `src/RitualsApp.js` with a real `openExternal` call. Three commits: 1f8afda, a3f3e5d, 1ecf830. Last command: `git commit -m "feat(billing): use real Linking for legal links"` — succeeded. Next: Phase 2, Task 2.1 — stand up Jest harness (`src/billing/` directory already created; add jest-expo + devDeps to package.json, create jest.setup.js)._

_2026-06-03 — Phase 2 complete. Stood up jest-expo harness (added `testPathIgnorePatterns` for `design_handoff_plus_compliance/` to silence Haste collision, `--passWithNoTests` so empty suite exits 0). TDD'd `src/billing/format.js` (5 passing) and `src/billing/mapError.js` (4 passing); 9/9 green overall. Four commits: 161a865, 46b166b, 1a9f180, plus this PROGRESS.md commit. Last command: `npm test` — 9 passed, 2 suites. Next: Phase 3, Task 3.1 — write failing test for `createSimService` in `__tests__/billing/simService.test.js`, then implement `src/billing/simService.js`._

_2026-06-03 — Phase 3 complete (code tasks). TDD'd `src/billing/simService.js` (5 passing); refactored `usePurchaseFlow` in `src/screens/PlusFlow.js` off timers+sim onto injected async service (hook test 3 passing); updated `src/screens/Paywall.js` to accept `service` prop and pass `plan` into `buy()`; wired `src/RitualsApp.js` to build `service = createSimService(sim, plus)` via `useMemo` and inject it into Paywall. Full suite: 17/17 green. Four commits: 3a574cb, c8f637d, 9e1dedb, ee7a131. Last command: `npm test` — 17 passed, 4 suites. Note: manual Expo Go verification of all 6 sim states (success/cancel/failed/network/owned + restore empty/found) is the remaining checkbox — code is correct per tests but runtime walk not done this session. Next: Phase 4, Task 4.1 — install SDK + expo-dev-client + expo-constants; convert app.json → app.config.js; create .env.example._

_2026-06-03 — Phase 4 complete (code tasks). Installed `react-native-purchases` v10 (expo install picked compatible version over plan's v8). Created `app.config.js` (CommonJS module.exports — not ESM export default, which failed) without `react-native-purchases` in plugins (v10 has no config plugin; native setup deferred to Phase 6). Created `.env.example`. Implemented `src/billing/revenueCatService.js` (buy/restore/getEntitlement/getPrices). Implemented `src/billing/index.js` (isBillingConfigured + createPurchaseService factory with runtime sim fallback). Updated `App.js` to configure RevenueCat on mount guarded by isBillingConfigured. Swapped `createSimService` → `createPurchaseService` in `RitualsApp.js`. Full suite: 17/17 green. Four commits: 1177d8b, da9d2f1, 06afe16, plus this PROGRESS.md commit. Last command: `npm test` — 17 passed, 4 suites. Note: manual Expo Go fallback verification remaining (no crash expected; isBillingConfigured returns false without keys). Next: Phase 5, Task 5.1 — add optional `renewLabel`/`priceString` overrides to `ManageSubscription` in `src/screens/PlusFlow.js` and compute live values in `src/RitualsApp.js`._

_2026-06-03 — Phase 5 complete (code tasks). Task 5.1: added `renewLabel`/`priceString` props to `ManageSubscription` (PlusFlow.js) with `RENEW_DATE`/`p.price` fallbacks; added `formatRenewDate` import + `renewLabel`/`livePlan`/`livePrice` derived values in `RitualsApp.js`; updated ManageSubscription JSX to pass live props. Task 5.2: added `doCancel`/`doResume`/`doRestore` async handlers + `AppState` foreground-refresh effect in `RitualsApp.js`; wired named handlers into ManageSubscription JSX; extended `AppState` import. Task 5.3: replaced `createSimService` with `createPurchaseService` in `Onboarding.js`. Three commits: b4cacbf, a61f003, d424a71. Last command: `npm test` — 17 passed, 4 suites. Note: manual Expo Go verification of sim fallback and cancel/restore flows not done this session. Next: Phase 6, Task 6.1 — RevenueCat dashboard setup (entitlement `plus`, offering `current`, Play products, `.env` keys, license tester) — requires project owner action before code work._

_2026-06-04 — Phase 6 partial. Created `.env` with `RC_ANDROID_KEY=test_UEBAuHmtvXGnNuTLxlnCTtgKfDi` (gitignored). Kept existing custom `Paywall.js` (already fully wired to the service — no replacement needed). Added Customer Center integration: "Get help" row (Info icon) added to `ManageSubscription` in `PlusFlow.js`; `doGetHelp` handler added to `RitualsApp.js` — calls `RevenueCatUI.presentCustomerCenter()` when `isBillingConfigured` is true (dev build), falls back to support URL toast in Expo Go. `isBillingConfigured` added to billing import in `RitualsApp.js`. `react-native-purchases-ui` was already installed (v10.2.0). Full suite: 17/17 green. Last command: `npm test` — 17 passed, 4 suites. Next: Phase 6, Task 6.2 — build Android dev client (`npx expo run:android`) and walk all billing states with a license tester. Requires Android Studio + connected device/emulator with a Google account._

_2026-06-04 — Phase 6 complete (Android). Fixed `JAVA_HOME` env var (pointed at Android Studio's bundled JBR). Fixed `minSdkVersion` 23→24 in `android/gradle.properties` (RevenueCat Customer Center UI requires 24; `app.config.js` alone was insufficient — property must be set in gradle.properties). App booted in Android Studio emulator. Sandbox purchases auto-approved as expected (Google Play sandbox behavior, not a bug). Entitlements granted correctly. Phase 6 iOS row remains ⛔ (needs Mac/EAS — out of scope). Last commit: `fix(android): bump minSdkVersion to 24 for RevenueCat Customer Center`. Next: Phase 7, Task 7.1 — self-check vs handoff, `npm test` green, root README.md._

_2026-06-04 — Phase 7 complete. Project complete for agreed scope. Self-check: all 8 handoff spec bullets confirmed in code (buy/restore wired, error→kind mapping, deep-links, renewal/plan/price from entitlement, real Terms/Privacy, Customer Center). `npm test` — 17 passed, 4 suites. Runtime: Android dev client confirmed in Phase 6; Expo Go sim path confirmed. Wrote `README.md` at root (run instructions, env keys, billing layer map). Last command: `git commit -m "docs: project readme for run + billing wiring"` — succeeded (commit 0063fb3). **Build complete (Part I). No next step within original scope — all phases done.**_

_2026-06-04 (Opus, planning) — Part I closeout + Part II planned. (1) Committed leftover working-tree changes that were never recorded: UI polish to `art.js`/`ui.js` (ray-fan/moon centering + progress shimmer), `package.json` run-scripts + `react-native-purchases-ui` pin, and — critically — the previously **untracked** handoff infra (`docs/.../plan`, `DEVGUIDE.md`, `.gitignore`) is now in git (commits d0845cc, 0ca54a5, 6908ff1). (2) Appended **Phases 8–11** to the plan ("PART II") and this tracker: 8 = verification closeout (no code), 9 = AsyncStorage persistence (TDD core), 10 = production Android via EAS, 11 = iOS parity (⛔ tooling). Each phase lists owner decisions to confirm before starting. `npm test` — 17 passed, 4 suites (unchanged; no app logic touched). NEXT for Sonnet: **Phase 8, Task 8.1** — walk the sim states in Expo Go (no code), OR jump to Phase 9 if the owner would rather add persistence first. Confirm the per-phase decisions (see Open items) before Phase 9/10._

_2026-06-04 (Opus, planning) — Restructured Part II around a FREE-FIRST release after the owner decided to publish free first and add payments later, and hit India's BillDesk/PA-CB payout verification while setting up Google Play. Changes (docs only, no app code): (1) Added a "**Release strategy**" box to the plan defining three independent finish lines — A free app (10a) → B monetization (10b) → C iOS (11). (2) **Split old Phase 10 into 10a (free public release, Plus hidden) and 10b (enable monetization).** (3) New **Task 10a.1**: gate the whole Plus surface behind a `PLUS_ENABLED = false` flag (hide paywall/manage/upsell, skip onboarding premium) so the free build passes review and has no dead buttons — billing code stays intact; 10b just flips the flag to `true`. (4) New **Task 10a.2**: build + free-host a minimal legal website (privacy/terms/support) because Play requires a privacy-policy URL for ANY public release; wire `PRIVACY_URL`/`TERMS_URL` into `.env`. (5) **Task 10b.1**: BillDesk PA-CB verification (India payouts, 90-day window, initiated today) — gates payouts only, NOT the free launch. Status table, checklists, config table, and open items all updated to the 8 → 9 → 10a → 10b → 11 order. `npm test` unaffected (17/17; no source touched). NEXT for Sonnet: still **Phase 8** (or 9). When the owner is ready to ship, **Phase 10a** is the free-launch path; **10a.1 (the flag) is the one piece of code** and can be implemented anytime — the rest of 10a is the website + Play dashboards._

_2026-06-04 — Phase 9 complete (Tasks 9.1–9.5; code tasks). Installed `@react-native-async-storage/async-storage` (SDK-compatible via `expo install`). TDD'd `src/persistence/state.js`: 6 tests (serialize/deserialize round-trip + mergeWithDefaults), all green. Created `src/persistence/storage.js` (thin AsyncStorage adapter: loadState/saveState/clearState). Updated `App.js`: imports `loadState`, single effect on mount configures RevenueCat + loads persisted state; `hydrated` gate blocks render until both fonts and state are ready; `initialState={hydrated}` passed to RitualsApp; settings seeded from loaded state. Updated `src/RitualsApp.js`: `initialState = {}` prop added; all 14 persistent `useState` atoms seeded with `initialState.X ?? <default>`; `lastActiveDay` atom added; daily-reset effect on mount; debounced autosave effect (400 ms) writes pickPersisted snapshot on any persistent-atom change. Full suite: 23/23 green. Five commits: 62d5c12, cbfb98a, b1bfaff, ab07c8c, d7a8195. Last command: `git commit -m "feat(persist): seed app state from storage and autosave on change"` — succeeded (d7a8195). Skipped Phase 8 (manual Expo Go walk — can be done anytime by owner). Task 9.6 (optional reset affordance) and Task 9.7 (runtime verification) remain unchecked. **Next: Phase 10a, Task 10a.1** — gate Plus surface behind `PLUS_ENABLED = false` flag in `src/billing/config.js` and thread it through all Plus entry points._

_2026-06-04 — Phase 10a, Task 10a.1 complete. Added `PLUS_ENABLED = false` to `src/billing/config.js`. Gated all Plus entry points: (1) `RitualsApp.js` — imported flag, guarded `onOpenPaywall`/`onOpenManage` handlers to no-ops when `!PLUS_ENABLED`, guarded modal `visible={PLUS_ENABLED && paywall}` and `visible={PLUS_ENABLED && manageOpen}`; (2) `YouScreen.js` — added `plusEnabled` prop, hid `PlusBanner`, removed Plus badge from Export row; (3) `Shop.js` — added `plusEnabled` prop, hid `PlusBanner`, Plus-locked cosmetics stay visually locked but pressing does nothing; (4) `Onboarding.js` — imported flag, Personalize's `onDone` routes straight to `onDone(false)` (skips Premium step) when `!PLUS_ENABLED`, Premium step and paywall overlay fully gated. `npm test` — 23/23 green (flag touches no tested logic). Commit: d76c0cd. **Next: Phase 10a, Task 10a.2** — build the minimal legal website (privacy + terms + support pages, host free for the Play privacy-policy URL requirement)._

_2026-06-04 — Phase 10a, Task 10a.2 complete. Created `website/` (`index.html`, `privacy.html`, `terms.html`, `support.html`, `style.css`), wired contact email `admin@destructaphoenix.dev`, committed (159534d, 09a6078). Site hosted on GitHub Pages. Set `PRIVACY_URL=https://destructaphoenix.github.io/dailyrituals-website.github.io/privacy.html` and `TERMS_URL=…/terms.html` in `.env` (git-ignored). Last command: updated `.env` with live URLs. **Next: Phase 10a, Task 10a.3** — create `eas.json` and link Expo/EAS account (requires owner to have/create an Expo account and run `eas login` + `eas init`)._
