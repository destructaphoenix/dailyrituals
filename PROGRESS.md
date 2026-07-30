# Daily Rituals — Build Progress (live cursor)

> **The memory between chats. Read top-to-bottom every chat — and keep it SMALL.** This file is only:
> the backlog table, any **open** IMP spec(s), live blockers, and the **2 newest** session notes.
>
> - Stable reference (locked decisions, release + signing rules, parked phases 8/10b/11, config, architecture) → [`docs/playbook.md`](docs/playbook.md) — open only when you need it.
> - Finished IMP specs + older session notes → [`docs/build-log.md`](docs/build-log.md). Git is the full record.
> - How to drive a Sonnet chat → [`DEVGUIDE.md`](DEVGUIDE.md).
>
> **Size budget (hard rule):** the moment an IMP task is **code-complete** (don't wait for ship / runtime-walk), MOVE its full block to [`docs/build-log.md`](docs/build-log.md) and leave only its one-line row in the backlog table. If you ever see a ✅ task's full spec still inline here, archive it **before** committing. This is what keeps the file from bloating.

---

## ▶️ ACTIVE TRACK

The live work is the **first unchecked `IMP-xxx` task in the Improvements backlog** below — its full spec is inline (Opus scopes it there; no separate plan file). Work that, **not** the phase ladder (8 / 10b / 11), which is **parked in [`docs/playbook.md`](docs/playbook.md)** until the owner resumes it.

**App status (2026-07-30): 🚀 v1.0.3 / versionCode 9 is submitted to PRODUCTION and awaiting Google review.** The closed-testing 12×14 gate was cleared 2026-07-29, production access unlocked, and the owner has now pushed the free public release. This supersedes build 8 (RevenueCat SDK bump), which never needed to publish on its own. Two consequences: **(1) Google Play API-36 compliance (deadline 2026-08-31) is ✅ SHIPPED** — IMP-027's Expo SDK 54 / `targetSdkVersion 36` upgrade is in the build under review, so the native build on `compileSdkVersion 36` demonstrably worked; **(2) the BillDesk deadlock is being unblocked** — once this release goes live it mints the public Play Store URL that BillDesk PA-CB verification is asking for, which is the gate on all of Phase 10b (payments). The app ships **free**: `PLUS_ENABLED = false`, so there is no payment surface in it at all.

**Current stack:** Expo SDK **54** · React Native **0.81.5** · React **19.1.0** · **Legacy Architecture** (`expo.newArchEnabled: false`, held deliberately — SDK 55 drops Legacy and that migration is its own future task) · `compileSdkVersion`/`targetSdkVersion` **36**, `minSdkVersion` **24** · `npm test` → **286 passed, 36 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

---

## 🔧 Improvements backlog (post-launch — ACTIVE TRACK)

Opus scopes each owner-filed issue into a numbered `IMP-xxx` task (steps + commit message + ship lane all inline). Sonnet picks the **first unchecked** one, executes its steps in order, commits with the given message, ticks the boxes, archives the finished spec, and writes the Last session note.

| ID | Title | Lane | Status |
| --- | --- | --- | --- |
| IMP-001 – IMP-005 | Early post-launch fixes (name on You tab, local greeting/date, centered streak, zero-state + migration, drop login step) | OTA | ✅ shipped — full detail in build-log |
| IMP-006 | Enable + verify Android Auto Backup (new-device restore, no login) | Build (rides v5) | ✅ shipped + **device-verified 2026-07-30** — full detail in build-log |
| IMP-007 | 🔴 Streak no longer stacks on multiple same-day entries (reward once/day; same-day re-write edits) | OTA | ✅ |
| IMP-008 | Real zero-state finish: level from XP, calendar + week strip from real entries, real entry dates | OTA | ✅ |
| IMP-009 | Insights tab from real entries (kill hardcoded STATS/MOOD_MIX/RHYTHM); empty state | OTA | ✅ |
| IMP-010 | Onboarding shows only on first ever launch (persist `onboarded`; returning testers skip it) | OTA | ✅ |
| IMP-011 | Kill the last hardcoded "31 May" — WriteFlow epitaph uses the device's real date | OTA | ✅ |
| IMP-012 | Achievements + Home "Keepsakes" start fresh — derive every `cur`/`earned` from real entries+streak | OTA | ✅ |
| IMP-013 | 🔴 "Tend an old grave" rite starts at 0 for new/reset users + gets a real completion trigger | OTA | ✅ |
| IMP-014 | Missed days show 💀 (skull) instead of a blank cell — week strip + heatmap; only genuinely-missed days | OTA | ✅ |
| IMP-015 | "What should we call you?" is mandatory in onboarding — can't proceed past Personalize blank | OTA | ✅ |
| IMP-016 | Ember/amber flame icon in the header is proportional + centered | OTA | ✅ |
| IMP-017 | Greeting is Good morning / afternoon / evening by the user's local time | OTA | ✅ |
| IMP-018 | Today's reflection is editable — today only — prefilled, with a "Start fresh" reset | OTA | ✅ |
| IMP-019 | Premium true-black AMOLED dark mode + rotating-rays hero, behind a one-line `DARK_THEME` revert flag | OTA | ✅ promoted |
| IMP-020 | Backup / Restore — user-held JSON export (off-device) + restore-by-replace with auto safety copy; surface Android Auto Backup | Build | ✅ shipped + **device-verified 2026-07-30** — full detail in build-log |
| IMP-021 | Lifetime Progress — evolve Insights into "Your record" (days remembered + totals + adaptive heatmap) above "Your patterns"; Home hero untouched | OTA | ✅ code-complete — full detail in build-log |
| IMP-022 | Wire the two dead You-tab buttons: **Save as PDF** (real keepsake export, Plus-gated) + **About Daily Rituals** (real about sheet). Both are currently `onPress={() => {}}` no-ops | Build | ⬜ open — spec inline below |
| IMP-023 | Dynamic daily text — rotating multilingual greeting (header, date-seeded) + daily reflection prompt (write card, no-repeat deck); fully offline; header → Layout A | OTA | ✅ code-complete — full detail in build-log |
| IMP-024 | 🔴 Streak counts real consecutive days — derive from entries (breaks to 0 on a missed day; re-logging after a gap = 1, not prev+1) | OTA | ✅ code-complete — full detail in build-log |
| IMP-025 | Edit your name in the app — make `settings.name` changeable from the You tab (currently only set once in onboarding) | OTA | ✅ code-complete — full detail in build-log |
| IMP-026 | Remove the Gamification toggle entirely — gamification is always on; delete the setting + switch + all `gamify` gating, no residue | OTA | ✅ code-complete — full detail in build-log |
| IMP-027 | 🔴 Upgrade Expo SDK 51→54 to hit `targetSdkVersion 36` (Android 16) — Google Play compliance deadline Aug 31, 2026 | Build | ✅ **shipped** in v1.0.3 / vc 9 (production review) — full detail in build-log |
| IMP-028 | 🔴 Billing correctness pass before any real transaction — live store prices on the paywall (kill hardcoded USD), build-time guard against shipping the purchase simulation, real renew date in the cancel sheet | OTA | ✅ code-complete — full detail in build-log |
| IMP-029 | Tell the user when their data came from a Google backup — a one-time "restored, and it's from {date}" note with a one-tap route to the manual restore | Build | ⬜ open — spec inline below |

---

## 📋 IMP-022 (OPEN SPEC) — wire the two dead You-tab buttons

**Problem (owner-found).** Two rows in the **General** card of [`src/screens/YouScreen.js`](src/screens/YouScreen.js) render full UI but do nothing — their `onPress` is an empty `() => {}`:
1. **"Save as PDF"** (line ~148–160) — for a **Plus** user it runs a no-op; non-Plus correctly routes to the paywall. There is **no PDF code anywhere** (no `expo-print` in `package.json`; the only "PDF" string in `data.js` is marketing copy). The UI (icon, "Plus" badge, paywall gate, chevron) was built but the export was never implemented.
2. **"About Daily Rituals"** (line ~162–163, shows `v1.0`) — `onPress={() => {}}`; opens nothing.

**Goal.** Make both buttons actually work, keeping every existing gate/style intact. **Two parts, one task** — Part A needs a new native module so the whole task is **BUILD lane**; Part B is JS-only but ships in the same shipment.

> **⚠️ Baseline changed — this spec was written pre-IMP-027.** The app is now on **Expo SDK 54 / RN 0.81 / React 19**, not SDK 51. Install `expo-print` with **`npx expo install expo-print`** (never a bare `npm install`) so it resolves to the SDK-54-compatible version. Two knock-on facts for Part A: (1) SDK 54's `expo-file-system` default export is a new **File/Directory** API — the old string-based surface (`writeAsStringAsync`, `documentDirectory`, `EncodingType`) now lives at **`expo-file-system/legacy`**, which is what `src/backup/io.js` imports, so copy *that* import line, not the SDK-51 one; (2) `jest.setup.js` stubs **both** `expo-file-system` and `expo-file-system/legacy` from `test-mocks/expoFileSystemStub.js` — if `src/export/io.js` reaches for a different native path, add it there too, because Jest keys mocks on the literal module path and a missing stub is silent.

### Part A — Save as PDF (Plus-gated keepsake export)
- Add **`expo-print`** dependency (new native module → forces a dev build; `expo-sharing` + `expo-file-system` already vendored by IMP-020, reuse them — see the `/legacy` note above).
- **Pure core first (TDD):** new `src/export/pdf.js` → `buildKeepsakeHtml(entries, meta)` returning a self-contained HTML string (inline styles, no network assets) — title page + chronological entries (real device dates, same date helpers as `src/insights/dateKeys.js`), empty-state when no entries. Unit-test the builder (entry rendering, ordering, escaping of user text, empty state). **This is the single tested boundary** — mirror the `src/backup/` shape.
- **Thin native wrapper:** `src/export/io.js` → `exportPdf()` = `Print.printToFileAsync({ html })` → `Sharing.shareAsync(uri)`. Lazy-require natives + reuse IMP-020's typed `nativeUnavailable` pattern so **Expo Go shows the toast** instead of crashing (see `src/backup/io.js` for the exact pattern after the 5e7132c revert).
- **Wire-up:** in `YouScreen.js` replace the `plus ? () => {}` branch with `plus ? onExportPdf : …` (keep `plusEnabled ? onOpenPaywall : undefined` untouched). Thread `onExportPdf` from `RitualsApp.js` (build HTML from real entries + call `io.exportPdf`), with the same try/catch + toast wiring `doExport`/`doImport` use.
- **Do not** change the paywall path, the "Plus" badge, or non-Plus behavior.

### Part B — About Daily Rituals
- Replace its `onPress={() => {}}` with a real **About** sheet/modal (a small new component, OTA-able on its own): app name + tagline, **version pulled from `expo-application` / `Constants.expoConfig.version`** (kill the hardcoded `v1.0`), a one-line "Your journal lives only on this device" local-first note (consistent with the local-only decision), and a credits/“made by” line. No external links unless trivial.
- Keep it a presentational component fed by props; no new persistence.

### Steps
1. RED: `__tests__/export/pdf.test.js` for `buildKeepsakeHtml` (entries, order, escaping, empty). 2. GREEN: `src/export/pdf.js`. 3. `src/export/io.js` thin native wrapper (lazy-require + `nativeUnavailable` toast). 4. `RitualsApp.js` → `onExportPdf` handler + try/catch/toast; pass into `YouScreen`. 5. `YouScreen.js` → wire Part A onPress; build + wire **About** component for Part B (version from `Constants`). 6. `npm test` green; `npx expo export --platform android` clean. 7. `npx expo install expo-print` (**not** bare `npm install` — see the baseline note above); version bump per the rule below. 8. Commit.

**Commit message:** `feat(you): implement Save as PDF export + About sheet — wire the two no-op You-tab buttons (IMP-022)`

**Ship lane:** **BUILD** (new `expo-print` native module). No `Release-Lane` trailer until owner says ship. Batch with the **Annual Recap** (also BUILD: `react-native-view-shot`) to avoid a one-feature build.

**Version bump — RESOLVED (2026-07-30): you must bump.** This rule used to be conditional on whether versionCode 9 had shipped. It has — v1.0.3 / vc 9 was uploaded and submitted to production review on 2026-07-30 — so IMP-022 **cannot ride it**. Run **`npm run bump:native`** (not `bump:build`): adding the `expo-print` native module makes the JS bundle incompatible with older builds, so `version` must move to keep the `appVersion` runtimeVersion policy honest. **One bump for the whole IMP-022 + IMP-029 shipment** — if IMP-029 has already moved past v1.0.3 / versionCode 9, skip the bump rather than burning a second version.

**Smoke test after build:** Plus user PDF export → share sheet opens → file opens; non-Plus still hits paywall; Expo Go shows the unavailable toast; About sheet opens with the real version string (should read **1.0.3**, from `Constants`, not a hardcoded `v1.0`).

---

## 📋 IMP-029 (OPEN SPEC) — tell the user their data came from a Google backup

**Problem (owner-found on the 2026-07-30 device walk).** Uninstall → reinstall auto-restores via Android Auto Backup (IMP-006, working correctly), but the restored data was **stale** — "older data before today". That staleness is the platform contract, **not a defect**: Auto Backup runs at most **once per 24h** and only while the device is **idle + charging + on unmetered Wi-Fi**. The defect is that the restore is **silent** — the app just opens with data, and nothing says where it came from or how old it is. Two consequences: (1) the user may never notice the missing recent days; (2) worse, they write today's entry on top of the stale restore and *then* remember their manual JSON backup — restoring it is restore-by-replace, which discards what they just wrote (IMP-020's automatic recovery copy makes this survivable, but it is a bad hole to fall into).

**Goal.** On the first launch of a restored install, show a one-time, calm note naming the backup's date, with a one-tap route into the existing manual restore. Change neither backup mechanism — they are complementary (**Auto Backup** = zero effort, ≤24h stale; **manual JSON** = current to the second, requires action). Make the difference *visible*.

### Approach (decided by Opus — do not re-litigate)

- **Detection = `lastSavedAt` vs install time.** `serialize()` stamps `lastSavedAt: Date.now()` into the persisted envelope on **every** save; `deserialize()` strips `version` as it does today but **keeps `lastSavedAt`** on the returned slice. On launch, compare it against the app's first-install time (`expo-application`). **Install newer than the data ⇒ this data outlived an install ⇒ it was restored.**
  - Android's `firstInstallTime` does **not** change on app *update*, so Play updates and OTA updates cannot false-positive. It **does** reset on uninstall→reinstall, which is exactly the case we want.
  - Stamping inside `saveState`/`serialize` (not at call sites) means the **manual** restore path also refreshes it — `handleReplaceAllData` already calls `saveState`, so importing a JSON backup whose file contains an old `lastSavedAt` cannot false-positive.
- **Absent `lastSavedAt` ⇒ show nothing.** Data backed up by a version older than this feature has no timestamp, and "restored from a backup dated unknown" is worse than silence. Consequence to accept: **the very first reinstall after this ships will not show the notice.** Correct and self-healing.
- **Self-clearing, no new flag.** Dismissing calls `saveState(hydrated)`, which re-stamps `lastSavedAt` to now and makes the condition false forever after. Do **not** add a `noticeSeen` key.
- **Host it in `RitualsApp`, detect in `App.js`.** A restored install has `onboarded` true, so it lands in `RitualsApp` — which is also where `doImport` (the manual restore, line ~292) lives, so the secondary action wires up locally. `App.js` computes the flag during hydration and passes it down as a prop; no new persistence, no new context.
- **Do not** touch `allowBackup`, the backup rules, `PERSISTED_KEYS`, or `SCHEMA_VERSION` — `lastSavedAt` rides the envelope beside `version`, not the state slice, so **no migrator is needed**.
- ❌ **Rejected: `BackupManager.dataChanged()`** to force fresher backups. Needs custom native code (no Expo API) and Android still throttles to ~once/day under the same idle/charging/Wi-Fi conditions — it narrows the staleness window without ever closing it. Not worth the native surface; visibility is strictly better value.

### TDD (the tested boundary is pure — mirror `src/backup/`)

`src/persistence/restoreDetect.js` → `isRestoredInstall({ lastSavedAt, installedAt })` and `formatBackupDate(ms)`. Cases: install newer than data ⇒ true; data newer ⇒ false; **equal ⇒ false**; missing `lastSavedAt` ⇒ false; missing/invalid `installedAt` ⇒ false; non-numeric junk ⇒ false. Plus `serialize`/`deserialize` round-trip: the stamp is written, survives a round-trip, is refreshed on re-save, and old payloads without it still deserialize (inject the clock — `serialize(slice, now)` — so tests are deterministic).

### Steps

1. RED: `__tests__/persistence/restoreDetect.test.js` + extend `__tests__/persistence/` for the `serialize`/`deserialize` stamp.
2. GREEN: `src/persistence/restoreDetect.js`; stamp in `src/persistence/state.js` (`serialize` takes an injectable `now`); keep `lastSavedAt` through `deserialize`.
3. `npx expo install expo-application` (**not** bare `npm install`). **Verify the export name against the installed version** before using it — confirm `getInstallationTimeAsync()` (returns a `Date`) is what SDK 54's copy ships; adjust if renamed.
4. `App.js`: during hydration, read the install time, compute `restoredFromMs` (null when not a restore), pass to `RitualsApp`.
5. `src/screens/RestoreNotice.js` — presentational card matching the `PurchaseOverlay`/`CancelSheet` shape. Copy: title **"Welcome back."**; body "Your journal was restored from your Google backup, saved **{date}**. Anything written after that isn't here." Primary **"Got it"**; secondary **"Restore from a file"**.
6. `RitualsApp.js`: render it when the prop is set; "Got it" → dismiss + `saveState`; "Restore from a file" → dismiss + existing `doImport`.
7. `npm test` green (must stay ≥ prior count); `npx expo export --platform android` clean.
8. Version bump — see below. Commit.

**Commit message:** `feat(backup): tell the user when their data was restored from a Google backup (IMP-029)`

**Ship lane:** **BUILD** (new `expo-application` native module). **Batch with IMP-022** (already BUILD for `expo-print`) so this is not a one-feature build. IMP-029 **owns the `expo-application` install**; IMP-022's About sheet takes its version string from `expo-constants`, which is already vendored. No `Release-Lane` trailer until the owner says ship.

**Version bump:** one `npm run bump:native` for the **combined** IMP-022 + IMP-029 shipment — not one each. Whichever task lands second checks whether the other already bumped past **v1.0.3 / versionCode 9** (shipped 2026-07-30) and skips if so.

**Smoke test after build:** write an entry → wait for a real Auto Backup (idle + charging + Wi-Fi) → uninstall → reinstall → notice appears naming the backup's date → "Restore from a file" opens the picker → "Got it" dismisses and **does not** reappear on relaunch. Also confirm the negative cases: a normal launch, a Play/OTA update, and a fresh install all show **nothing**.

---

## Open items / blockers

### ⏳ In flight

- **v1.0.3 / versionCode 9 — awaiting Google production review** (submitted 2026-07-30). Carries IMP-027 (SDK 54 / API 36) + everything merged to `main` before it. Nothing to do but wait; if Google rejects, the reason lands in Play Console → Publishing overview.
- **✅ Phase 10a COMPLETE.** 12×14 closed-testing gate cleared 2026-07-29; production access unlocked; free release applied for and submitted. **✅ API-36 compliance (deadline 2026-08-31) is met** — shipped inside this build, well ahead of the deadline.

### ✅ Owner device verification — WALKED 2026-07-30 (on v1.0.3)

- **IMP-027 (SDK 54) — ✅ PASSED.** Edge-to-edge is clean across the app; no status/nav-bar overlap on any custom header or the tab bar. This was the highest-risk item in the SDK 54 upgrade (Android 16 forces edge-to-edge and SDK 54 can no longer opt out) and it is now closed.
- **IMP-020 (Backup / Restore) — ✅ PASSED.** JSON export → share out (owner uploads to Drive manually) → restore from the file all work.
- **IMP-006 (Android Auto Backup) — ✅ PASSED, with a UX finding.** Uninstall → reinstall **did** auto-restore with no login, which is exactly the feature. The restored data was **stale ("older data before today")** — that is the documented Android Auto Backup contract, **not a defect**: it runs at most **once per 24h**, and only while the device is **idle + charging + on unmetered Wi-Fi**, so anything written since the last successful backup is not in it. Config is correct (`android:allowBackup="true"`, no custom rules, per the IMP-006 spec). **The real problem is that the restore is silent** — see the open finding below.
- **IMP-021 (Lifetime Progress):** still unwalked; OTA lane, no ship trailer applied yet — owner decides when to push.

### 🔎 The auto-restore is silent — ✅ scoped as **IMP-029** (spec inline below)

### 💳 Phase 10b — payments (the next real track, gated externally)

- **🔓 BillDesk deadlock broken — application SUBMITTED 2026-07-30, ⏳ awaiting verification.** The trap was circular: BillDesk PA-CB seller verification wants the **live app's Play Store URL**, payments need BillDesk, BillDesk needed a published listing. Shipping v1.0.3 to production broke the cycle, and the owner has now submitted the application with their details. **Submitted ≠ verified** — BillDesk/Google still have to approve the payments profile, and until they do, subscription products cannot be activated. Watch for mail from `onboarding@billdesk.com` and Play Console → **Payments profile**. Window opened 2026-06-04 (≤90 days ⇒ ~**2026-09-02**).
- **Owner to confirm once the profile verifies:** whether any Play subscription products exist yet — Play Console → **Monetize → Subscriptions** (any products, and are they *active*?) and RevenueCat → **Offerings** (does `current` list packages?). Playbook 10b.2–10b.5 are still unchecked and "Play product ids" is still `TBD`.
- **⚠️ Before flipping `PLUS_ENABLED`: create the `RC_ANDROID_KEY` EAS env var AND GitHub repo secret.** `.env` is git-ignored and never reaches EAS Build (no `.easignore`, no `env` block in `eas.json`), so a cloud build would resolve the key to `''` → `isBillingConfigured()` false → `createPurchaseService` returns the **simulation** → the paywall fakes a purchase and grants Plus free, with no crash. IMP-028 added `scripts/check-billing-config.js` as a hard preflight in the build job, but it only arms once `PLUS_ENABLED` is true. Run `eas env:create --name RC_ANDROID_KEY --scope project --environment production` and add the repo secret of the same name (`release.yml` references it; the Actions linter flags it as undefined until it exists).
- **⚠️ The "7-day free trial" claim is hardcoded** in the paywall CTA + legal footer ([`Paywall.js`](src/screens/Paywall.js), [`PlusFlow.js`](src/screens/PlusFlow.js) `LegalFooter`). Only truthful if the Play base plan actually carries a 7-day free-trial offer. **Decide the offer when creating the products**, then either configure the trial in Play or change the copy — do not ship the claim unverified. Left hardcoded deliberately: the correct fix reads the intro/trial period off the live offering, which cannot be built or tested until real products exist. Prices themselves are already live-driven (IMP-028).

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-07-30 (billing) — **IMP-028: billing correctness pass** (OTA lane; no ship trailer). Owner asked to enable + real-transaction-test payments before the public push, so the whole billing seam was audited. The seam itself is sound (`Purchases.configure()` correctly called + gated in `App.js`; metro purchases stub is web-only). **Three real defects found and fixed:** the paywall rendered **hardcoded USD** while Google charges the local Play price and `getPrices()` was dead code (now live-driven via new `src/billing/prices.js` + `useLivePrices.js`); an **EAS cloud build would have silently shipped the purchase simulation**, faking successful purchases and granting Plus free (now a hard `scripts/check-billing-config.js` preflight in `release.yml`); and `CancelSheet` showed a hardcoded renew date. The **"7-day free trial" claim was deliberately left hardcoded** — the correct fix reads the trial period off a live offering, which cannot exist until Play products do. `npm test` → **286 passed, 36 suites** (+24, zero product-logic changes); `expo export` clean. **Headline finding was not code:** BillDesk wants the live Play Store URL, which deadlocked "hold the launch until payments work". Full detail in [`docs/build-log.md`](docs/build-log.md) → IMP-028._

_2026-07-30 (launch) — **🚀 v1.0.3 / versionCode 9 submitted to PRODUCTION review** (owner) + a docs reconciliation pass. This is the free public launch: `PLUS_ENABLED = false`, so the build carries no payment surface at all. Three facts changed by it and now reflected everywhere: **(1) IMP-027 is SHIPPED, not code-complete** — the native build on `compileSdkVersion 36` demonstrably worked, so the `~/.gradle/init.d` kapt tmpdir fix held on SDK 54's newer Kotlin/kapt without a rewrite, and **API-36 compliance is met a month ahead of the 2026-08-31 deadline**; build 8 is superseded and no longer waiting on anything. **(2) The BillDesk deadlock is unblocking** — this upload is what mints the public Play Store URL BillDesk PA-CB verification wants; hand it `https://play.google.com/store/apps/details?id=app.dailyrituals.mobile` (worth trying before review completes). **(3) IMP-022's conditional version-bump rule is now RESOLVED to "must bump"** — it was written as "ride versionCode 9 if it hasn't shipped"; 9 has shipped, so IMP-022 runs `npm run bump:native`. Open items were restructured from a flat list into **In flight / Owner device verification / Phase 10b / Parked**, because the accumulated per-IMP device-verification items (IMP-006, 020, 021, 027) are one runtime walk on the live build, not four separate blockers — the edge-to-edge audit is the one that matters most. IMP-028's full detail archived to build-log per the size budget. No code changed this session; `npm test` still **286 passed, 36 suites**. Also this session: **the BillDesk application was submitted** (2026-07-30) now that the production push supplied the Play Store URL it wanted — recorded as submitted-not-yet-verified, since products cannot be activated until the payments profile is actually approved. The owner then walked the production build: **edge-to-edge ✅, manual backup/restore ✅, and Android Auto Backup ✅** — uninstall→reinstall auto-restored with no login, closing IMP-006, IMP-020 and IMP-027. The restored data was stale ("older data before today"), which is the **documented Auto Backup contract** (≤once/24h, idle+charging+Wi-Fi), **not a defect** — but it surfaced that the restore is **silent**, now scoped as **IMP-029**. NEXT: IMP-022 then IMP-029, shipped in one BUILD._
