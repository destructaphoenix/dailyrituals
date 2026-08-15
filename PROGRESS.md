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

> **The build queue holds FIVE open specs — `IMP-064` … `IMP-068`, scoped 2026-08-15 from the WALK-04/06/07
> findings.** A build chat takes the **first ⬜** row below and opens only that spec. **All five are 🎨: none
> of them gates the release build** — the 🚦 walks still do — so the owner may ship first and OTA these
> after. What must not happen is landing half of them across a `bump:native`. **`IMP-063` (the sixth) landed
> 2026-08-15** — its spec is archived in `docs/build-log.md`.
> **The other live work is WALKS**, risk-ordered: the 🚦 group gates a release carrying ~25 unpublished tasks.
>
> **`IMP-057` is reserved, not missing** — the `dayKey` migration IMP-056 deferred; needs real device
> numbers first (see Open items). **Do not reuse the number.** **IMP-044 claims no queue slot** — it rides
> the next build; don't "start" it, it needs only WALK-12.

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

**⚠️ The OTA lane reaches `alpha` ONLY** — `runtimeVersion` = `appVersion` = **1.0.5** = **vc11**, and vc11
lives only on `alpha`. Self-testing on `internal` needs a **build**, not an update. Full consequence, and
the release sequence that follows from it, in **Open items → the first bullet**.

**⚠️ OTA has no Play track.** `eas update` publishes to Expo's CDN — no Google, no review. Gated only by
**channel** (`production`) + **matching `runtimeVersion`**. An installed build receives an OTA regardless of
which track it came from. (Once a `bump:native` lands, the OTA lane is closed for that release until the
build ships.)

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **Legacy Architecture**
(`newArchEnabled: false`, held deliberately) · `targetSdkVersion` **36**, `minSdk` **24** · `npm test` →
**772 passed, 78 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

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
| 062 | The restore offer outlives the launch that made it | OTA | ✅ code-complete 2026-08-14 · WALK-02 ✅ 2026-08-15 |
| 063 | A saved day looks saved (frozen ≠ missed) | OTA | ✅ code-complete 2026-08-15 · walk = WALK-06 (re-run whole) |
| 064 | Count your candles, and say plainly what one did | OTA | ⬜ **open** — [spec](docs/specs-open.md#imp-064--count-your-candles-and-say-plainly-what-one-did); from WALK-06 (a, b, c) |
| 065 | Clear the search; picked moods come to the front | OTA | ⬜ **open** — [spec](docs/specs-open.md#imp-065--clear-the-search-the-moods-you-picked-come-to-the-front); from WALK-04 (a, b, c) |
| 066 | The mood step stops fighting you | OTA | ⬜ **open** — [spec](docs/specs-open.md#imp-066--the-mood-step-stops-fighting-you); from WALK-04 (d, e) |
| 067 | A stacked row wraps; Mood Mix bars line up | OTA | ⬜ **open** — [spec](docs/specs-open.md#imp-067--a-stacked-row-wraps-mood-mix-bars-start-in-one-place); from WALK-07 (b, c) |
| 068 | The Paywall footer stops covering the price | OTA | ⬜ **open** — [spec](docs/specs-open.md#imp-068--the-paywall-footer-stops-covering-the-price); from WALK-07 (a); **take last** |

---

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track and Phase 10b are in [`docs/playbook.md`](docs/playbook.md) → "Monetization strategy".

### ▶️ Owner decisions still open

- **🔴 ~25 IMP tasks are committed and UNPUBLISHED. Verified against `Release-Lane` trailers in git
  2026-08-14 — the last release of any kind was the vc11 build on 2026-08-02, and the last OTA was
  2026-06-13.** Everything from IMP-032/033 to IMP-061 (search, custody + trash, multi-moods, recap, deeper
  insights, heatmap, `dayKey`, keyboard fix, prompt packs, a11y, mood management) has reached **no track at
  all**. Two independent reasons an OTA **cannot** deliver it: `runtimeVersion` = `appVersion` = 1.0.5
  matches **vc11 only, which lives only on `alpha`**; and the batch touches `app.config.js` / `eas.json` /
  `package.json` / `package-lock.json`, so CI's backstop auto-rejects an `ota` trailer. **The only route is
  a BUILD**, which necessarily carries IMP-044's R8 — the first minified build of this app ever.
  **Sequence: WALK-02 ✅ and WALK-05 ✅ (both 2026-08-15) → clear the remaining 🚦 walks in
  [`docs/walk-open.md`](docs/walk-open.md) (13 → 03 → 12, R8 last on the final candidate) → `npm run bump:native` → `Release-Lane: build` → push → owner approval →
  auto-submits to `internal` → self-test → promote `internal` → `production` by hand** (full review, ~7d).
  The old "promote vc11 → production, or hold" framing is superseded: vc11 is two weeks of work behind HEAD,
  so promoting it would ship a stale build rather than this work.
  **IMP-063…068 are 🎨 and are NOT part of this sequence** — they land either before the bump *in full*, or
  after the build as an OTA. Never split across it. (IMP-063 landed 2026-08-15; IMP-064…068 remain.)
- **Cash embers: settled in principle (dropped 2026-08-03), not finalised.** Must be decided before
  `PLUS_ENABLED` flips — it determines which Play products get created. Full argument in the playbook.
- **`PLUS_ENABLED` must not flip until every `PLUS_PERKS` line is true.** The one remaining gap is perk #6,
  the PDF (IMP-022, deferred). Gate checklist in the playbook → Phase 10b.

### 🔴 WALK-04 finding — search + moods → **scoped as IMP-065 + IMP-066** (2026-08-15)

Base search/filter/heatmap behavior passed as specced (case-insensitive + accent-folding match, zero-results
copy, heatmap correctly not reacting to filters). The five UX defects split cleanly by file: **(a) snippet
label asymmetry, (b) no way to clear the search, (c) selected chips never reorder → IMP-065**
(`ArchiveFilters` / `ArchiveScreen`); **(d) a selected mood chip won't deselect, (e) the custom-mood block
is unreadable and its name field accepts emoji → IMP-066** (`WriteFlow`). Full writeups and the decided
design in [`docs/specs-open.md`](docs/specs-open.md).

**Scoping settled (d), which the walk could not.** The finding flagged that the code contradicted the
observation and asked a build chat to re-confirm on-device. It does not need one: `toggleMood` is a correct
toggle, and the mood-step `ScrollView` ([`WriteFlow.js:121`](src/screens/WriteFlow.js#L121)) is missing the
`keyboardShouldPersistTaps="handled"` that the `did`/`wished` step has. The default `"never"` **spends the
first tap dismissing the keyboard**, and the mood step is the only step carrying text fields — so the tap
that "did nothing" never reached the chip.

**WALK-04 stays ❌** in `docs/walk-open.md` — re-run it whole once IMP-065 and IMP-066 have both landed.

### 🔴 WALK-06 finding — streak insurance → **scoped as IMP-063 + IMP-064** (2026-08-15) · **IMP-063 ✅ landed 2026-08-15**

Every mechanical assertion passed — freeze survival across the `lapsed` scenario, decrement-by-one per
missed day, idempotence on repeat relaunch, celebration streak matching the Home hero, the shop copy. The
four UX defects split by what they touch: **(d) a frozen day is indistinguishable from a missed one
everywhere in the app → IMP-063** (the heaviest of the six — `frozenDays` reaches the streak arithmetic and
nothing else, so no cell builder can paint it — **code-complete, archived in `docs/build-log.md`**);
**(a) + (c) the candle row caps at 3 icons regardless of the real count, and (b) the candle-spent copy is
verbose → IMP-064** (still open). Full writeup and the decided design for IMP-064 in
[`docs/specs-open.md`](docs/specs-open.md).

**One thing from this finding outlives its specs and belongs here as a standing rule.** The owner's
objection to (b) generalises past that one string: **the user must never be unsure what happened, what
changed, or how a feature works.** Read that into any future copy review, not just the freeze card.

**WALK-06 stays ❌** in `docs/walk-open.md` — re-run it whole once IMP-064 has also landed.

### 🔴 WALK-07 finding — modal scroll → **scoped as IMP-067 + IMP-068** (2026-08-15)

Achievements, Shop, the Reading sheet, Get Embers and Manage Subscription all passed at normal **and** max
(2.0x) OS font scale in both nav modes, and the font-scale cap itself is confirmed working
(`PixelRatio.getFontScale()` read `2.0` against the `1.5`/`1.2` caps in
[`src/ui/textScale.js`](src/ui/textScale.js) with nothing broken). Three defects, split by whether the
screen is reachable: **(b) `Row` truncates a value even when stacking gave it a full line, and (c) Mood Mix
bars start at a different x per row at every font size → IMP-067**; **(a) the Paywall's fixed footer
overlaps its own content at normal font size → IMP-068**, which is deliberately **last in the queue** —
`PLUS_ENABLED = false` makes that screen unmountable, so no user can reach the defect in the shipped build.
Full writeups and the decided design in [`docs/specs-open.md`](docs/specs-open.md).

**WALK-07 stays ❌** in `docs/walk-open.md` — re-run it whole once IMP-067 and IMP-068 have both landed.

### 🟡 IMP-056 residual + the IMP-057 decision (2026-08-10)

`dayKey` is now derived locally (walked both offset directions). **Existing entries were deliberately not
migrated**, leaving two things:

- **The residual — nothing to act on.** Old entries keep their UTC key, so for ~a day after shipping a
  negative-offset user can have last evening's *already-stored* entry answer to today's key. New writes are
  correct immediately; old data self-heals as those keys age out.
- **IMP-057 is the owner's decision, not a build chat's.** The Inspector's "Data health" group counts rows
  disagreeing with `dayKeyOf()` and whether remapping moves `currentStreak`. **It reads 0 on the emulator
  fixture — meaningless** (`gen-v2-fixture.js` seeds ids the reporter doesn't key on), and **real device
  numbers have never been read.** Once they exist IMP-057 can be scoped — noting remapping can move an entry
  off a day and **break a live streak**: correct, but it reads as a regression to whoever it happens to.

### 🟢 IMP-044 — the standing build-lane debt

R8 is on for release builds (config-only, 2026-08-08). **Jest cannot prove it** — the failure mode is silent
stripping at runtime, not a compile error. It rides the next build, so it is the **last 🚦 walk**:
full checklist and the reason it goes last are in **WALK-12**.

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS
  real-billing row is blocked on the same.

---

## Last session note

_Only the **two newest** notes stay here; each chat moves the older one into
[`docs/build-log.md`](docs/build-log.md) → "Session notes". Keep them to the shape below: what finished,
the proof, the exact next step._

_2026-08-15 (IMP-063, a saved day looks saved) — **code-complete, committed `b7eb4c3`, not shipped; OTA
lane, rides the next batch.** All 7 spec steps done in order — `FREEZE_EMOJI` added to `src/data.js`; all
three cell builders in `src/home/calendar.js` (`buildHeatmap`/`buildLifetimeHeatmap`/`buildWeekStrip`) took
a third `{ frozenDays = [] }` options arg and now emit `frozen: true` on the branch that used to always emit
`missed`; `cellState` in `src/insights/heatCells.js` gained `frozen` with precedence
`future > frozen > missed > empty > done`; `InsightsScreen.js` got the `frozen` style branch + legend row;
`ArchiveScreen.js`'s `Heat` got the frozen branch **above** the mood branch (it would otherwise fall through
and render 🌫️, since a frozen cell carries neither `missed` nor `empty`) and picked up the two
already-existing-but-unused `MISS_EMOJI`/`FREEZE_EMOJI` exports in place of a hardcoded `'💀'`; `HomeScreen.js`
got the same treatment for the week strip; `RitualsApp.js` threads its existing `frozenDays` state into all
three screens. 10 new tests exactly as specified across `calendar.test.js` (+6), `heatCells.test.js` (+2)
and `ArchiveHeat.test.js` (+2) — no new suite files. **Proof:** `npm test` → **782 passed, 78 suites** (was
772/78). `npx expo export --platform android` clean. LAST command: `git commit` → `b7eb4c3`. Archived
IMP-063's spec into `docs/build-log.md`, dropped its row from `docs/specs-open.md`'s index (queue is now
IMP-064…068, five specs), ticked its `PROGRESS.md` row, and moved the IMP-061 session note down to
`docs/build-log.md` (2-note budget). Did not touch WALK-06 — full re-run is a separate chat, per the spec's
own closing line. NEXT: a build chat takes **IMP-064** (first ⬜, [spec](docs/specs-open.md#imp-064--count-your-candles-and-say-plainly-what-one-did)).
A walk chat can still take **WALK-02** or **WALK-15**, unaffected by this chat's work._

_2026-08-14 (IMP-062, the restore offer outlives the launch that made it) — **code-complete, committed
`ba8e684`, not shipped; OTA lane, rides the next batch.** All 4 spec steps done in order — `storage.js`'s
new `restoreOfferAnswered` trio, `importFlow.js`'s `onImported` post-success hook, ownership of the offer's
answer moved from `RitualsApp`'s local state up into `App.js` alongside the stash (the missing piece: an
unconditional `readPendingRestore()` before every `setHydrated`, not just inside the once-only quarantine
branch — full defect writeup in `docs/build-log.md` → IMP-062). 8 new tests exactly as specified across
`importFlow.test.js` and `storage.test.js`. **Proof:** `npm test` → **772 passed, 78 suites** (was 764/78).
`npx expo export --platform android` clean. LAST command: `git commit` → `ba8e684`. Archived IMP-062's spec
into `docs/build-log.md`, emptied `docs/specs-open.md`'s index, condensed the WALK-02 finding in this file's
Open items to a RESOLVED pointer, moved the WALK-01 session note down to `docs/build-log.md` (2-note
budget), and **unblocked WALK-02** in `docs/walk-open.md` — re-run the whole walk from step 1 (new steps
7–9 prove the fix; the earlier partial pass doesn't count). Did not run the walk itself — separate chat, per
the spec's own closing line. NEXT: **no open IMP spec — the build queue is empty**; a build chat should say
so rather than invent one. A walk chat takes **WALK-02** (🚦, first row, 👤 owner)._
