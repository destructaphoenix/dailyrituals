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
| IMP-025 | Edit your name in the app — make `settings.name` changeable from the You tab (currently only set once in onboarding) | OTA | ✅ code-complete — full detail in build-log |
| IMP-026 | Remove the Gamification toggle entirely — gamification is always on; delete the setting + switch + all `gamify` gating, no residue | OTA | ✅ code-complete — full detail in build-log |

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

## Open items / blockers

- **⏳ CURRENT BLOCKER (Phase 10a.6):** Free release is in Play review; production publish is gated by the **closed-testing 12×14 requirement** (12 testers continuously opted in for 14 days). Owner recruiting testers since 2026-06-06 — nothing to code, purely a Play Console / community process. Production unlocks ≈ 14 days after 12 testers are continuously in. When back, owner may bring **bug fixes / improvements** rather than continuing the phase ladder.
- **IMP-006 (Android Auto Backup):** ✅ **shipped** in the **v1.0.1 / versionCode 7** build (Release-Lane: build trailer on `3987bd2`, pushed to `main` 2026-06-14). Code is in closed testing; only remaining task is **owner device verification** of the backup → uninstall → reinstall → restore cycle + a Play data-safety confirm. (Steps in build-log.)
- **IMP-020 (Backup / Restore):** ✅ **shipped** in the same **v1.0.1 / versionCode 7** build (native deps bumped in `08e3d2e` "bump build for backup/restore native deps"). Code-complete + unit-tested + in closed testing; only remaining task is the **owner device/emulator smoke test** (export → save → restore → recovery copy; non-backup-file error toast; settings deep-link).
- **IMP-021 (Lifetime Progress):** code-complete; OTA lane — no ship trailer applied. Owner decides when to push. Manual smoke test pending (owner-device: empty state; 1-entry heatmap; multi-week heatmap; "Your patterns" heading; no "Days kept"/"This month" tiles).
- **iOS (Phase 11):** ⛔ blocked on a Mac / EAS macOS + Apple Developer Program enrollment. Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-06-18 — IMP-025 COMPLETE (code-complete; OTA lane; no ship trailer). Editable display name — You tab Preferences now has a **"Your name"** row (UserIcon) that opens a bottom-sheet `NameEditModal`. TDD-first: `sanitizeName(input)` pure helper added to `src/profile/identity.js` (trim, cap 40 chars, null for blank) — 7 new cases. `NameEditModal.js` (new presentational component, slide modal, TextInput prefilled, Save disabled when blank, backdrop dismiss). `YouScreen.js`: added `UserIcon` + `NameEditModal` imports, local `editingName` state + `saveName` handler → `setSettings({ ...s, name: clean })`. Home greeting updates automatically (reads `settings.name`). `npm test` → **257 passed, 32 suites**. Commit `74965c8`._

_2026-06-18 — IMP-026 COMPLETE (code-complete; OTA lane; no ship trailer). Gamification is now always on — deleted the `Gamification` Switch row + `setGamify` handler + `Diamond`/`Switch` imports from `YouScreen.js`; `gamify: true` from `DEFAULT_SETTINGS` in `theme.js`; `const gamify = settings.gamify !== false;` from `RitualsApp.js`; and `gamify` prop from `HomeScreen` + `ArchiveScreen`. Unwrapped all 4 `{gamify && …}` blocks in `HomeScreen` (streak hero, quests, week strip, badges) to always render; deleted the `{!gamify && …}` "gentle peek" fallback + now-unused `SAMPLE_ENTRIES` import. `ArchiveScreen`: heatmap and mood chips always show. Dev harness: `gamify` knob removed from `DevPanel.js` + `buildState.js`. Old installs with a stale `settings.gamify` in AsyncStorage are harmless — nothing reads it (no migration needed). Residue check: `grep -ri gamif src/` returns only the always-used `gamify.js` component module + its imports. `npm test` → **257 passed, 32 suites** (unchanged). `npx expo export --platform android` clean. Commit `fd887c0`. NEXT: IMP-022 (Save as PDF + About sheet — BUILD lane; batch with Annual Recap)._
