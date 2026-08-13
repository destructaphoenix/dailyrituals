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

> **▶️ [IMP-055](docs/specs-open.md#imp-055--manage-your-feelings) is the live build task.**
> Four specs left (055, 058, 059, 060) — **all OTA, none needs a `bump:native`**, no ordering
> constraints, take them in table order.
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
track the owner self-tests on. **All five open specs are OTA-lane and land on `alpha` alone.**
Self-testing on `internal` needs a **build**, not an update. (General rule: once a `bump:native` lands, the
OTA lane is closed for that release until the build ships.)

**⚠️ OTA has no Play track.** `eas update` publishes to Expo's CDN — no Google, no review. Gated only by
**channel** (`production`) + **matching `runtimeVersion`**. An installed build receives an OTA regardless of
which track it came from.

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **Legacy Architecture**
(`newArchEnabled: false`, held deliberately) · `targetSdkVersion` **36**, `minSdk` **24** · `npm test` →
**698 passed, 70 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

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
| **055** | **Manage your feelings — rename / re-emoji / remove** | OTA | ⬜ [spec](docs/specs-open.md#imp-055--manage-your-feelings) |
| **060** | **A candle burns without telling you** | OTA | ⬜ [spec](docs/specs-open.md#imp-060--a-candle-burns-without-telling-you) |
| **059** | **The app has one accessibility label** | OTA | ⬜ [spec](docs/specs-open.md#imp-059--the-app-has-one-accessibility-label) · walk = WALK-14 |
| **058** | **Prompt packs — grief / gratitude / change** | OTA | ⬜ [spec](docs/specs-open.md#imp-058--prompt-packs) |

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

_2026-08-13 (IMP-054, the reminder you can actually answer) — **code-complete, committed `18d8c2e`, not
shipped.** New pure `src/reminders/route.js` (`isOurReminder`, `reminderAction`) decides what a reminder
notification means; `io.js` gained `setForegroundBehavior`/`onNotificationReceived`/`onNotificationTapped`
(same lazy `load()` no-op guard as the rest of the file) and `RitualsApp.js` wires two new effects beside
the existing reminder ones. Two gaps closed: a reminder firing while the app is open now shows an in-app
Toast instead of nothing (Android drops the OS banner entirely once `shouldPlaySound: false`, which is
unavoidable — that's *why* the Toast exists, not a bug); tapping a reminder from outside the app now opens
WriteFlow, covering both the live-listener and cold-start (`getLastNotificationResponseAsync`) cases.
**Composed correctly with the out-of-band duplicate-fire fix** (`b773352`) — `scheduleAt(date, { title,
body, data }, identifier)`, all three args, confirmed against the real signature before editing. 9 new
tests. `npm test` → **698 passed, 70 suites**; `npx expo export` clean. Also archived IMP-054's spec to
`docs/build-log.md`, corrected a stale IMP-031→IMP-054 tap-routing misattribution there, and folded the
now-resolved duplicate-reminder Open-items note into build-log's "Resolved findings". Runtime proof is
**WALK-13**, not run this chat. NEXT: **IMP-055** (`docs/specs-open.md#imp-055--manage-your-feelings`)._

_2026-08-13 (IMP-053 + workflow restructure, Opus session) — **IMP-053 code-complete, committed `f7dbca3`,
not shipped.** New pure `src/insights/snippet.js` (`foldChar`/`foldChars`/`indexOfSeq`/`entrySnippet`) +
exported `ResultLine` in `ArchiveScreen.js`: search results now quote the matched words with the hit
highlighted, and label the line `wished ·` when the match came from that field. **The whole design exists
because `foldDiacritics` is not length-preserving and emoji are surrogate pairs** — folding per code point
keeps folded index n ↔ original code point n; a naive `indexOf` would mis-highlight only for users writing
accents or emoji. 28 + 6 new tests. `npm test` → **689 passed, 69 suites**; `npx expo export` clean.
Also this session: `b773352` fixed duplicate reminders (see Open items); `d6f5d75` recorded API-36
compliance closing account-wide; `ef41206` split the walk queue out of the build queue — IMP-054 and
IMP-059 no longer end in a walk, those became WALK-13/WALK-14, and every walk row now states its target
(emulator/device) and runner (owner/agent). PROGRESS.md trimmed 476 → ~230 lines by moving monetization
strategy + Phase 10b to the playbook and resolved findings to the build-log. NEXT: **IMP-054** — read the
⚠️ in its step 2 first._
