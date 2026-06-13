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
| IMP-020 | Backup / Restore — user-held JSON export (off-device) + restore-by-replace with auto safety copy; surface Android Auto Backup | **Build** | ⬜ open — first of the "legacy" roadmap |

### Open task specs

**IMP-020 — Backup / Restore ("Your journal is safe")** · Lane: **BUILD** (new native deps; rides IMP-006's build)

> First piece of the four-part "legacy" roadmap (D → A+B → C). Lets users keep their journal safe & portable **with no account**. Full design + per-step TDD code live in dedicated docs — **read them, they ARE the spec for this task:**
> - Design (the why): [`docs/superpowers/specs/2026-06-14-backup-restore-design.md`](docs/superpowers/specs/2026-06-14-backup-restore-design.md)
> - Plan (the how — 8 tasks, exact code, commits): [`docs/superpowers/plans/2026-06-14-backup-restore.md`](docs/superpowers/plans/2026-06-14-backup-restore.md)

Work the plan's tasks **in order**, committing per task with the message each task gives:

- [ ] Task 1 — persist `lastBackupAt` (PERSISTED_KEYS) + test
- [ ] Task 2 — pure backup core `src/backup/backup.js` (createBackup/readBackup/backupFilename) + tests
- [ ] Task 3 — `lastBackupLabel` subtitle formatter + tests
- [ ] Task 4 — `importFlow` (recovery-before-replace guarantee) + tests
- [ ] Task 5 — install `expo-file-system`/`expo-sharing`/`expo-document-picker`; `io.js` wrapper; jest mocks
- [ ] Task 6 — wire `doExport`/`doImport` into RitualsApp + replace-all remount in App.js
- [ ] Task 7 — You-tab "Your journal is safe" section + relabel PDF stub → "Save as PDF"
- [ ] Task 8 — full suite + manual smoke test + `npm run bump:build` + archive this block to build-log

**Key constraints:** import REPLACES (writes a recovery copy first — see Task 4); the word "Export" must not appear twice in Settings (backup = "Back up"/"Restore", PDF = "Save as PDF"); Auto Backup native config (`allowBackup`) is already in `app.config.js` (IMP-006) — Task 6/7 only *surface* it. Ship lane is **BUILD**: `npm run bump:build`, `Release-Lane: build` trailer only if the owner asks to ship.

When IMP-020 is code-complete, archive this whole block to [`docs/build-log.md`](docs/build-log.md), leaving only its backlog row.

---

## Open items / blockers

- **⏳ CURRENT BLOCKER (Phase 10a.6):** Free release is in Play review; production publish is gated by the **closed-testing 12×14 requirement** (12 testers continuously opted in for 14 days). Owner recruiting testers since 2026-06-06 — nothing to code, purely a Play Console / community process. Production unlocks ≈ 14 days after 12 testers are continuously in. When back, owner may bring **bug fixes / improvements** rather than continuing the phase ladder.
- **IMP-006 (Android Auto Backup):** code done; needs **owner device verification** of the backup → uninstall → reinstall → restore cycle + a Play data-safety confirm. Rides the v5 build. (Steps in build-log.)
- **iOS (Phase 11):** ⛔ blocked on a Mac / EAS macOS + Apple Developer Program enrollment. Phase 6 iOS real-billing row is blocked on the same.

---

## Last session note

_History archived in [`docs/build-log.md`](docs/build-log.md) → "Session notes". Only the two newest notes stay here; every chat moves the older one out when it appends a new one (see DEVGUIDE Step 4)._

_2026-06-13 — IMP-019 COMPLETE (shipped OTA) — Round 4 `NightRays` hero owner-approved + promoted. `DARK_THEME` set to `'v2'`; default-guard test updated (`'classic'`→`'v2'`). `npm test` → **154 passed, 20 suites**. Committed with `Release-Lane: ota` trailer — CI will ship to `production` on owner approval. Dark mode is now: true-black AMOLED canvas, near-black elevated cards + hairline borders, amber-only accents, rotating golden sunburst + warm central bloom behind the glowing streak number. Revert anytime: flip `DARK_THEME='classic'` + OTA._

_2026-06-13 (workflow optimization, Opus) — Restructured the cross-chat docs to stop PROGRESS.md bloat: split into 3 tiers by read-frequency. PROGRESS.md = lean live cursor (backlog table + open specs + blockers + 2 notes). New `docs/playbook.md` = stable reference (locked decisions, release/signing rules, parked phases 8/10b/11, config, architecture, IMP template). `docs/build-log.md` = archive — moved IMP-006 + IMP-013–019 full specs there (they were code-complete but never archived → the bloat). DEVGUIDE updated for the new file map + a hard size budget. No progress lost (git is the full record). NEXT: owner is bringing a list of new things to add → Opus scopes them as new IMP blocks in the "Open task specs" section above._
