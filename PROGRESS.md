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

---

## Open items / blockers

- **⏳ CURRENT BLOCKER (Phase 10a.6):** Free release is in Play review; production publish is gated by the **closed-testing 12×14 requirement** (12 testers continuously opted in for 14 days). Owner recruiting testers since 2026-06-06 — nothing to code, purely a Play Console / community process. Production unlocks ≈ 14 days after 12 testers are continuously in. When back, owner may bring **bug fixes / improvements** rather than continuing the phase ladder.
- **IMP-006 (Android Auto Backup):** code done; needs **owner device verification** of the backup → uninstall → reinstall → restore cycle + a Play data-safety confirm. Rides the v5 build. (Steps in build-log.)
- **IMP-020 (Backup / Restore):** code-complete + unit-tested + bundles clean; needs the **owner device/emulator smoke test** (export → save → restore → recovery copy; non-backup-file error toast; settings deep-link). BUILD lane — rides the same build as IMP-006; no ship trailer applied yet.
- **IMP-021 (Lifetime Progress):** code-complete; OTA lane — no ship trailer applied. Owner decides when to push. Manual smoke test pending (owner-device: empty state; 1-entry heatmap; multi-week heatmap; "Your patterns" heading; no "Days kept"/"This month" tiles).
- **iOS (Phase 11):** ⛔ blocked on a Mac / EAS macOS + Apple Developer Program enrollment. Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-06-14 — IMP-020 COMPLETE (code-complete; device smoke test owner-pending). Backup / Restore — first piece of the "legacy" roadmap (D). Built the full 8-task plan TDD-first: pure core under `src/backup/` (`backup.js` envelope build + validating parse = the single validation boundary, reusing `serialize`/`deserialize`; `lastBackupLabel.js` subtitle; `importFlow.js` recovery-before-replace guarantee) all unit-tested, plus a thin native `io.js` over `expo-file-system`/`expo-sharing`/`expo-document-picker`. Wired `doExport`/`doImport`/`explainAutoBackup` into `RitualsApp.js`, `handleReplaceAllData` + remount `key` into `App.js`, and a new "Your journal is safe" section into `YouScreen.js` (PDF stub relabeled "Save as PDF" — the word "Export" now appears nowhere on the You tab). Import REPLACES but writes a recovery envelope FIRST (never replaces if that write throws). `npm test` → **171 passed, 23 suites** (3 new backup suites: 9+5+2, + 1 state case). `npx expo export --platform android` bundles clean. `npm run bump:build` → versionCode **6**. 8 commits 675e520…08e3d2e; **no `Release-Lane` trailer** (owner hasn't asked to ship). Full spec archived to build-log. NEXT: owner device/emulator smoke test (export→save→restore→recovery; non-backup error toast; settings deep-link) — same gate as IMP-006, the two ride one BUILD shipment. Then legacy roadmap A+B (days-captured hero + Lifetime Progress)._

_2026-06-14 — IMP-021 COMPLETE (code-complete; OTA lane; no ship trailer). Lifetime Progress — second piece of the "legacy" roadmap (A+B). 4 commits, TDD-first. New pure modules: `src/insights/dateKeys.js` (shared `longestConsecutiveRun`/`dayKeyToUtcMs`/`DAY_MS`, extracted from `derive.js`); `src/insights/lifetime.js` (`deriveLifetime` — days remembered, total words, streaks, level/XP, adaptive `activeSpan` label). `buildLifetimeHeatmap` appended to `src/home/calendar.js` (Monday-first week rows from first entry → today). `InsightsScreen.js` restructured: "Your record" section (hero number + 2×2 totals grid + adaptive consistency heatmap) above "Your patterns" heading (unchanged mood mix + rhythm); old "Days kept"/"This month" tiles removed; subtitle updated. `xp` piped from `RitualsApp.js`. `npm test` → **190 passed, 25 suites** (3 new suites: dateKeys 4 tests, lifetime 11, calendar +4 = 20 total). Commits b347dd3…a0d5446. NEXT: owner smoke test (empty state; 1-entry heatmap; multi-week heatmap; "Your patterns" visible) — no ship until owner says go. Then **C — Annual Recap / Time Capsule** (folds in the deferred milestone timeline)._
