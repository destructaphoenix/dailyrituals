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

**App status:** in Play **closed testing** — gated by the 12-testers × 14-continuous-days requirement (see Blockers). Free public launch (10a) unlocks when that clears.

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
| IMP-025 | Edit your name in the app — make `settings.name` changeable from the You tab (currently only set once in onboarding) | OTA | ⬜ open — spec inline below |
| IMP-026 | Remove the Gamification toggle entirely — gamification is always on; delete the setting + switch + all `gamify` gating, no residue | OTA | ⬜ open — spec inline below |

---

## 📋 IMP-022 (OPEN SPEC) — wire the two dead You-tab buttons

**Problem (owner-found).** Two rows in the **General** card of [`src/screens/YouScreen.js`](src/screens/YouScreen.js) render full UI but do nothing — their `onPress` is an empty `() => {}`:
1. **"Save as PDF"** (line ~148–160) — for a **Plus** user it runs a no-op; non-Plus correctly routes to the paywall. There is **no PDF code anywhere** (no `expo-print` in `package.json`; the only "PDF" string in `data.js` is marketing copy). The UI (icon, "Plus" badge, paywall gate, chevron) was built but the export was never implemented.
2. **"About Daily Rituals"** (line ~162–163, shows `v1.0`) — `onPress={() => {}}`; opens nothing.

**Goal.** Make both buttons actually work, keeping every existing gate/style intact. **Two parts, one task** — Part A needs a new native module so the whole task is **BUILD lane**; Part B is JS-only but ships in the same shipment.

### Part A — Save as PDF (Plus-gated keepsake export)
- Add **`expo-print`** dependency (new native module → forces a dev build; `expo-sharing` + `expo-file-system` already vendored by IMP-020, reuse them).
- **Pure core first (TDD):** new `src/export/pdf.js` → `buildKeepsakeHtml(entries, meta)` returning a self-contained HTML string (inline styles, no network assets) — title page + chronological entries (real device dates, same date helpers as `src/insights/dateKeys.js`), empty-state when no entries. Unit-test the builder (entry rendering, ordering, escaping of user text, empty state). **This is the single tested boundary** — mirror the `src/backup/` shape.
- **Thin native wrapper:** `src/export/io.js` → `exportPdf()` = `Print.printToFileAsync({ html })` → `Sharing.shareAsync(uri)`. Lazy-require natives + reuse IMP-020's typed `nativeUnavailable` pattern so **Expo Go shows the toast** instead of crashing (see `src/backup/io.js` for the exact pattern after the 5e7132c revert).
- **Wire-up:** in `YouScreen.js` replace the `plus ? () => {}` branch with `plus ? onExportPdf : …` (keep `plusEnabled ? onOpenPaywall : undefined` untouched). Thread `onExportPdf` from `RitualsApp.js` (build HTML from real entries + call `io.exportPdf`), with the same try/catch + toast wiring `doExport`/`doImport` use.
- **Do not** change the paywall path, the "Plus" badge, or non-Plus behavior.

### Part B — About Daily Rituals
- Replace its `onPress={() => {}}` with a real **About** sheet/modal (a small new component, OTA-able on its own): app name + tagline, **version pulled from `expo-application` / `Constants.expoConfig.version`** (kill the hardcoded `v1.0`), a one-line "Your journal lives only on this device" local-first note (consistent with the local-only decision), and a credits/“made by” line. No external links unless trivial.
- Keep it a presentational component fed by props; no new persistence.

### Steps
1. RED: `__tests__/export/pdf.test.js` for `buildKeepsakeHtml` (entries, order, escaping, empty). 2. GREEN: `src/export/pdf.js`. 3. `src/export/io.js` thin native wrapper (lazy-require + `nativeUnavailable` toast). 4. `RitualsApp.js` → `onExportPdf` handler + try/catch/toast; pass into `YouScreen`. 5. `YouScreen.js` → wire Part A onPress; build + wire **About** component for Part B (version from `Constants`). 6. `npm test` green; `npx expo export --platform android` clean. 7. `npm install expo-print`; `npm run bump:build` (versionCode bump). 8. Commit.

**Commit message:** `feat(you): implement Save as PDF export + About sheet — wire the two no-op You-tab buttons (IMP-022)`

**Ship lane:** **BUILD** (new `expo-print` native module). 006/020 already shipped in v1.0.1 / versionCode 7, so this rides the **next** build — batch it with the **Annual Recap** (also BUILD: `react-native-view-shot`) to avoid a one-feature build. No `Release-Lane` trailer until owner says ship. Smoke test after build: Plus user PDF export → share sheet opens → file opens; non-Plus still hits paywall; Expo Go shows the unavailable toast; About sheet opens with the real version string.

---

## 📋 IMP-025 (OPEN SPEC) — edit your name in the app

### IMP-025 — Editable display name   ·   Lane: OTA   ·   Status: ⬜
- **Goal:** The user can change their name after onboarding. Editing it updates the You-tab profile header + the Home greeting, and persists across relaunch.
- **Why / context:** `settings.name` is captured **once** in onboarding ("What should we call you?", made mandatory by IMP-015) and never editable afterward. `YouScreen` renders it via `profileIdentity(settings.name)` but offers no way to change it. `setSettings` is **already threaded into `YouScreen`** (immutable updater), and `name` already lives in `DEFAULT_SETTINGS` + persisted `settings` — so this is purely additive UI, no new persistence.
- **Files likely touched:** `src/profile/identity.js` (new pure helper + tests), `src/screens/YouScreen.js` (new row + edit modal), maybe a small new `src/screens/NameEditModal.js`, `__tests__/profile/identity.test.js`.
- **Approach (decided by Opus — do not re-litigate):**
  - Add a **"Your name" Row** to the **Preferences** card in `YouScreen.js` (alongside Daily reminder / Appearance / Voice), `value` = current display name, `onPress` opens a small edit modal.
  - **Do not use `Alert.prompt`** — it's iOS-only and Android is the launch platform. Build a small presentational `NameEditModal` (a `TextInput` prefilled with the current name + Save/Cancel), styled to match the app's existing modals (e.g. the About/Achievements sheet pattern). On Save → `setSettings(s => ({ ...s, name: clean }))`.
  - **Pure validation** in `src/profile/identity.js` (already houses `profileIdentity`): `sanitizeName(input)` → trims, caps length (e.g. 40 chars), returns the cleaned string or `null` when blank. Caller keeps the prior name when result is `null` (blank not allowed — consistent with IMP-015 mandatory-name).
  - The Home greeting already reads `userName={(settings.name || '').trim()}` ([`RitualsApp.js:374`](src/RitualsApp.js#L374)), so it updates automatically — no extra wiring.
- **TDD:** RED first — `__tests__/profile/identity.test.js` for `sanitizeName`: trims surrounding space; caps overlong input; blank/whitespace → `null`; preserves unicode/emoji; leaves a normal name intact. The modal is presentational (untested).
- **Steps:**
  - [ ] 1. RED: `sanitizeName` tests.
  - [ ] 2. GREEN: `sanitizeName` in `src/profile/identity.js`.
  - [ ] 3. `NameEditModal` component (TextInput + Save/Cancel, themed).
  - [ ] 4. `YouScreen.js`: add "Your name" Preferences row + modal state; Save → `setSettings` via `sanitizeName`.
  - [ ] 5. `npm test` green (≥ 218 + new cases).
- **Commit:** `feat(you): let the user edit their display name from the You tab (IMP-025)`
- **Acceptance:** You tab → tap **Your name** → modal prefilled → change → Save → profile header + Home greeting both update; blank entry is rejected (keeps old name); relaunch shows the new name.
- **Ship after merge:** OTA `eas update --branch production`.

---

## 📋 IMP-026 (OPEN SPEC) — remove the Gamification toggle entirely (always on)

### IMP-026 — Delete the Gamification setting; gamification is always on   ·   Lane: OTA   ·   Status: ⬜
- **Goal:** Gamification is **always on**. The "Gamification" switch, the `settings.gamify` setting, and **every** `gamify` gate are removed with **no residue** — the app behaves exactly as if `gamify` were permanently `true`.
- **Why / context (owner request):** A "Gamification" `Switch` ([`src/screens/YouScreen.js:116-125`](src/screens/YouScreen.js#L116-L125)) toggles `settings.gamify`, which gates large parts of `HomeScreen` (rings, daily quests, achievements peek) and `ArchiveScreen` (mood display). Owner wants it permanent and the control + flag gone entirely.
- **Files likely touched:** `src/screens/YouScreen.js`, `src/theme.js` (`DEFAULT_SETTINGS`), `src/RitualsApp.js`, `src/screens/HomeScreen.js`, `src/screens/ArchiveScreen.js`, `src/icons.js` (Diamond import only if newly-unused). Dev-only on this branch: `src/dev/DevPanel.js`, `src/dev/buildState.js`.
- **Approach (decided by Opus — do not re-litigate):** Hardcode always-on by **deleting the conditionals**, not by passing `gamify={true}`.
  - `YouScreen.js`: delete the Gamification `Row` (116-125) and the `setGamify` handler (line 35). Remove the now-unused `Diamond` import (verify no other consumer in this file). Fix the file-top comment (line 2) that references "Gamification rows".
  - `theme.js`: delete `gamify: true` from `DEFAULT_SETTINGS` (line 105).
  - `RitualsApp.js`: delete `const gamify = settings.gamify !== false;` (line 73). Stop passing `gamify` to `HomeScreen` and `ArchiveScreen` (lines ~369, 345).
  - `HomeScreen.js`: remove the `gamify` param; **unwrap** every `{gamify && (…)}` block to always render (lines ~55, 107, 114, 136); **delete** the `{!gamify && (…)}` "gentle peek when gamification is off" fallback (lines ~160-161) — that branch is intentionally gone now.
  - `ArchiveScreen.js`: remove the `gamify` param; unwrap `{gamify && (…)}` (line ~26); `{gamify && e.mood ? …}` → `{e.mood ? …}` (line ~50).
  - **Persistence residue:** `gamify` lives inside the persisted `settings` blob, not in `PERSISTED_KEYS` directly. Old installs keep a dead `settings.gamify` value that nothing reads — harmless; **no migration / version bump** needed for it. (Note in the session note.)
  - **Dev harness (this branch only):** remove the `gamify` knob from `DevPanel.js` (lines 19, 84) and `buildState.js` (lines 26, 62) so no control writes a setting that no longer exists.
- **TDD:** N/A — structural UI removal, no new pure logic. Guard instead: existing suite must stay green, and a repo grep confirms no residue.
- **Steps:**
  - [ ] 1. Remove the Row + handler + setting (`YouScreen.js`, `theme.js`).
  - [ ] 2. Remove `gamify` plumbing + unwrap all conditionals (`RitualsApp.js`, `HomeScreen.js`, `ArchiveScreen.js`); delete the off-state fallback UI.
  - [ ] 3. Remove the dev-harness `gamify` knob (`DevPanel.js`, `buildState.js`).
  - [ ] 4. Residue check: `grep -ri gamif src/` returns **nothing** except the unrelated `icons.js` "Gamification icons" section comment (a code-section header for shared icon defs — leave the icon definitions; the Diamond import in `YouScreen` must be gone). Clean up that comment too if desired.
  - [ ] 5. `npm test` green (≥ 218); `npx expo export --platform android` clean.
- **Commit:** `refactor(gamify): remove the Gamification toggle — always on, no residue (IMP-026)`
- **Acceptance:** No "Gamification" row in You → Preferences; Home always shows the goal ring / quests / achievements regardless of any old saved state; Archive always shows moods; no crash for a returning user who previously had it off. Grep shows no live `gamify` references in `src/`.
- **Ship after merge:** OTA `eas update --branch production`.

---

## Open items / blockers

- **⏳ CURRENT BLOCKER (Phase 10a.6):** Free release is in Play review; production publish is gated by the **closed-testing 12×14 requirement** (12 testers continuously opted in for 14 days). Owner recruiting testers since 2026-06-06 — nothing to code, purely a Play Console / community process. Production unlocks ≈ 14 days after 12 testers are continuously in. When back, owner may bring **bug fixes / improvements** rather than continuing the phase ladder.
- **IMP-006 (Android Auto Backup):** ✅ **shipped** in the **v1.0.1 / versionCode 7** build (Release-Lane: build trailer on `3987bd2`, pushed to `main` 2026-06-14). Code is in closed testing; only remaining task is **owner device verification** of the backup → uninstall → reinstall → restore cycle + a Play data-safety confirm. (Steps in build-log.)
- **IMP-020 (Backup / Restore):** ✅ **shipped** in the same **v1.0.1 / versionCode 7** build (native deps bumped in `08e3d2e` "bump build for backup/restore native deps"). Code-complete + unit-tested + in closed testing; only remaining task is the **owner device/emulator smoke test** (export → save → restore → recovery copy; non-backup-file error toast; settings deep-link).
- **IMP-021 (Lifetime Progress):** code-complete; OTA lane — no ship trailer applied. Owner decides when to push. Manual smoke test pending (owner-device: empty state; 1-entry heatmap; multi-week heatmap; "Your patterns" heading; no "Days kept"/"This month" tiles).
- **iOS (Phase 11):** ⛔ blocked on a Mac / EAS macOS + Apple Developer Program enrollment. Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-06-14 — IMP-023 COMPLETE (code-complete; OTA lane; no ship trailer). Dynamic daily text — owner wanted the app to stay fully offline but have the greeting + some text vary daily. Brainstormed (visual companion) → scoped to **two offline rotating slots**: (1) **multilingual hello headline** — stateless date-seeded pick from `HELLOS` ×16; English time-of-day ("Good morning") demoted to the subtitle by the date; header rebuilt as **Layout A** (utility row w/ EmberPill+toggle on top, full-width greeting below) to fix the long-hello-vs-cluster crowding; (2) **daily reflection prompt** in the write card (only when `!done`; auto-hides at "Today is at rest.") via a persisted **no-repeat deck** (`promptDeck`) over `PROMPTS` ×60 (≈2-month recycle). New pure modules `src/time/dailyPick.js`, `src/content/{greetings,prompts,deck}.js` (all TDD'd); `promptDeck` added to `PERSISTED_KEYS` (no migration); `RitualsApp.js` computes+persists the deck and passes `dailyPrompt`; `HomeScreen.js` header+card. All new UI uses theme tokens (day/night/nightV2 + accent safe). `npm test` → **218 passed, 29 suites** (4 new suites). `npx expo export --platform android` bundles clean (exit 0). 7 commits f7ae548…5f686f8 (spec 6af3215), merged to main (fast-forward). Full spec archived to build-log. NEXT: owner manual smoke test (header both modes + custom accent; greeting/prompt stable within a day; prompt rotates daily no early repeats; auto-hide when done). No ship until owner says go._

_2026-06-18 — IMP-024 COMPLETE (code-complete; OTA lane; no ship trailer). 🔴 Streak now **derives from real entries** instead of a persisted counter — a missed day breaks it to 0, re-logging after a gap restarts at 1, consecutive days count up. TDD-first: new pure `currentStreak(keys, todayKey)` in `src/insights/dateKeys.js` (anchor = today if logged else yesterday-still-alive else 0; counts consecutive days back; empty → 0). `RitualsApp.js` streak is now `useMemo(currentStreak(entries…))` — every screen prop + `deriveAchievements` corrects automatically; `setStreak` + streak persistence (PERSISTED_KEYS, autosave, currentSlice, v1 migrator) all removed (old stored streak ignored, no schema bump). `completeEntry.applyCompletion` derives `celebrate.streak` continuity-aware for the milestone lookup; dead top-level `streak` dropped from both branches. Dev harness `buildState.js` no longer emits a `streak` field (the Streak knob drives `entryCount`, so the run derives the right number). Updated 3 pre-existing tests that asserted the removed persisted streak (backup→xp; v1 migration; dev buildState→derived). `npm test` → **250 passed, 32 suites**. Commit `ac3f3c6`; full spec archived to build-log. NEXT: owner acceptance via dev harness (3-day run → 3; skip → 0; log again → 1; same-day re-write no bump). Then IMP-025 (editable name) / IMP-026 (remove gamify toggle). Ship OTA after branch merges._
