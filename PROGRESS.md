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

**Current stack:** Expo SDK **54** · React Native **0.81.5** · React **19.1.0** · **Legacy Architecture** (`expo.newArchEnabled: false`, held deliberately — SDK 55 drops Legacy and that migration is its own future task) · `compileSdkVersion`/`targetSdkVersion` **36**, `minSdkVersion` **24** · `npm test` → **300 passed, 37 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

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
| IMP-030 | 🔴 Layout can't blow out, whatever the text — settings rows auto-stack instead of collapsing to a 1-char-per-line column; app-wide font-scale cap | OTA (A) + Build (B) | ⬜ open — spec inline below |

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

## 📋 IMP-030 (OPEN SPEC) — layout can't blow out, whatever the text

**Problem (owner-found, live on v1.0.3).** The "Back up my journal" row in the **Your journal is safe** card renders correctly with `"Backed up today"`, but with `"Backed up 42 days ago — back up again soon"` the row becomes several times taller than its neighbours, the label vanishes, and the value is clipped mid-word (`"back up agai"`).

**Root cause — one `Row`, three missing constraints.** In [`src/screens/YouScreen.js`](src/screens/YouScreen.js) `Row` (~line 180):

- the label is `<T style={{ flex: 1 }}>`. In RN, `flex: 1` expands to `flexGrow: 1, flexShrink: 1, flexBasis: 0`, so the label's width is **only** the free space left over;
- the value sits in a plain `<View style={{ flexDirection: 'row', gap: 4 }}>` with **no `flexShrink`**. Yoga's default is `flexShrink: 0`, so that container claims its full intrinsic width and refuses to give any back;
- **neither `<T>` has `numberOfLines`.**

With a long value the free space goes negative, the label collapses toward zero width, and — because Yoga does **not** implement CSS's `min-width: auto` automatic minimum size, so a flex item *may* shrink below its content — RN wraps `"Back up my journal"` at roughly **one character per line**. That invisible ~18-line column is the height. The value still overflows and `Card`'s `overflow: 'hidden'` (night-v2) clips it. `"Backed up today"` is simply short enough to fit; the `> 30` branch in [`src/backup/lastBackupLabel.js`](src/backup/lastBackupLabel.js#L10) appends `" — back up again soon"` and crosses the threshold.

**This is a class of bug, not one row.** The same `Row` renders `value={display}` — **the user's own name**, up to 40 chars — so it is reachable *today* with no 42-day wait. There is a **second, byte-identical copy** of the broken `Row` in [`src/screens/PlusFlow.js`](src/screens/PlusFlow.js#L187) (dormant only because `PLUS_ENABLED = false`). The whole app contains exactly **one** `numberOfLines` ([`ArchiveScreen.js:47`](src/screens/ArchiveScreen.js#L47)) and **zero** font-scale caps.

### Approach (decided by Opus — do not re-litigate)

- **Auto-stack, don't truncate.** A row stays inline while the value fits and switches to label-over-value (Material 3 "list item with supporting text") when it doesn't. Height grows by exactly one line and no information is lost. ❌ Rejected: ellipsizing to a fixed one-line row — `"Backed up 42 days a…"` throws away the nudge that is the whole point of the string. ❌ Rejected: stacking every row — needless redesign of the many short rows (Night, Playful, Phx).
- **Fit is decided by a pure function, not by measurement.** `shouldStackRow({ label, value, availableDp, fontScale })` in its own module — deterministic, no second render pass, no flicker, and unit-testable under jest-expo (layout callbacks don't fire there, so `onTextLayout` would be untestable). ❌ Rejected: an opt-in `stacked` prop — relying on the author to remember is exactly the failure that produced this bug.
- **The heuristic is a safety *improvement*, never the safety *guarantee*.** Even inline, the value carries `numberOfLines={1}` and its container `flexShrink: 1`, and the label carries `numberOfLines={2}`. So a mis-calibrated threshold can only ever cost an ellipsis — **it can never reproduce the blowout.** This is what makes an estimate acceptable here.
- **Width model.** `estWidth = fontScale * 0.48 * (15.5 · labelLen + 14 · valueLen)`; stack when it exceeds `availableDp`. `Row` computes `availableDp` from `useWindowDimensions()` minus its own chrome (screen padding 40 + card padding 32 + icon 36 + gaps 22 + chevron 18 ≈ **width − 148**), so small phones, tablets and foldables all get the right answer. The `0.48` is an average glyph-width ratio **calibrated against the two device screenshots** and pinned by the tests below — **re-pin it if the font family ever changes.**
- **One `Row`, shared.** Extract to `src/ui/Row.js`; PlusFlow's duplicate is **deleted** and imports it. Fixing one copy and leaving the other is how this recurs.
- **Icon circles need no change.** A fixed-size `<View>` already has Yoga's default `flexShrink: 0` and cannot be crushed. Do **not** add redundant `flexShrink: 0` to them.
- **Part B is native.** `maxFontSizeMultiplier` changes native text measurement, so it **must not** ride an OTA.

### TDD (the tested boundary is pure — mirror `src/backup/`)

`__tests__/ui/rowFit.test.js` against `shouldStackRow`. The two calibration anchors are **non-negotiable regression cases**:

| label | value | availableDp | fontScale | expect |
|---|---|---|---|---|
| `Back up my journal` | `Backed up today` | 245 | 1.0 | **inline** (the screenshot that works) |
| `Back up my journal` | `Backed up 42 days ago — back up again soon` | 245 | 1.0 | **stacked** (the screenshot that broke) |
| `Appearance` | `Night` | 245 | 1.0 | inline |
| `Your name` | 40-char name | 245 | 1.0 | stacked |
| `Daily reminder` | `8:30 PM` | 245 | 1.0 | inline |
| `Daily reminder` | `8:30 PM` | 245 | **2.0** | **stacked** — same strings, scale alone forces it |
| `Restore from a backup` | `''` / null | 245 | 1.0 | inline (no value ⇒ never stacks) |

Worked values for `0.48`, so the constant is checkable rather than magic: anchor 1 = `0.48 × (15.5·18 + 14·15)` = **235** vs 245 ⇒ inline; anchor 2 = `0.48 × (15.5·18 + 14·42)` = **416** ⇒ stacked; `Daily reminder` = **151** ⇒ inline, **302** at scale 2.0 ⇒ stacked.

⚠️ **Anchor 1 clears by only ~4% (235 of 245).** Verify it inline on a real device before trusting the constant, and if it stacks in reality, lower `0.48` rather than raising `availableDp` — the chrome subtraction is measured, the glyph ratio is the estimate. Either way the failure is cosmetic: a wrong call can only over-stack or ellipsize, never blow the row out again.

Plus a `Row` render test asserting it never emits a `<T>` without `numberOfLines` beside a `flex: 1` label.

### Steps — Part A (overflow, OTA)

1. RED: `__tests__/ui/rowFit.test.js` per the table above.
2. GREEN: `src/ui/rowFit.js` — `shouldStackRow`, pure, no RN imports.
3. `src/ui/Row.js` — extract from `YouScreen`; value container `flexShrink: 1`; value `numberOfLines={1}`; label `numberOfLines={2}`; stacked branch (label over value in a `flex: 1` column, chevron pinned right). `YouScreen` imports it.
4. Delete the duplicate `Row` in [`PlusFlow.js:187`](src/screens/PlusFlow.js#L187); import the shared one. Verify the Plus rows still render (`PLUS_ENABLED` toggled locally only — **do not commit the flag flipped**).
5. Reconcile the three different name caps to **40**: [`Onboarding.js:201`](src/screens/Onboarding.js#L201) has **no `maxLength` at all** → add `maxLength={40}`; [`NameEditModal.js:34`](src/screens/NameEditModal.js#L34) `60` → `40`; `sanitizeName` is already 40 ✓.
6. Unshrinkable `space-between` text pairs — add `flexShrink: 1` + `numberOfLines` to the left text at [`gamify.js:97`](src/gamify.js#L97) (quest label vs `+N XP`), [`Achievements.js:52`](src/screens/Achievements.js#L52) (badge label vs check), [`HomeScreen.js:64`](src/screens/HomeScreen.js#L64) (`Lv N · levelName` vs XP), [`YouScreen.js:62`](src/screens/YouScreen.js#L62).
7. Fixed-width text slots at [`InsightsScreen.js:124`](src/screens/InsightsScreen.js#L124): `width: 84` mood label → `minWidth: 84` + `flexShrink: 1`; the `width: 18` count clips at 3 digits (100+ entries in one mood is reachable) → `minWidth: 18`.
8. `numberOfLines={2}` on the profile name at [`YouScreen.js:53`](src/screens/YouScreen.js#L53) (fontSize 22, 40 chars) and `{3}` on the greeting headline at [`HomeScreen.js:50`](src/screens/HomeScreen.js#L50).
9. `npm test` green (must stay ≥ 286); `npx expo export --platform android` clean.

**Commit message:** `fix(ui): settings rows survive long values instead of collapsing (IMP-030 part A)`

**Ship lane:** **OTA.** No native change, no bump — `runtimeVersion` is `appVersion` = **1.0.3**, which is the version live on Play, so this reaches current users directly. Ship as soon as it's green; the name trigger is live.

### Steps — Part B (font scaling, Build)

10. `src/ui/textScale.js` — `MAX_FONT_SCALE = 1.5` (body/content) and `CHROME_FONT_SCALE = 1.2` (tab labels, pills, badges).
11. [`src/ui.js`](src/ui.js#L11) `T` takes `maxFontSizeMultiplier`, defaulting to `MAX_FONT_SCALE`, overridable per call. **This one line is most of Part B's value.**
12. Apply `CHROME_FONT_SCALE` to the fixed-size chrome: `Tab` labels and the `Write` FAB label ([`RitualsApp.js:519,406`](src/RitualsApp.js#L519)), the ember pill, the `Lv N` pill, `PalTag`.
13. `styles.nav` gets `minHeight` and `Tab` labels `numberOfLines={1}` — the 64dp FAB at `marginTop: -26` against `paddingTop: 10` collides with scaled 10.5px labels.
14. `npm run bump:native` → **v1.0.4 / versionCode 10** (v1.0.3 / vc 9 is live). If IMP-022 + IMP-029 land in the same shipment, **one** bump for all of them — check whether it's already past vc 9 and skip if so.

**Commit message:** `fix(ui): cap font scaling so chrome can't overflow at large display sizes (IMP-030 part B)`

**Ship lane:** **BUILD** — `maxFontSizeMultiplier` is native text measurement and must not ride an OTA. Batch with IMP-022 + IMP-029 rather than building for this alone. No `Release-Lane` trailer until the owner says ship.

**Smoke test after build:** set a 40-char name → **You** tab: "Your name" stacks, nothing clipped, no giant row. Set the device to **Settings → Display → Display size + Font size, both at max** → walk Today / Insights / Reflections / You: no clipped label, no row taller than ~2 lines of its own text, tab bar intact and the FAB not overlapping its label. Then set the backup date back 42 days (dev menu) and confirm the reported row stacks and reads in full.

---

## Open items / blockers

### ⏳ In flight

- **✅ v1.0.3 / versionCode 9 — REVIEWED, APPROVED, LIVE on Play** (2026-07-30). Carries IMP-027 (SDK 54 / API 36) + everything merged to `main` before it. The next build is **v1.0.4 / versionCode 10** — bumped by IMP-029 (`expo-application`); IMP-022 (`expo-print`) rides the same shipment without bumping again.
- **✅ Phase 10a COMPLETE.** 12×14 closed-testing gate cleared 2026-07-29; production access unlocked; free release live. **✅ API-36 compliance (deadline 2026-08-31) is met** — live in production, a month ahead of the deadline.
- **🔴 IMP-030 part A is the first thing to ship.** The row blowout is live and reachable today by any user with a long name — it does not need the 42-day backup condition from the screenshot.
- **IMP-029 is code-complete, not yet built/shipped.** Needs a real Auto Backup + uninstall/reinstall device walk (see its smoke test in build-log) before it can be trusted in production; batch the build with IMP-022.

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

_2026-07-30 (billing) — **IMP-028: billing correctness pass** (OTA lane; no ship trailer). Owner asked to enable + real-transaction-test payments before the public push, so the whole billing seam was audited. The seam itself is sound (`Purchases.configure()` correctly called + gated in `App.js`; metro purchases stub is web-only). **Three real defects found and fixed:** the paywall rendered **hardcoded USD** while Google charges the local Play price and `getPrices()` was dead code (now live-driven via new `src/billing/prices.js` + `useLivePrices.js`); an **EAS cloud build would have silently shipped the purchase simulation**, faking successful purchases and granting Plus free (now a hard `scripts/check-billing-config.js` preflight in `release.yml`); and `CancelSheet` showed a hardcoded renew date. The **"7-day free trial" claim was deliberately left hardcoded** — the correct fix reads the trial period off a live offering, which cannot exist until Play products do. `npm test` → **286 passed, 36 suites** (+24, zero product-logic changes); `expo export` clean. **Headline finding was not code:** BillDesk wants the live Play Store URL, which deadlocked "hold the launch until payments work". Full detail in [`docs/build-log.md`](docs/build-log.md) → IMP-028._

_2026-07-30 (backup) — **IMP-029: tell the user their data was restored from a Google backup** (BUILD lane; no ship trailer — batch with IMP-022). The 2026-07-30 device walk found Auto Backup restoring correctly but silently and with data up to 24h stale; this makes that visible. **Detection is inferred, not native:** `serialize()` (`src/persistence/state.js`) now stamps `lastSavedAt: now` (injectable clock) on every save, always overriding any stale value in the slice, so a manual JSON import re-stamps too and can't false-positive; pure `src/persistence/restoreDetect.js` (`isRestoredInstall`, `formatBackupDate`) compares that stamp against `expo-application`'s `getInstallationTimeAsync()` — install newer than the data ⇒ restored. `App.js` computes the flag during hydration (skipping the native call entirely when `lastSavedAt` is absent — the common fresh-install path) and passes it to `RitualsApp`; new presentational `src/screens/RestoreNotice.js` (mirrors `PurchaseOverlay`/`CancelSheet`) offers **Got it** / **Restore from a file**, wired to the existing `doImport`. Self-clearing — dismissing re-stamps via `saveState`, no new persisted flag. `npm test` → **300 passed, 37 suites** (from 286/36; +14, zero product-logic changes); `expo export` clean. `npm run bump:native` → **v1.0.4 / versionCode 10** (IMP-029 lands first of the IMP-022+IMP-029 pair, so it owns this bump). Full detail in [`docs/build-log.md`](docs/build-log.md) → IMP-029. NEXT: IMP-022 (Save as PDF + About sheet), then batch-build both for IMP-030 part B too._
