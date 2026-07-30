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

> **⚠️ Backlog is empty (2026-07-31).** IMP-031 (daily reminder) is now ✅ code-complete — see below. The only remaining row, IMP-022 (Save as PDF + About), is **⏸ deferred by owner decision**; its spec stays inline and valid but is NOT the next thing to build. There is currently no open IMP task — do not start IMP-022 without the owner reviving it. Next actions are ship-side (device walks, CI approval), not new build work.

**App status (2026-07-30): 🟢 v1.0.3 / versionCode 9 is REVIEWED, APPROVED and LIVE on the Play Store.** The closed-testing 12×14 gate was cleared 2026-07-29, production access unlocked, the free public release was pushed, and Google has now passed it. This supersedes build 8 (RevenueCat SDK bump), which never needed to publish on its own. Three consequences: **(1) Google Play API-36 compliance (deadline 2026-08-31) is ✅ SHIPPED** — IMP-027's Expo SDK 54 / `targetSdkVersion 36` upgrade is live, so the native build on `compileSdkVersion 36` is proven in production; **(2) the BillDesk deadlock is ✅ UNBLOCKED** — the public Play Store URL that BillDesk PA-CB verification was asking for now exists, which was the gate on all of Phase 10b (payments); **(3) OTA now reaches real users** — `runtimeVersion` is `appVersion` = **1.0.3**, the live version, so an OTA lands on installed devices. Ship OTA fixes promptly and treat regressions as user-visible. The app ships **free**: `PLUS_ENABLED = false`, so there is no payment surface in it at all.

**Current stack:** Expo SDK **54** · React Native **0.81.5** · React **19.1.0** · **Legacy Architecture** (`expo.newArchEnabled: false`, held deliberately — SDK 55 drops Legacy and that migration is its own future task) · `compileSdkVersion`/`targetSdkVersion` **36**, `minSdkVersion` **24** · `npm test` → **329 passed, 41 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

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
| IMP-022 | Wire the two dead You-tab buttons: **Save as PDF** (real keepsake export, Plus-gated) + **About Daily Rituals** (real about sheet). Both are currently `onPress={() => {}}` no-ops | Build | ⏸ **deferred 2026-07-31** (owner) — spec inline below, still valid; not the active track |
| IMP-023 | Dynamic daily text — rotating multilingual greeting (header, date-seeded) + daily reflection prompt (write card, no-repeat deck); fully offline; header → Layout A | OTA | ✅ code-complete — full detail in build-log |
| IMP-024 | 🔴 Streak counts real consecutive days — derive from entries (breaks to 0 on a missed day; re-logging after a gap = 1, not prev+1) | OTA | ✅ code-complete — full detail in build-log |
| IMP-025 | Edit your name in the app — make `settings.name` changeable from the You tab (currently only set once in onboarding) | OTA | ✅ code-complete — full detail in build-log |
| IMP-026 | Remove the Gamification toggle entirely — gamification is always on; delete the setting + switch + all `gamify` gating, no residue | OTA | ✅ code-complete — full detail in build-log |
| IMP-027 | 🔴 Upgrade Expo SDK 51→54 to hit `targetSdkVersion 36` (Android 16) — Google Play compliance deadline Aug 31, 2026 | Build | ✅ **shipped** in v1.0.3 / vc 9 (production review) — full detail in build-log |
| IMP-028 | 🔴 Billing correctness pass before any real transaction — live store prices on the paywall (kill hardcoded USD), build-time guard against shipping the purchase simulation, real renew date in the cancel sheet | OTA | ✅ code-complete — full detail in build-log |
| IMP-029 | Tell the user when their data came from a Google backup — a one-time "restored, and it's from {date}" note with a one-tap route to the manual restore | Build | ✅ code-complete — full detail in build-log |
| IMP-030 | 🔴 Layout can't blow out, whatever the text — settings rows auto-stack instead of collapsing to a 1-char-per-line column; app-wide font-scale cap | OTA (A) + Build (B) | ✅ code-complete — full detail in build-log |
| IMP-031 | 🔴 **Daily reminder is real** — the You-tab row advertises "8:30 PM" to every live user and schedules nothing. Local, offline, opt-in reminder notifications | Build | ✅ code-complete — full detail in build-log |

---

## 📋 IMP-022 (OPEN SPEC — ⏸ **DEFERRED 2026-07-31**, do not start) — wire the two dead You-tab buttons

> **Owner decision 2026-07-31: parked.** The spec below stays valid and unedited — the reasoning that PDF export is *already sold* on the paywall ([`src/data.js:148`](src/data.js#L148), `PLUS_PERKS`) still holds, so this must be built (or the perk line deleted) **before `PLUS_ENABLED` flips**. It is simply not the next task. Part B (the About sheet, which also kills the hardcoded `v1.0`) can be lifted out and shipped separately if a build is going out anyway.

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

## Open items / blockers

### ⏳ In flight

- **✅ v1.0.3 / versionCode 9 — REVIEWED, APPROVED, LIVE on Play** (2026-07-30). Carries IMP-027 (SDK 54 / API 36) + everything merged to `main` before it. The next build is **v1.0.4 / versionCode 10** — bumped by IMP-029 (`expo-application`); IMP-022 (`expo-print`) rides the same shipment without bumping again.
- **✅ Phase 10a COMPLETE.** 12×14 closed-testing gate cleared 2026-07-29; production access unlocked; free release live. **✅ API-36 compliance (deadline 2026-08-31) is met** — live in production, a month ahead of the deadline.
- **🚢 v1.0.4 / versionCode 10 — SHIPMENT TAGGED 2026-07-31 (`Release-Lane: build`).** Carries **IMP-028** (live store prices + sim guard), **IMP-029** (restore notice), and **IMP-030 A + B** (row auto-stack + font-scale cap). CI runs the test gate, then waits for the owner's one-tap approval, then builds and auto-submits. **`eas.json` submits to track `alpha`** (closed testing) — so after CI is green the owner must still **promote alpha → production in Play Console**; it does not reach live users on its own.
- **~~IMP-030 Part A can go OTA on its own~~ — ❌ CORRECTED 2026-07-31: it cannot.** The repo's `version` was already moved to **1.0.4** by IMP-029's `bump:native` (commit `b9ef182`) *before* IMP-030 was written, and `runtimeVersion` policy is **`appVersion`**. An `eas update` today would publish under runtimeVersion **1.0.4** while every installed device is running **1.0.3** — it would reach **zero users**. Everything since the vc9 build therefore ships as **one BUILD**, including the pure-JS parts. (General rule worth internalising: **once a `bump:native` lands, the OTA lane is closed for that release until the build ships.** Land OTA-able fixes *before* the bump, or accept they ride the build.)
- **Two device-walk debts ride this build.** (1) **IMP-029** needs a real Auto Backup + uninstall/reinstall walk (smoke test in build-log) before it can be trusted. (2) **IMP-030 anchor 1 in `rowFit.js` clears by only ~4%** (235 vs 245dp) — verify the "Backed up today" row stays inline on a real device; if it stacks in reality, lower the `0.48` glyph-ratio constant rather than raising the chrome subtraction.
- **v1.0.5 / versionCode 11 exists locally (commit `33b3db0`), not yet pushed.** IMP-031 (daily reminder) needed a native bump (`expo-notifications`) and landed on top of the already-tagged, already-pushed v1.0.4/vc10 shipment (commit `70cae1c`, `Release-Lane: build`, awaiting the owner's CI approval). No `Release-Lane` trailer on `33b3db0`, so pushing it would be a CI no-op per `release.yml` ("pushes without it are no-ops") — it would not disturb vc10's pending approval, which is tied to that specific workflow run, not to the tip of `main`. Left unpushed anyway per the "don't push unless asked to ship" rule; owner decides whether vc11 ships as its own build or gets folded into a later shipment.

### ✅ Owner device verification — WALKED 2026-07-30 (on v1.0.3)

- **IMP-027 (SDK 54) — ✅ PASSED.** Edge-to-edge is clean across the app; no status/nav-bar overlap on any custom header or the tab bar. This was the highest-risk item in the SDK 54 upgrade (Android 16 forces edge-to-edge and SDK 54 can no longer opt out) and it is now closed.
- **IMP-020 (Backup / Restore) — ✅ PASSED.** JSON export → share out (owner uploads to Drive manually) → restore from the file all work.
- **IMP-006 (Android Auto Backup) — ✅ PASSED, with a UX finding.** Uninstall → reinstall **did** auto-restore with no login, which is exactly the feature. The restored data was **stale ("older data before today")** — that is the documented Android Auto Backup contract, **not a defect**: it runs at most **once per 24h**, and only while the device is **idle + charging + on unmetered Wi-Fi**, so anything written since the last successful backup is not in it. Config is correct (`android:allowBackup="true"`, no custom rules, per the IMP-006 spec). **The real problem is that the restore is silent** — see the open finding below.
- **IMP-021 (Lifetime Progress):** still unwalked; OTA lane, no ship trailer applied yet — owner decides when to push.

### 🔎 The auto-restore is silent — ✅ scoped and code-complete as **IMP-029** (full detail in build-log; unwalked on-device)

### 💳 Phase 10b — payments (the next real track, gated externally)

- **🔓 BillDesk deadlock broken — application SUBMITTED 2026-07-30, ⏳ awaiting verification.** The trap was circular: BillDesk PA-CB seller verification wants the **live app's Play Store URL**, payments need BillDesk, BillDesk needed a published listing. Shipping v1.0.3 broke the cycle, and the owner has now submitted the application with their details. **v1.0.3 is now live and approved**, so the listing URL resolves publicly — if BillDesk queries it during verification it will no longer 404, and the URL can be re-supplied with confidence if they ask again. **Submitted ≠ verified** — BillDesk/Google still have to approve the payments profile, and until they do, subscription products cannot be activated. Watch for mail from `onboarding@billdesk.com` and Play Console → **Payments profile**. Window opened 2026-06-04 (≤90 days ⇒ ~**2026-09-02**).
- **Owner to confirm once the profile verifies:** whether any Play subscription products exist yet — Play Console → **Monetize → Subscriptions** (any products, and are they *active*?) and RevenueCat → **Offerings** (does `current` list packages?). Playbook 10b.2–10b.5 are still unchecked and "Play product ids" is still `TBD`.
- **⚠️ Before flipping `PLUS_ENABLED`: create the `RC_ANDROID_KEY` EAS env var AND GitHub repo secret.** `.env` is git-ignored and never reaches EAS Build (no `.easignore`, no `env` block in `eas.json`), so a cloud build would resolve the key to `''` → `isBillingConfigured()` false → `createPurchaseService` returns the **simulation** → the paywall fakes a purchase and grants Plus free, with no crash. IMP-028 added `scripts/check-billing-config.js` as a hard preflight in the build job, but it only arms once `PLUS_ENABLED` is true. Run `eas env:create --name RC_ANDROID_KEY --scope project --environment production` and add the repo secret of the same name (`release.yml` references it; the Actions linter flags it as undefined until it exists).
- **⚠️ The "7-day free trial" claim is hardcoded** in the paywall CTA + legal footer ([`Paywall.js`](src/screens/Paywall.js), [`PlusFlow.js`](src/screens/PlusFlow.js) `LegalFooter`). Only truthful if the Play base plan actually carries a 7-day free-trial offer. **Decide the offer when creating the products**, then either configure the trial in Play or change the copy — do not ship the claim unverified. Left hardcoded deliberately: the correct fix reads the intro/trial period off the live offering, which cannot be built or tested until real products exist. Prices themselves are already live-driven (IMP-028).

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-07-31 (ship + scope) — **shipped the backlog, scoped IMP-031.** No product code written. **(1) Tagged the v1.0.4 / vc10 shipment** — verified the lane rather than trusting the tracker: `git diff 4c44637 HEAD` (the last shipped build) touches `app.config.js`, `package.json`, `package-lock.json`, so **BUILD** is forced, and more importantly **the OTA lane is closed** — `version` is already 1.0.4 while live devices run 1.0.3 under the `appVersion` runtimeVersion policy, so IMP-030 Part A could NOT have gone OTA on its own as PROGRESS previously claimed (corrected in Open items). Pre-flighted locally: `npm test` → **312 passed, 40 suites**; billing preflight no-ops correctly (`PLUS_ENABLED = false`). Trailer `Release-Lane: build` on the closeout commit; CI test gate → owner one-tap approval → build + auto-submit to **`alpha`**, then owner promotes alpha → production in Play Console. **(2) Scoped IMP-031 (daily reminder)** as the new active track after the owner deferred IMP-022 (PDF). Found while reading `YouScreen.js`: the "Daily reminder" row at line 111 is a **third** dead button and the only dishonest one — hardcoded `value="8:30 PM"`, `onPress={() => {}}`, no `expo-notifications` in the tree, so every live user is told they have a reminder that does not exist. Spec calls for a rolling 7-day window of single-shot locals (not `repeats: true`, so it can skip a day the user already wrote), one pure core + one lazy-required native wrapper, and flags two repo-specific traps: `mergeWithDefaults` is a **shallow** top-level spread so existing users' `settings` will not gain the new `reminder` key without a hydration defaults-merge in `App.js`, and `POST_NOTIFICATIONS` makes this the app's **first runtime permission**, which changes the exact condition `scripts/patch-permissions.js` works around. NEXT: owner approves the CI build, walks IMP-029 + the IMP-030 anchor on device, promotes to production; Sonnet takes **IMP-031**._

_2026-07-31 (reminders) — **IMP-031 built, code-complete.** Full TDD per spec. `src/reminders/schedule.js` (RED→GREEN, 16 cases) is the pure boundary: `nextOccurrences` rolling 7-day window, `formatReminderTime`, `reminderRowValue`. `src/reminders/io.js` lazy-`require()`s `expo-notifications` (never a static import) so Expo Go degrades to a toast instead of crashing — verified `expo export --platform android` bundles clean both **before and after** the package was installed, confirming Metro treats the try/catch-wrapped `require()` as an optional dep. Hit the exact migration trap the spec called out: `App.js` had `if (s.settings) setSettings(s.settings)` at both the initial-load and restore paths — replaced both with `mergeWithDefaults(s.settings, DEFAULT_SETTINGS)` (the existing-but-previously-unused helper from `persistence/state.js`), with a regression test in `state.test.js` proving a pre-IMP-031 settings object gains `reminder: {enabled:false,...}` on merge instead of crashing. New `src/screens/ReminderSheet.js` (on/off + hour/minute stepper, shape of `NameEditModal`) and `src/content/reminders.js` (date-seeded gentle/playful copy, `dailyPick`'s pattern). Wired into `RitualsApp.js`: one `rearmReminders()` cancel+reschedule cycle triggered by mount, `[settings.reminder, settings.tone, entries]` changes, and `AppState` foreground. `npm test` → **329 passed, 41 suites** (from 312/40; +17). `npm run bump:native` → **v1.0.5 / versionCode 11** (native module + first runtime permission); `patch-permissions.js` postinstall re-verified exit 0. Committed (`33b3db0`, no `Release-Lane` trailer — owner hasn't said ship; **left unpushed**, see Open items). NEXT: not yet device-walked (needs a real permission-prompt + notification-fires smoke test); owner decides whether vc11 ships standalone or waits._
