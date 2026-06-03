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
| 5 | Live entitlement → renewal/plan/price; cancel reflects willRenew | ⬜ Not started |
| 6 | Dev client build + real-billing verification (Android) | ⬜ Not started |
| 7 | Final verification + docs | ⬜ Not started |

Legend: ⬜ Not started · 🟡 In progress · ✅ Done · ⛔ Blocked

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
- [ ] 5.1 `ManageSubscription` accepts `renewLabel`/`priceString`; `RitualsApp` computes live values
- [ ] 5.2 `doCancel`/`doResume` deep-link; `doRestore` via SDK; `AppState` focus-refresh of entitlement
- [ ] 5.3 Onboarding routes through `createPurchaseService`

### Phase 6 — Dev build + real billing (Android)
- [ ] 6.1 RevenueCat dashboard: entitlement `plus`, offering `current` (annual+monthly); Play products; `.env` keys; license tester
- [ ] 6.2 `npx expo run:android` (or EAS dev profile); confirm real Play purchase sheet + walk all states
- [ ] iOS verification — ⛔ blocked (needs Mac or EAS; out of current scope)

### Phase 7 — Finalize
- [ ] 7.1 Self-check vs handoff "Store integration"; `npm test` green; Expo Go + dev client both confirmed; root `README.md`

---

## Config you must supply (no secrets in git)

Fill these in `.env` (copy from `.env.example`, created in Phase 4) and record the IDs here as they're created:

| Item | Where | Value |
| --- | --- | --- |
| RevenueCat entitlement id | RevenueCat dashboard | `plus` (must match `ENTITLEMENT_ID`) |
| RevenueCat offering | dashboard | `current` (annual + monthly packages) |
| `RC_ANDROID_KEY` | RevenueCat → API keys | _TBD_ |
| `RC_IOS_KEY` | RevenueCat → API keys | _TBD (iOS later)_ |
| Play product ids | Play Console | _TBD_ |
| `TERMS_URL` / `PRIVACY_URL` | your site | _TBD_ |

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

- iOS real-billing verification needs a Mac or EAS account (out of current scope) — Phase 6 iOS row stays ⛔ until then.
- RevenueCat keys + Play products must be created by the project owner before Phase 6 real-billing checks (Phase 0–5 run fully on the sim without them).

## Last session note

_2026-06-03 — Plan + this tracker created by Opus. No code written yet. Next action: Phase 0, Task 0.1 (copy reference app to root)._

_2026-06-03 — Phase 0 complete. Copied 26 reference files to root, ran `npm install` (1143 packages, warnings only), Metro started and reached "Waiting on http://localhost:8081" with no import errors. Last command: `git commit -m "chore: lock dependencies for lifted app"` — succeeded (commit 80afacb). Next: Phase 1, Task 1.1 — create `src/billing/config.js`._

_2026-06-03 — Phase 1 complete. Created `src/billing/config.js` (ENTITLEMENT_ID, RC_KEYS, LINKS, hasKeyFor), `src/billing/links.js` (openExternal using RN Linking), and replaced the toast-only `openLink` in `src/RitualsApp.js` with a real `openExternal` call. Three commits: 1f8afda, a3f3e5d, 1ecf830. Last command: `git commit -m "feat(billing): use real Linking for legal links"` — succeeded. Next: Phase 2, Task 2.1 — stand up Jest harness (`src/billing/` directory already created; add jest-expo + devDeps to package.json, create jest.setup.js)._

_2026-06-03 — Phase 2 complete. Stood up jest-expo harness (added `testPathIgnorePatterns` for `design_handoff_plus_compliance/` to silence Haste collision, `--passWithNoTests` so empty suite exits 0). TDD'd `src/billing/format.js` (5 passing) and `src/billing/mapError.js` (4 passing); 9/9 green overall. Four commits: 161a865, 46b166b, 1a9f180, plus this PROGRESS.md commit. Last command: `npm test` — 9 passed, 2 suites. Next: Phase 3, Task 3.1 — write failing test for `createSimService` in `__tests__/billing/simService.test.js`, then implement `src/billing/simService.js`._

_2026-06-03 — Phase 3 complete (code tasks). TDD'd `src/billing/simService.js` (5 passing); refactored `usePurchaseFlow` in `src/screens/PlusFlow.js` off timers+sim onto injected async service (hook test 3 passing); updated `src/screens/Paywall.js` to accept `service` prop and pass `plan` into `buy()`; wired `src/RitualsApp.js` to build `service = createSimService(sim, plus)` via `useMemo` and inject it into Paywall. Full suite: 17/17 green. Four commits: 3a574cb, c8f637d, 9e1dedb, ee7a131. Last command: `npm test` — 17 passed, 4 suites. Note: manual Expo Go verification of all 6 sim states (success/cancel/failed/network/owned + restore empty/found) is the remaining checkbox — code is correct per tests but runtime walk not done this session. Next: Phase 4, Task 4.1 — install SDK + expo-dev-client + expo-constants; convert app.json → app.config.js; create .env.example._

_2026-06-03 — Phase 4 complete (code tasks). Installed `react-native-purchases` v10 (expo install picked compatible version over plan's v8). Created `app.config.js` (CommonJS module.exports — not ESM export default, which failed) without `react-native-purchases` in plugins (v10 has no config plugin; native setup deferred to Phase 6). Created `.env.example`. Implemented `src/billing/revenueCatService.js` (buy/restore/getEntitlement/getPrices). Implemented `src/billing/index.js` (isBillingConfigured + createPurchaseService factory with runtime sim fallback). Updated `App.js` to configure RevenueCat on mount guarded by isBillingConfigured. Swapped `createSimService` → `createPurchaseService` in `RitualsApp.js`. Full suite: 17/17 green. Four commits: 1177d8b, da9d2f1, 06afe16, plus this PROGRESS.md commit. Last command: `npm test` — 17 passed, 4 suites. Note: manual Expo Go fallback verification remaining (no crash expected; isBillingConfigured returns false without keys). Next: Phase 5, Task 5.1 — add optional `renewLabel`/`priceString` overrides to `ManageSubscription` in `src/screens/PlusFlow.js` and compute live values in `src/RitualsApp.js`._
