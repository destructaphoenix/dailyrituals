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

**App status (2026-07-30): 🟢 v1.0.3 / versionCode 9 is REVIEWED, APPROVED and LIVE on the Play Store.** The closed-testing 12×14 gate was cleared 2026-07-29, production access unlocked, the free public release was pushed, and Google has now passed it. This supersedes build 8 (RevenueCat SDK bump), which never needed to publish on its own. Three consequences: **(1) Google Play API-36 compliance (deadline 2026-08-31) is ✅ SHIPPED** — IMP-027's Expo SDK 54 / `targetSdkVersion 36` upgrade is live, so the native build on `compileSdkVersion 36` is proven in production; **(2) the BillDesk deadlock is ✅ UNBLOCKED** — the public Play Store URL that BillDesk PA-CB verification was asking for now exists, which was the gate on all of Phase 10b (payments); **(3) OTA now reaches real users** — `runtimeVersion` is `appVersion` = **1.0.3**, the live version, so an OTA lands on installed devices. Ship OTA fixes promptly and treat regressions as user-visible. The app ships **free**: `PLUS_ENABLED = false`, so there is no payment surface in it at all.

**Current stack:** Expo SDK **54** · React Native **0.81.5** · React **19.1.0** · **Legacy Architecture** (`expo.newArchEnabled: false`, held deliberately — SDK 55 drops Legacy and that migration is its own future task) · `compileSdkVersion`/`targetSdkVersion` **36**, `minSdkVersion` **24** · `npm test` → **312 passed, 40 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

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
| IMP-029 | Tell the user when their data came from a Google backup — a one-time "restored, and it's from {date}" note with a one-tap route to the manual restore | Build | ✅ code-complete — full detail in build-log |
| IMP-030 | 🔴 Layout can't blow out, whatever the text — settings rows auto-stack instead of collapsing to a 1-char-per-line column; app-wide font-scale cap | OTA (A) + Build (B) | ✅ code-complete — full detail in build-log |

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

## Open items / blockers

### ⏳ In flight

- **✅ v1.0.3 / versionCode 9 — REVIEWED, APPROVED, LIVE on Play** (2026-07-30). Carries IMP-027 (SDK 54 / API 36) + everything merged to `main` before it. The next build is **v1.0.4 / versionCode 10** — bumped by IMP-029 (`expo-application`); IMP-022 (`expo-print`) rides the same shipment without bumping again.
- **✅ Phase 10a COMPLETE.** 12×14 closed-testing gate cleared 2026-07-29; production access unlocked; free release live. **✅ API-36 compliance (deadline 2026-08-31) is met** — live in production, a month ahead of the deadline.
- **IMP-030 is code-complete, not yet shipped.** Part A (row auto-stack) has no native change and can go OTA on its own — it's the highest-priority OTA since the row blowout is reachable today by any user with a long name, no 42-day wait needed. Part B (font-scale cap) is native and batches with the IMP-022 + IMP-029 build. **Anchor 1 in `rowFit.js` clears by only ~4%** (235 vs 245dp) — verify the "Backed up today" row stays inline on a real device before trusting it; if it stacks in reality, lower the `0.48` glyph-ratio constant.
- **IMP-029 is code-complete, not yet built/shipped.** Needs a real Auto Backup + uninstall/reinstall device walk (see its smoke test in build-log) before it can be trusted in production; batch the build with IMP-022 + IMP-030 part B.

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

_2026-07-30 (backup) — **IMP-029: tell the user their data was restored from a Google backup** (BUILD lane; no ship trailer — batch with IMP-022). The 2026-07-30 device walk found Auto Backup restoring correctly but silently and with data up to 24h stale; this makes that visible. **Detection is inferred, not native:** `serialize()` (`src/persistence/state.js`) now stamps `lastSavedAt: now` (injectable clock) on every save, always overriding any stale value in the slice, so a manual JSON import re-stamps too and can't false-positive; pure `src/persistence/restoreDetect.js` (`isRestoredInstall`, `formatBackupDate`) compares that stamp against `expo-application`'s `getInstallationTimeAsync()` — install newer than the data ⇒ restored. `App.js` computes the flag during hydration (skipping the native call entirely when `lastSavedAt` is absent — the common fresh-install path) and passes it to `RitualsApp`; new presentational `src/screens/RestoreNotice.js` (mirrors `PurchaseOverlay`/`CancelSheet`) offers **Got it** / **Restore from a file**, wired to the existing `doImport`. Self-clearing — dismissing re-stamps via `saveState`, no new persisted flag. `npm test` → **300 passed, 37 suites** (from 286/36; +14, zero product-logic changes); `expo export` clean. `npm run bump:native` → **v1.0.4 / versionCode 10** (IMP-029 lands first of the IMP-022+IMP-029 pair, so it owns this bump). Full detail in [`docs/build-log.md`](docs/build-log.md) → IMP-029. NEXT: IMP-022 (Save as PDF + About sheet), then batch-build both for IMP-030 part B too._

_2026-07-30 (layout) — **IMP-030: layout can't blow out, whatever the text** (Part A OTA / Part B BUILD; no ship trailer on Part B). Owner screenshots showed "Back up my journal" ballooning to ~18 lines with a long stale-backup string — `Row`'s `flex:1` label had no `numberOfLines`, so once the unshrinkable value container ate the free space Yoga wrapped the label one char per line; the same shape was reachable today via a long name. **Part A:** new pure `src/ui/rowFit.js` (`shouldStackRow`, calibrated glyph-width estimate, pinned by both screenshots + 5 more cases) drives a new shared `src/ui/Row.js` (extracted from `YouScreen.js`; the byte-identical duplicate in `PlusFlow.js` deleted) that auto-stacks label-over-value instead of truncating, with `numberOfLines` now on every flex-shrinking text in the row. Reconciled the 3 different name `maxLength`s to 40; added `flexShrink`+`numberOfLines` to 4 other unshrinkable `space-between` pairs (gamify quests, achievements, both Lv-N headers) and fixed 2 clipping fixed-width slots in `InsightsScreen`. **Part B:** new `src/ui/textScale.js` (`MAX_FONT_SCALE=1.5`, `CHROME_FONT_SCALE=1.2`); `T` (`src/ui.js`) now defaults every `<Text>` in the app to the cap via one new prop, with chrome (tab bar, FAB label, embers pill, PalTag, the You-tab Lv-N pill) opted into the tighter cap; nav bar got a `minHeight` so the FAB can't collide with scaled tab labels. `npm test` → **312 passed, 40 suites** (from 300/37; +12, zero product-logic changes); `expo export` clean after both parts. Commits `45e0f0c` (part A) and `c810915` (part B) — **no version bump**, already at v1.0.4/vc10 from IMP-029 in this shipment. **⚠️ Anchor 1 clears by only ~4%** (235 vs 245dp) — verify "Backed up today" stays inline on a real device before trusting the `0.48` glyph-ratio constant; if it stacks in reality, lower `0.48` rather than raising the chrome subtraction. Full detail in [`docs/build-log.md`](docs/build-log.md) → IMP-030. NEXT: IMP-022 (Save as PDF + About sheet) — batches the IMP-030 part B build._
