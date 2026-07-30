# Daily Rituals — Project Playbook (stable reference)

> **Not read every chat.** This is stable reference — open it only when you actually need it:
> shipping a change, touching the phase ladder (8 / 10b / 11), or checking signing / config / architecture.
> The live cursor is [`PROGRESS.md`](../PROGRESS.md); finished specs + old notes are in [`build-log.md`](build-log.md);
> how to drive a Sonnet chat is [`DEVGUIDE.md`](../DEVGUIDE.md).
> Full step-by-step build plan (per-task code): [`docs/superpowers/plans/2026-06-03-daily-rituals-expo-billing.md`](superpowers/plans/2026-06-03-daily-rituals-expo-billing.md).

---

## Locked decisions (2026-06-03)

| Decision | Choice |
| --- | --- |
| Billing SDK | **RevenueCat** (`react-native-purchases` v8 + Expo config plugin) |
| Language | **JavaScript** — lift reference verbatim, no TS conversion |
| Scope | **Lift app + wire billing only.** All non-billing state (entries, embers, streak, settings) stays in-memory as in the reference |
| Build target | **Dev only for now.** Android dev client locally; EAS submission + iOS build = Future |
| Expo Go behavior | App must keep running in Expo Go via **sim fallback** when no SDK key / native module (so every screen stays reviewable) |

**Reference assets** (git-ignored — never edit, copy out of):
- Design spec — `design_handoff_plus_compliance/README.md` (screens, copy, tokens, states).
- Working reference code — `design_handoff_plus_compliance/RitualsNative_reference/` (the complete Expo app this build lifts in).

---

## Release strategy — free-first (Part II, added 2026-06-04)

Part II restructured the build around a **FREE-FIRST release**. ⭐ Ship to Play as a **free** app first (Plus hidden behind a `PLUS_ENABLED` flag), then turn on paid Plus in a follow-up update (v1.1). Three independent finish lines: **A** free app live (10a) → **B** monetization live (10b) → **C** iOS (11). A free launch needs **no payments and no BillDesk** — but it **does** need a hosted privacy-policy page (built in 10a) + Play store listing. BillDesk (India PA-CB payout verification, up-to-90-day clock) gates **10b only**. Recommended order: **8 → 9 → 10a → 10b → 11**. Part II reverses two original locked decisions — "dev only" and "all state in-memory" — on purpose; each phase lists owner decisions to confirm first. Full rationale in the plan's "**PART II → Release strategy**" box.

---

## 🤖 Release rules (how shipping works — read before you ship)

Shipping is automated (GitHub Actions + one-tap owner approval). **Agents NEVER run `eas` commands and never hand-edit version numbers.** To ship a finished, shippable change:

1. **Pick the lane:**
   - **OTA** — only files under `src/` changed (JS / UI / copy / logic).
   - **BUILD** — any native-affecting file changed: `app.config.js`, `package.json`, `package-lock.json`, `eas.json`, `babel.config.js`, `assets/`, or a new native dep / permission / SDK / target.
2. **BUILD lane only — bump versions with the scripts (never by hand):**
   - `npm run bump:build` — native/config change that is runtime-compatible → `versionCode +1`.
   - `npm run bump:native` — native change affecting runtime/OTA compatibility → `version` patch +1 **and** `versionCode +1`. **When unsure, use `bump:native`** (safer; scopes OTA to compatible builds).
3. **Tag the final commit** of the shippable unit with the trailer as the last line(s) of the commit message, exactly:
   - `Release-Lane: ota`  — or —  `Release-Lane: build`
   (Putting it on the PROGRESS.md closeout commit is fine; CI reads the trailer from HEAD and diffs the whole push.)
4. **Push `main`.** CI runs the test gate, then waits for the owner's one-tap approval, then ships: OTA (`eas update`) or build + auto-submit to closed testing (`alpha` track).
5. **No trailer = nothing ships** — safe for work-in-progress pushes.

Guardrails: a commit tagged `ota` that touched native files is auto-rejected by CI's backstop (re-tag as `build`). OTA reaches testers on **v5+** only. Rollback: owner runs the **Rollback OTA** workflow (Actions tab). Owner one-time setup (tokens/secrets/approval environment) is in the pipeline plan, [`docs/superpowers/plans/2026-06-07-streamlined-release-pipeline.md`](superpowers/plans/2026-06-07-streamlined-release-pipeline.md), Task 8.

### Ship lane — which fix ships how (decide per task)
| What changed | Lane | Command | Play review? |
| --- | --- | --- | --- |
| JS / UI / copy / logic / JS assets only | **OTA** | `eas update --branch production --message "…"` | ❌ none (minutes) |
| Native dep, permission, SDK/target, icon/splash, `app.config` native field, version bump | **Full build** | bump `android.versionCode` → `eas build -p android` → upload `.aab` | ✅ required |

- OTA only reaches builds **≥ versionCode 5**. The v4 build in review can't receive it — so the **first full build we push for improvements (versionCode 5) is what turns the OTA lane on** for everything after.
- Tag every task with its lane so we batch OTA-able fixes and only rebuild when something native actually changes.

### Release invariants (don't relearn these)
- **runtimeVersion policy = `appVersion`, NOT `fingerprint`.** `fingerprint` is non-deterministic between this Windows dev machine and EAS's Linux servers (absolute paths + CRLF-hashed `node_modules` → mismatched hashes → OTA rejected). So OTA targets runtimeVersion = the `version` string.
- **Native change → bump `version`** (`npm run bump:native`) so OTA is scoped to compatible builds; **pure-JS fix keeps the same `version`** (`versionCode` still bumps every upload). This is the manual replacement for the lost fingerprint auto-guard.
- **First OTA-capable build = versionCode 5 / version 1.0.0** (v4 predates `expo-updates`). v5 is the OTA baseline.
- Channels = branches: production builds listen on channel `production`; `eas update --branch production` serves them.

_(Older manual `eas` lane reference is in [build-log.md](build-log.md) → "Update workflow".)_

---

## 🔑 Android release signing — DO NOT BREAK (critical, repo-invisible)

Production `.aab` **must** be signed with the local **`dailyrituals-release.keystore`** (git-ignored, in project root):

| Field | Value |
| --- | --- |
| Keystore file | `dailyrituals-release.keystore` (project root, git-ignored — also backed up off-repo by owner) |
| Alias | `daily-rituals` |
| Password location | `android/keystore.properties` + `credentials.json` (both git-ignored — never commit) |
| **Upload cert SHA1** | `21:88:52:36:B7:CB:5C:9F:09:86:CD:09:F9:D7:60:A9:EE:51:40:BB` |
| Upload cert SHA256 | `F4:3B:1D:1B:B5:DB:C8:4E:D4:BA:45:6B:A4:1A:F2:64:70:78:BE:D6:AA:BF:3E:2E:99:B1:B6:FA:3D:D5:ED:0D` |
| Where EAS stores it | Server-side as Build Credentials **`M7r91j0b83`** (default, production) — confirmed matches the SHA1 above |

- This SHA1 is the cert **Play App Signing registered as the upload key**. Any build signed with a *different* key (e.g. an EAS auto-generated keystore) is **rejected** ("signed with the wrong key"). **Never let EAS auto-generate a new keystore for this app.**
- Losing the keystore = forced Play **upload-key reset**. Keep it + its password backed up off-repo.
- SDK versions are pinned via **`expo-build-properties`** in `app.config.js` (the `android.minSdkVersion`/etc. config keys are no-ops in Expo): `minSdkVersion 24` (RevenueCat), `compileSdkVersion`/`targetSdkVersion 36` (Play API-36 / Android 16 requirement, mandatory for update publishing from **2026-08-31** — raised from 35 by IMP-027), `buildToolsVersion 36.0.0`. Bump `android.versionCode` on every Play upload (**currently 9**; version `1.0.3`).
- **Architecture: Legacy, held deliberately.** Expo SDK 54 defaults New Architecture **ON**, so `newArchEnabled: false` is set explicitly at the **top level of `expo`** in `app.config.js` — the canonical SDK-54 field. The deprecated `expo-build-properties.android.newArchEnabled` is intentionally left unset so there is only one switch. `expo install --fix` / `prebuild` will silently flip this app to Fabric/TurboModules if that line is removed. SDK **55 drops Legacy Architecture entirely** — migrating is its own future task, not a side effect of a compliance bump.
- **Current stack (post-IMP-027):** Expo SDK **54**, React Native **0.81.5**, React **19.1.0**, `jest-expo` **54**. `src/backup/io.js` imports **`expo-file-system/legacy`** — SDK 54's default export replaced the string-based API (`writeAsStringAsync`/`documentDirectory`/`EncodingType`) with a File/Directory API; `/legacy` re-exports the old surface unchanged.
- **`postinstall` patches `expo-modules-core`** (`scripts/patch-permissions.js`): upstream still force-unwraps `requestedPermissions!!` in `PermissionsService.kt` as of `expo-modules-core@3.0.30`, which crashes on a permission check when the manifest declares no runtime permissions. The script fails **loudly** (non-zero exit) if neither the buggy nor the patched line is found — re-verify it on every SDK bump against the **pristine npm tarball**, not the installed copy (the installed copy is what the patch rewrites, so it can't answer the question).

---

## Phase ladder — Part II (8 / 10b / 11) — PARKED

> **Parked until the owner explicitly resumes.** The live track is the IMP backlog in [`PROGRESS.md`](../PROGRESS.md).
> Decisions to confirm per phase live in the plan's **PART II** section. Do not start a phase until its decisions are answered.
> Phases 0–7 + 9 are ✅ done (detailed checklists in [build-log.md](build-log.md)).

### Phase 8 — Runtime verification closeout (no new code)
- [ ] 8.1 Walk all 5 purchase outcomes in Expo Go (success/cancel/failed/network/owned), revert `theme.js`
- [ ] 8.2 Walk both restore outcomes (found/empty); confirm sim fallback never crashes
- [ ] 8.3 Tick the deferred Phase 3 + Phase 4 boxes (in build-log) with evidence; commit PROGRESS.md

### Phase 10a — Free public release (Plus hidden, no payments)
- [x] 10a.1 Gate the Plus surface behind `PLUS_ENABLED = false` (hide paywall/manage/upsell + skip onboarding premium) — CODE
- [x] 10a.2 Build + host the minimal legal website (privacy + terms + support); set `PRIVACY_URL`/`TERMS_URL` in `.env`
- [x] 10a.3 Expo/EAS account + `eas.json` (dev/preview/production profiles)
- [x] 10a.4 Production `app.config.js` (version, versionCode autoincrement, icon/splash, runtimeVersion)
- [x] 10a.5 `eas build -p android` ✅ (signed `.aab` built + uploaded; Play listing + data safety + content rating done; release **sent for review** 2026-06-06)
- [x] 10a.6 **Closed testing gate** — Play requires **12 testers opted-in for 14 continuous days** (individual accounts post-2023-11-13) before "Apply for production" unlocks. ✅ Cleared 2026-07-29 — production access now unlocked on Play Console. Next: apply for production → publish **FREE**.
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

### Per-phase entry decisions (resolved / still open)
- **Phase 9:** persistence engine ✅ confirmed AsyncStorage (2026-06-04). "Reset app data" control (9.6) — built.
- **Phase 10a:** package id ✅ `app.dailyrituals.mobile`. Needs Expo/EAS account, Google Play Developer account ($25), hosted privacy+terms page (built 10a.2). No payments/BillDesk/production RevenueCat key here.
- **Phase 10b:** **BillDesk PA-CB seller verification** (India — *initiated* 2026-06-04 via Google Play; finish within the 90-day window), live Play subscription products. RevenueCat production key already swapped 2026-06-06. Full enablement step list (Google service account JSON → RevenueCat, products → entitlement/offering, flip `PLUS_ENABLED`) is in the 2026-06-05 session note (build-log).

---

## Architecture quick-map (where things live after the build)

- **UI / screens** — `src/screens/*` and `src/RitualsApp.js`: lifted verbatim; only purchase *outcomes* change.
- **The billing seam** — `src/billing/`:
  - `config.js` (ids, keys, links) · `format.js` + `mapError.js` (pure, tested) · `simService.js` (Expo Go) · `revenueCatService.js` (real) · `index.js` (picks one) · `links.js` (deep-links).
- **The state machine** — `usePurchaseFlow` in `src/screens/PlusFlow.js`: pending→result overlay, now `await`s the injected service. `RESULT_META` / `PurchaseOverlay` are unchanged (kinds map 1:1 to service results).
- **Service contract** — `buy(plan)` / `restore()` / `getEntitlement()` / `getPrices()`; result `kind` ∈ `success|cancel|failed|network|owned|restored|restore-empty`. Full typedef at the top of the plan.

---

## Config you must supply (no secrets in git)

Fill these in `.env` (copy from `.env.example`, created in Phase 4) and record the IDs here as they're created:

| Item | Where | Value |
| --- | --- | --- |
| RevenueCat entitlement id | RevenueCat dashboard | `plus` (must match `ENTITLEMENT_ID`) |
| RevenueCat offering | dashboard | `current` (annual + monthly packages) |
| `RC_ANDROID_KEY` | RevenueCat → API keys | ✅ **Production `goog_…` key now set in `.env`** (2026-06-06; publishable, not committed). Was sandbox `test_…`. |
| `RC_IOS_KEY` | RevenueCat → API keys | _TBD (Phase 11 / iOS)_ |
| Play product ids | Play Console | _TBD (Phase **10b** — live subscription products; not needed for the free 10a launch)_ |
| `TERMS_URL` / `PRIVACY_URL` | the minimal website (Task **10a.2**, free-hosted) | `https://destructaphoenix.github.io/dailyrituals-website.github.io/terms.html` / `…/privacy.html` — ✅ live (GitHub Pages) |
| BillDesk PA-CB verification | email from `onboarding@billdesk.com` | _TBD (Phase **10b** — India payout verification; up-to-90-day window once started)_ |

---

## IMP task template (Opus copies this per issue into PROGRESS.md, fills it, adds a backlog-table row, hands to Sonnet)

```
### IMP-00X — <short title>   ·   Lane: OTA | full-build   ·   Status: ⬜
- **Goal:** <what "done" looks like, 1–2 lines>
- **Why / context:** <the symptom, request, or screenshot the owner gave>
- **Files likely touched:** `src/...`
- **Approach (decided by Opus — do not re-litigate):** <the chosen method>
- **TDD:** <which logic gets a failing test first — or "N/A, pure cosmetic">
- **Steps:**
  - [ ] 1. …
  - [ ] 2. …
  - [ ] 3. `npm test` green (must stay ≥ prior count)
- **Commit:** `<type>: <message>`
- **Acceptance:** <how to confirm it works at runtime>
- **Ship after merge:** OTA `eas update --branch production` | hold for next full build
```
