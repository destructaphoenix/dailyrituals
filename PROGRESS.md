# Daily Rituals — Build Progress (live cursor)

> **The memory between chats. Read top-to-bottom every chat — and keep it SMALL.** Only: the ACTIVE
> TRACK, the backlog table, live blockers, and the **2 newest** session notes.
>
> - **Open IMP specs → [`docs/specs-open.md`](docs/specs-open.md).** **Open the ONE spec you are building
>   and no others** — every other spec there is for a different chat.
> - **Open runtime walks → [`docs/walk-open.md`](docs/walk-open.md).** Same rule: **one walk, not the file.**
>   A failed walk is not fixed in place — it becomes a new `IMP-xxx` row here.
> - Stable reference (locked decisions, release/signing rules, monetization strategy, parked phases
>   8/10b/11, config, architecture) → [`docs/playbook.md`](docs/playbook.md) — open only when you need it.
> - Finished specs, resolved findings, older session notes → [`docs/build-log.md`](docs/build-log.md).
>   Git is the full record.
> - How to drive a Sonnet chat → [`DEVGUIDE.md`](DEVGUIDE.md).
>
> **Size budget (hard rule, ≤250 lines):** the moment a task is **code-complete** (don't wait for ship or
> walk), move its spec to `docs/build-log.md` and leave only its one-line row below. Specs never live
> inline here. Resolved blockers move out too — this file carries what is **live**, not what was.

---

## ▶️ ACTIVE TRACK

**One chat does exactly ONE task, and there are two kinds. Take whichever you were sent here for:**

| Chat type | Queue | Take |
| --- | --- | --- |
| **Build task** | [`docs/specs-open.md`](docs/specs-open.md) | the **first ⬜ `IMP-xxx`** in the backlog below — its row links to the spec |
| **Runtime walk** | [`docs/walk-open.md`](docs/walk-open.md) | the **first ⬜ `WALK-nn`** in that file's own index |

**Never both in one chat.** A spec is **code-complete at `npm test` green + `npx expo export` clean** — its
runtime proof is a separate WALK row for a separate chat, so a missing walk is *not* an unfinished spec.
Neither queue is the phase ladder (8 / 10b / 11), parked in [`docs/playbook.md`](docs/playbook.md).

> **The build queue is EMPTY** — IMP-061 was the last open spec and it is code-complete (2026-08-14,
> `ca850d7`). A build chat arriving now has nothing to take and should say so rather than inventing a task;
> the next `IMP-xxx` is Opus's to scope. A **walk** chat still has work — the first ⬜ row in
> [`docs/walk-open.md`](docs/walk-open.md).
>
> **`IMP-057` is reserved, not missing** — the historical `dayKey` migration IMP-056 deferred. It needs a
> real device's numbers from the dev-panel Inspector → "Data health" before it can be scoped (see Open
> items). **Do not reuse the number.**
>
> **IMP-044 does not claim a queue slot.** Config-only, code-complete, unbumped on purpose — it **rides
> whichever build is cut next**. Don't "start" it; it needs only its device walk (WALK-12).

**App status — all four Play tracks, read from the Play Developer API 2026-08-13. Authoritative; do not
re-derive from an older note.**

| Track | Active | API | Note |
| --- | --- | --- | --- |
| `production` (public) | **1.0.3 / vc9** | 36 ✅ | live since 2026-07-30 |
| `beta` (open testing) | **1.0.3 / vc9** | 36 ✅ | was vc8/API 35 — promoted, compliance gap closed |
| `alpha` (closed testing) | **1.0.5 / vc11** | 36 ✅ | frozen by design 2026-08-08; the newest *built* code |
| `internal` | **1.0.3 / vc9** | 36 ✅ | was vc5/API 35 — promoted, compliance gap closed |

**✅ API-36 compliance (deadline 2026-08-31) is met ACCOUNT-WIDE — blocker CLOSED 2026-08-13.** Every
active release on every track is `targetSdkVersion 36`. Banner-reading procedure kept in the playbook.

**Builds auto-submit to `internal`** (`eas.json` → `submit.production.android.track`, set 2026-08-08 in
`a299af7`; CI already does it). Reaching the public stays manual: promote `internal` → `production` in Play
Console, which *does* get the full review.

**⚠️ The OTA lane reaches the `alpha` cohort ONLY.** `runtimeVersion` = `appVersion` = **1.0.5** matches
**only vc11**, which lives **only on `alpha`**. Promoting vc9 onto `internal` for compliance means
`internal` now serves the same 1.0.3 as the public — so an `eas update` reaches neither the public nor the
track the owner self-tests on. **Every unshipped OTA-lane spec since vc11 lands on `alpha` alone.**
Self-testing on `internal` needs a **build**, not an update. (General rule: once a `bump:native` lands, the
OTA lane is closed for that release until the build ships.)

**⚠️ OTA has no Play track.** `eas update` publishes to Expo's CDN — no Google, no review. Gated only by
**channel** (`production`) + **matching `runtimeVersion`**. An installed build receives an OTA regardless of
which track it came from.

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **Legacy Architecture**
(`newArchEnabled: false`, held deliberately) · `targetSdkVersion` **36**, `minSdk` **24** · `npm test` →
**764 passed, 78 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

---

## 🔧 Improvements backlog (post-launch — ACTIVE TRACK)

Opus scopes each owner-filed issue into a numbered `IMP-xxx` spec in
[`docs/specs-open.md`](docs/specs-open.md). Sonnet takes the **first ⬜** row, opens **only that spec**,
executes it, commits with the exact message given, ticks the row, moves the spec to `docs/build-log.md`, and
writes the session note. **Full detail for every ✅ row is in [`docs/build-log.md`](docs/build-log.md).**

| ID | Title | Lane | Status |
| --- | --- | --- | --- |
| 001–005 | Early post-launch fixes (name, greeting/date, streak, zero-state, login step) | OTA | ✅ shipped |
| 006 | Android Auto Backup — new-device restore, no login | Build | ✅ shipped + device-verified 2026-07-30 |
| 007 | Streak stops stacking on same-day entries | OTA | ✅ |
| 008 | Real zero-state: level from XP, calendar + week strip from entries | OTA | ✅ |
| 009 | Insights from real entries (kill hardcoded STATS/MOOD_MIX/RHYTHM) | OTA | ✅ |
| 010 | Onboarding only on first ever launch | OTA | ✅ |
| 011 | Kill the last hardcoded "31 May" | OTA | ✅ |
| 012 | Achievements + Keepsakes start fresh, derived from real data | OTA | ✅ |
| 013 | "Tend an old grave" rite starts at 0 + real completion trigger | OTA | ✅ |
| 014 | Missed days show 💀, not a blank cell | OTA | ✅ |
| 015 | Name is mandatory in onboarding | OTA | ✅ |
| 016 | Header flame icon proportional + centered | OTA | ✅ |
| 017 | Greeting by the user's local time | OTA | ✅ |
| 018 | Today's reflection is editable | OTA | ✅ |
| 019 | True-black AMOLED dark mode + rotating-rays hero | OTA | ✅ promoted |
| 020 | Backup / Restore — user-held JSON export + restore-by-replace | Build | ✅ shipped + device-verified 2026-07-30 |
| 021 | Lifetime Progress | OTA → vc11 | ✅ shipped vc11; shortfall closed by 045 |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 023 | Dynamic daily text — rotating greeting + prompt deck | OTA | ✅ |
| 024 | Streak counts real consecutive days | OTA | ✅ |
| 025 | Edit your name in the app | OTA | ✅ |
| 026 | Remove the Gamification toggle entirely | OTA | ✅ |
| 027 | Expo SDK 51→54 for `targetSdkVersion` 36 | Build | ✅ shipped v1.0.3 / vc9 |
| 028 | Billing correctness — live store prices, sim guard | OTA → vc11 | ✅ shipped to testers |
| 029 | Tell the user their data came from a Google backup | Build | ✅ **device-verified 2026-08-02** |
| 030 | Layout can't blow out — row auto-stack + font-scale cap | OTA+Build → vc11 | ✅ **device-verified 2026-08-02** |
| 031 | Daily reminder is real | Build | ✅ **device-verified 2026-08-02** |
| 032 | Dev harness v2 — total control + inspection | Dev-only | ✅ **device-walked 2026-08-02** |
| 033 | The restore is offered, not imposed (quarantine + offer) | OTA | ✅ |
| 034 | Hide "Gather Embers" while the app ships free | OTA | ✅ |
| 035 | Search your journal — full-text over `did`/`wished` | OTA | ✅ |
| 036 | Custody of your words — edit/delete/30-day trash | OTA | ✅ |
| 037 | Moods: custom + multiple per entry | OTA | ✅ |
| 038 | "On this day" resurfacing | OTA | ✅ |
| 039 | Streak-freeze candles actually spend themselves | OTA | ✅ |
| 040 | "Keepsake" means one thing now | OTA | ✅ |
| 041 | Teach the app — tips + explainers | OTA | ✅ |
| 042 | The Keepsakes screen scrolls | OTA | ✅ |
| 043 | Recoverability pass — re-verify entitlement, backup health | OTA | ✅ |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, unbumped, UNWALKED** — rides the next build; walk = WALK-12 |
| 045 | Finish Lifetime Progress (missed-day painting + XP line) | OTA | ✅ |
| 046 | Annual Recap — "your year, remembered" | OTA | ✅ |
| 047 | Deeper insights — the Plus analysis layer | OTA | ✅ |
| 048 | Three free trash restores, then Plus | OTA | ✅ + emulator-walked 2026-08-09 |
| 049 | Settings survive a corrupt restore | OTA | ✅ |
| 050 | Every mood gets a face — emoji picker + fallback glyphs | OTA | ✅ 2026-08-10 |
| 051 | The keyboard stops eating the Next button | OTA | ✅ + emulator-walked 2026-08-10 |
| 052 | Tap a day on either heatmap, read it | OTA | ✅ 2026-08-13 |
| 053 | Search shows you the match (snippet + highlight) | OTA | ✅ 2026-08-13 |
| 056 | A day is the day you lived, not the day in Greenwich | OTA | ✅ + emulator-walked 2026-08-10 |
| 054 | The reminder you can actually answer | OTA | ✅ code-complete 2026-08-13 · walk = WALK-13 |
| 055 | Manage your feelings — rename / re-emoji / remove | OTA | ✅ code-complete 2026-08-13 |
| 060 | A candle burns without telling you | OTA | ✅ code-complete 2026-08-13 |
| 059 | The app has one accessibility label | OTA | ✅ code-complete 2026-08-13 · walk = WALK-14 |
| 058 | Prompt packs — grief / gratitude / change | OTA | ✅ code-complete 2026-08-14 |
| 061 | Store screenshots build themselves | Dev-only | ✅ code-complete 2026-08-14 · walk = WALK-15 |

---

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track and Phase 10b are in [`docs/playbook.md`](docs/playbook.md) → "Monetization strategy".

### ▶️ Owner decisions still open

- **Promote vc11 `alpha` → `production`, or hold.** Testers have five features the public does not
  (021/028/029/030/031). Nothing blocks it technically — it is a judgement call on how much tester feedback
  to gather first. **Until it happens, every vc11 feature is unshipped from the public's point of view, and
  every OTA since is unreachable by anyone but `alpha`.**
- **Cash embers: settled in principle (dropped 2026-08-03), not finalised.** Must be decided before
  `PLUS_ENABLED` flips — it determines which Play products get created. Full argument in the playbook.
- **`PLUS_ENABLED` must not flip until every `PLUS_PERKS` line is true.** The one remaining gap is perk #6,
  the PDF (IMP-022, deferred). Gate checklist in the playbook → Phase 10b.

### 🟡 IMP-056 residual + the IMP-057 decision (2026-08-10)

`dayKey` is now derived locally, closing the 1am-overwrite / missing-evening-entry defect (walked both
offset directions). **Existing entries were deliberately not migrated**, and two things outlive it:

- **The residual:** old entries keep their UTC key. For ~a day after shipping, a negative-offset user can
  still have last evening's *already-stored* entry answer to today's key. New writes are correct
  immediately; old data self-heals as those keys age out. Nothing to act on.
- **IMP-057 is the owner's decision, not a build chat's.** The Inspector's "Data health" group reports how
  many rows disagree with `dayKeyOf()` and whether remapping moves `currentStreak`. **It reads 0 on the
  emulator fixture — meaningless**, because `gen-v2-fixture.js` seeds ids that don't match the shape the
  reporter keys on. **Real device numbers have never been read.** Once they exist, IMP-057 can be scoped —
  noting that remapping can move an entry off a day and **break a currently-alive streak**: correct, but it
  will read as a regression to whoever it happens to.

### 🟢 IMP-044 — the standing build-lane debt

R8 is on for release builds (config-only, 2026-08-08). **Jest cannot prove it** — the failure mode is
silent stripping at runtime, not a compile error. Whenever the next build is cut, walk every
reflection-facing surface: reminders + tap routing · paywall prices + Restore purchases · JSON export
**and** restore · `eas update` applies · SVG icons · fonts · restore notice. Confirm the win: bundle
explorer shows **no `expo.modules.devlauncher` classes**. Full checklist: **WALK-12**.

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS
  real-billing row is blocked on the same.

---

## Last session note

_Only the **two newest** notes stay here; each chat moves the older one into
[`docs/build-log.md`](docs/build-log.md) → "Session notes". Keep them to the shape below: what finished,
the proof, the exact next step._

_2026-08-14 (IMP-061, store screenshots build themselves) — **code-complete, committed `ca850d7`, not
shipped; Dev-only lane so there is nothing to ship.** All 8 spec steps done in order. New
`scripts/shots.config.js` (the manifest — 7 shots, frozen 1080×1920 canvas, caption copy verbatim from the
spec), `scripts/shots.js` (the compositor: `fitRect` / `stripAlpha` / `assertPlayLegal` / `buildSvg` /
`renderShot` / `buildAll`, plus a CLI), `scripts/shots.sh` (`chmod +x`; asserts exactly one `adb` device and
`maestro` on PATH, cleans `store/raw/`, sets the demo-mode status bar, runs maestro, exits demo mode **in a
trap**, then composes), `.maestro/store-shots.yaml`, and `__tests__/shots.test.js`. `package.json` gained
`@resvg/resvg-js` + `pngjs` devDeps and `"shots": "bash scripts/shots.sh"`; `.gitignore` gained `store/raw/`
(`store/play/` stays committed). App-side changes are the three dev-only files the spec named and nothing
else: the `storeShots` scenario row, `Apply dev state` on StateSection's Apply, `Close the dev panel` on
DevPanel's Close. **Selectors were read out of the real code, not guessed** — tabs `Today`/`Insights`/
`Reflections`/`You`, the `v1.0` long-press row at `YouScreen.js:296`, search placeholder `Search your
journal`, `walk` as the search term (it appears in every `LONG_DIDS`/`LONG_WISHES` string), and
**Achievements' close label is `Close Keepsakes`, not "Close achievements"** — the spec's example didn't name
it. `done: true` prefills WriteFlow, so `Next` is live for the 02→03 step pair. The `Launch overlays`
collapsible is `defaultOpen={false}`, so the flow taps it open before `Achievements`/`Shop`. **Proof:** `npm
test` → **764 passed, 78 suites** (was 748/77; the 16 new tests add ~70s, dominated by 4 real resvg
renders). `npx expo export --platform android` clean. `node scripts/shots.js` run against 7 synthetic raws
in **three different source shapes** (1440×3120, 1080×2400, 1080×1920) produced 7 × `1080x1920 colourType 2`;
`fitRect` returns exactly `{x:210, y:400, w:660, h:1430}` for 1440×3120, matching the spec's ASCII layout
contract to the pixel; both fonts render from the bundled TTFs with `loadSystemFonts: false`; the
missing-raw path exits 1 naming the id. **The synthetic outputs were deleted, not committed** — `store/play/`
is for real captures, which only WALK-15 can make. LAST command: `git commit` → `ca850d7`. Archived
IMP-061's spec to `docs/build-log.md`, emptied `docs/specs-open.md`'s index (queue is now empty), moved the
IMP-059 note down to the build log (2-note budget), and **unblocked WALK-15** in `docs/walk-open.md`.
**Heads-up, not acted on (out of this spec's scope): WALK-13 and WALK-14 still read "blocked until IMP-054 /
IMP-059 lands" — both landed 2026-08-13, so those two rows are stale-blocked and are actually ready.**
NEXT: **no open IMP spec — the build queue is empty**; a build chat should stop and say so rather than
invent one. A walk chat should take **WALK-02** (restore quarantine, first ⬜, runner 👤) or **WALK-15**
(store screenshots, runner 🤖 mostly — needs maestro installed and a second AVD for its step 4)._

_2026-08-14 (WALK-01, v2→v3 mood migration) — **full pass, all 9 steps, agent-run on the emulator.** Backlog
was empty (IMP-058 was the last spec, already code-complete), so this chat took the first ⬜ row in
`docs/walk-open.md` instead — steps 1–2 had already passed 2026-08-09, steps 3–9 (the actual point: mood-chip
correctness on migrated data) were outstanding. Regenerated the v2 fixture, reset the app (non-negotiable —
clears the 2026-08-09 attempt's poisoned settings), completed fresh onboarding, restored the fixture. Every
check passed: archive/Home matched spec exactly (12-day streak, "Migration Test", 375 embers, 2 candles,
Lv 4 · Reflective); the two-mood entry rendered both chips and both no-mood entries rendered none, no blank
chip anywhere; Insights "across 10 reflections" denominator correct; mood-chip filtering matched the two-mood
entry on **either** mood; text search worked; writing today's entry confirmed multi-select and ticked "Name
how it felt"; force-stop + relaunch re-read cleanly with no crash or re-migration; harness Inspector showed
schema version 3, `dayKey drift: 0`, and every fixture-omitted field as an empty collection, not `undefined`.
**No app defects found — WALK-01 is closed.** Full step-by-step detail moved to `docs/build-log.md` → "Walk
log"; `docs/walk-open.md`'s index row updated to ✅ and its body section removed (only the index row
remains, per that file's own size discipline). Moved the IMP-058 session note into `docs/build-log.md` too
(this file's 2-note budget). NEXT: **still no open IMP spec** — the next build chat waits on Opus to scope a
new `IMP-xxx`. The next *walk* chat should take **WALK-02** (restore quarantine) — first ⬜ row in
`docs/walk-open.md` now — but note its runner is 👤 owner (clock changes + judgement on sheet copy), not
agent-drivable like WALK-01 was._
