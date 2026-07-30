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

**App status:** closed-testing gate **cleared** — production access unlocked on Play Console. Build 8 (RevenueCat SDK bump) is under Google review before it can publish. Apply-for-production step for the free launch (10a.6) is next. **Google Play API-36 compliance (deadline 2026-08-31): ✅ code-complete** — IMP-027 upgraded the app to Expo SDK 54 / `targetSdkVersion 36` at **v1.0.3 / versionCode 9**; it still needs the owner's local native build + device smoke test before it can be built and uploaded (see Open items).

**Current stack:** Expo SDK **54** · React Native **0.81.5** · React **19.1.0** · **Legacy Architecture** (`expo.newArchEnabled: false`, held deliberately — SDK 55 drops Legacy and that migration is its own future task) · `compileSdkVersion`/`targetSdkVersion` **36**, `minSdkVersion` **24** · `npm test` → **262 passed, 34 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

---

## 🔧 Improvements backlog (post-launch — ACTIVE TRACK)

Opus scopes each owner-filed issue into a numbered `IMP-xxx` task (steps + commit message + ship lane all inline). Sonnet picks the **first unchecked** one, executes its steps in order, commits with the given message, ticks the boxes, archives the finished spec, and writes the Last session note.

| ID | Title | Lane | Status |
| --- | --- | --- | --- |
| IMP-001 – IMP-005 | Early post-launch fixes (name on You tab, local greeting/date, centered streak, zero-state + migration, drop login step) | OTA | ✅ shipped — full detail in build-log |
| IMP-006 | Enable + verify Android Auto Backup (new-device restore, no login) | Build (rides v5) | 🟡 code done; device verification pending owner |
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
| IMP-020 | Backup / Restore — user-held JSON export (off-device) + restore-by-replace with auto safety copy; surface Android Auto Backup | Build | ✅ code-complete (device smoke test owner-pending) — full detail in build-log |
| IMP-021 | Lifetime Progress — evolve Insights into "Your record" (days remembered + totals + adaptive heatmap) above "Your patterns"; Home hero untouched | OTA | ✅ code-complete — full detail in build-log |
| IMP-022 | Wire the two dead You-tab buttons: **Save as PDF** (real keepsake export, Plus-gated) + **About Daily Rituals** (real about sheet). Both are currently `onPress={() => {}}` no-ops | Build | ⬜ open — spec inline below |
| IMP-023 | Dynamic daily text — rotating multilingual greeting (header, date-seeded) + daily reflection prompt (write card, no-repeat deck); fully offline; header → Layout A | OTA | ✅ code-complete — full detail in build-log |
| IMP-024 | 🔴 Streak counts real consecutive days — derive from entries (breaks to 0 on a missed day; re-logging after a gap = 1, not prev+1) | OTA | ✅ code-complete — full detail in build-log |
| IMP-025 | Edit your name in the app — make `settings.name` changeable from the You tab (currently only set once in onboarding) | OTA | ✅ code-complete — full detail in build-log |
| IMP-026 | Remove the Gamification toggle entirely — gamification is always on; delete the setting + switch + all `gamify` gating, no residue | OTA | ✅ code-complete — full detail in build-log |
| IMP-027 | 🔴 Upgrade Expo SDK 51→54 to hit `targetSdkVersion 36` (Android 16) — Google Play compliance deadline Aug 31, 2026 | Build | ✅ code-complete (local native build + device smoke test owner-pending) — full detail in build-log |

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

**Version bump — check before bumping.** IMP-027 already set **v1.0.3 / versionCode 9** and that build has **not been uploaded to Play yet**. So: if versionCode 9 is still unshipped, IMP-022 **rides it — do not bump again** (a second bump just burns version numbers). If 9 has been uploaded by then, run **`npm run bump:native`** (not `bump:build`) — adding a native module makes the JS bundle incompatible with older builds, so `version` must move to keep the `appVersion` runtimeVersion policy honest.

**Smoke test after build:** Plus user PDF export → share sheet opens → file opens; non-Plus still hits paywall; Expo Go shows the unavailable toast; About sheet opens with the real version string (should read **1.0.3**, from `Constants`, not a hardcoded `v1.0`).

---

## Open items / blockers

- **✅ Phase 10a.6 CLEARED (2026-07-29):** closed-testing 12×14 requirement met — Play Console now shows production access unlocked. Remaining step is "Apply for production" + Google's review of that application (Play Console / process, nothing to code).
- **⏳ Build 8 (RevenueCat SDK bump) under Google review** — pushed via Release-Lane pipeline (commit `7ae757a`), CI test gate + owner approval already done; now waiting on Google's own review before it can publish.
- **🔴 IMP-027 (SDK 54 / API 36) — owner action required, hard deadline 2026-08-31.** Code is complete at **v1.0.3 / versionCode 9** and `npm test` + `expo export` are green, but **nothing has been built natively or uploaded yet**, and the two remaining steps need a device: **(1) local Android build on `compileSdkVersion 36`** — re-apply/refresh the `~/.gradle/init.d` kapt tmpdir fix first, since SDK 54's newer Kotlin/kapt may need an updated script (without it `expo-updates` kapt fails with `C:\Windows AccessDenied`); **(2) device/emulator smoke test** — launch, onboarding, entry write, RevenueCat paywall (Preview Mode is fine), backup/restore, **plus an edge-to-edge audit of every screen** (Android 16 forces edge-to-edge and SDK 54 can no longer opt out — check every custom header + the tab bar for status/nav-bar overlap, top and bottom insets via `react-native-safe-area-context`). Until (1) passes, the API-36 compliance fix is not actually shippable. Full detail in build-log.
- **IMP-006 (Android Auto Backup):** ✅ **shipped** in the **v1.0.1 / versionCode 7** build (Release-Lane: build trailer on `3987bd2`, pushed to `main` 2026-06-14). Code is in closed testing; only remaining task is **owner device verification** of the backup → uninstall → reinstall → restore cycle + a Play data-safety confirm. (Steps in build-log.)
- **IMP-020 (Backup / Restore):** ✅ **shipped** in the same **v1.0.1 / versionCode 7** build (native deps bumped in `08e3d2e` "bump build for backup/restore native deps"). Code-complete + unit-tested + in closed testing; only remaining task is the **owner device/emulator smoke test** (export → save → restore → recovery copy; non-backup-file error toast; settings deep-link).
- **IMP-021 (Lifetime Progress):** code-complete; OTA lane — no ship trailer applied. Owner decides when to push. Manual smoke test pending (owner-device: empty state; 1-entry heatmap; multi-week heatmap; "Your patterns" heading; no "Days kept"/"This month" tiles).
- **iOS (Phase 11):** ⛔ blocked on a Mac / EAS macOS + Apple Developer Program enrollment. Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-07-29 — RevenueCat SDK bump (BUILD lane; SHIPPED — build 8, approval pending). Google Play flagged the transitive native `com.revenuecat.purchases:purchases:10.6.1` critical note ("makes unnecessary API calls; update"), 90-day grace before publishing is blocked. Root cause: `react-native-purchases@10.2.0` → `purchases-hybrid-common:18.8.0` → native `10.6.1`. Fix: bumped `react-native-purchases` + `-ui` `^10.2.0`→`^10.5.0` (Maven-verified: 10.5.0 → hybrid-common 18.26.0 → native `purchases:10.15.1`). No app-code changes; API surface unchanged across 10.x. `npm run bump:native` → v1.0.2 / versionCode 8. `npm test` → **257 passed, 32 suites**. FF-merged `feat/dev-test-harness` → `main` (13 commits) + pushed; CI test gate → owner one-tap approval pending in Actions tab. Commit `7ae757a`, trailer `Release-Lane: build`._

_2026-07-30 — IMP-027 COMPLETE (code-complete; BUILD lane; no ship trailer) + a docs/code consistency pass. Expo SDK **51→54** for `targetSdkVersion 36` (Play API-36 deadline 2026-08-31): expo `^54` (54.0.36), RN **0.81.5**, React **19.1.0**, jest-expo 54, all expo/RN-family packages resolved by `expo install --fix`; compile+target SDK **36** + `buildToolsVersion 36.0.0`; **Legacy Architecture held** via top-level **`expo.newArchEnabled: false`** (the canonical SDK-54 field — this **deviates from spec step 3b**, which said the `expo-build-properties` block; the deprecated option there is intentionally left unset so there's one switch). `src/backup/io.js` → **`expo-file-system/legacy`** (SDK 54 replaced the string-based API with File/Directory). The `postinstall` patch was **kept, not deleted** — verified against the **pristine `expo-modules-core@3.0.30` npm tarball** that the `requestedPermissions!!` force-unwrap persists upstream (the installed copy can't answer this, since the patch rewrites it) — and moved out of the escaped `node -e` one-liner into **`scripts/patch-permissions.js`**, now three-state and **failing loudly** (non-zero exit) instead of `try/catch{}` silently no-opping. Owner-reported visual regression fixed: the night-v2 `Card` sheen banded into "weird colour blocks" on **every** screen because a `rgba(255,255,255,0.06)`→`0` ramp (~15 of 255 alpha steps) was stretched over half of each card's height via `absoluteFill` + `end.y: 0.5`; SDK 51's draw path dithered that away, SDK 54's does not. Now a fixed **48dp top strip** (`CARD_SHEEN` in `src/ui.js`, guarded by a test). **Not** an expo-linear-gradient bug — its changelog records no user-facing change 13→15 and its Android paint code is stock; an earlier fix that added `borderRadius` to the gradient rested on that wrong premise and was reverted. Also fixed: `jest.setup.js` mocked only `'expo-file-system'`, so the stub had gone **dead** for `io.js` — both paths now share `test-mocks/expoFileSystemStub.js`. Docs reconciled: `playbook.md` SDK block (35→36, versionCode 4→**9**, + stack/architecture/postinstall notes), the stale "API 35 / 23-23" guidance in the 2026-06-06 build-log note marked **superseded**, IMP-022's spec annotated with the SDK-54 baseline + `/legacy` import + a bump-only-if-9-shipped rule. `npm test` → **262 passed, 34 suites** (from 257/32; +5 guard cases, **zero product-logic test changes**). `npx expo export --platform android` clean. `npm run bump:native` → **v1.0.3 / versionCode 9**. ⏳ Owner-pending: local Android build on compileSdk 36 + device smoke test incl. the **edge-to-edge audit** — see Open items. NEXT: IMP-022 (Save as PDF + About sheet — BUILD lane; batch with Annual Recap), now on the SDK-54 baseline._
