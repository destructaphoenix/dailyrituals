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

> **The build queue is empty.** `IMP-063` through `IMP-071` have all landed and their specs are archived in
> `docs/build-log.md`. `IMP-072` has no spec at all — found and fixed live during the WALK-04 re-run at the
> owner's direction, skipping Opus-scoping; full account in `build-log.md` → "Walk log" → WALK-04, commit
> `44197e9`. The next `IMP-xxx` comes from Opus scoping a new owner-filed issue, or a future walk finding.
> **WALKS are still the risk-ordered work**: the 🚦 group gates a release carrying ~25 unpublished tasks —
> **WALK-04 passed 2026-08-16** (full re-run, emulator). WALK-07 and WALK-06 can still be re-run whole.
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
**850 passed, 83 suites**. Details in [`docs/playbook.md`](docs/playbook.md).

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
| 064 | Count your candles, and say plainly what one did | OTA | ✅ code-complete 2026-08-15 · walk = WALK-06 (re-run whole) |
| 065 | Clear the search; picked moods come to the front | OTA | ✅ code-complete 2026-08-15 · walk = WALK-04 (re-run whole) |
| 066 | The mood step stops fighting you | OTA | ✅ code-complete 2026-08-15 · walk = WALK-04 (re-run whole) |
| 067 | A stacked row wraps; Mood Mix bars line up | OTA | ✅ code-complete 2026-08-15 · walk = WALK-07 (re-run whole) |
| 068 | The Paywall footer stops covering the price | OTA | ✅ code-complete 2026-08-15 · walk = WALK-07 (re-run whole) |
| 069 | A feeling you picked can be put back down | OTA | ✅ code-complete 2026-08-16 · walk = WALK-04 (re-run whole) |
| 070 | One emoji, and the block says what it makes | OTA | ✅ code-complete 2026-08-16 · walk = WALK-04 (re-run whole) |
| 071 | The filter row stops jumping under your thumb | OTA | ✅ code-complete 2026-08-16 · walk = WALK-04 (re-run whole) |
| 072 | Custom-mood face field polish + a real typing bug | OTA | ✅ code-complete + walked 2026-08-16 · found and fixed live during WALK-04, no separate spec (owner-directed) |

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
  **IMP-063…071 are 🎨 and are NOT part of this sequence** — they land either before the bump *in full*, or
  after the build as an OTA. Never split across it. (IMP-063…071 all landed 2026-08-15/16 — the 🎨 batch is
  code-complete; the 🚦 walks above still gate the bump.)
- **Cash embers: settled in principle (dropped 2026-08-03), not finalised.** Must be decided before
  `PLUS_ENABLED` flips — it determines which Play products get created. Full argument in the playbook.
- **`PLUS_ENABLED` must not flip until every `PLUS_PERKS` line is true.** The one remaining gap is perk #6,
  the PDF (IMP-022, deferred). Gate checklist in the playbook → Phase 10b.

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

_2026-08-16 (IMP-071, the filter row stops jumping under your thumb) — **code-complete, committed
`4072e8d`, not shipped; OTA lane, rides the next batch. Last spec in the queue — `docs/specs-open.md` is now
empty.** `src/screens/ArchiveFilters.js`: `toggleMood` no longer calls `scrollTo`; the `chipScroll` ref, its
`ref` prop, and the `useRef` import are gone. `orderMoodChips`/front-sorting untouched, as directed. +2 tests
in `ArchiveFilters.test.js` (`describe('ArchiveFilters — IMP-071')`): an unselected-chip press appends via
`onChange` with `text`/`from`/`to` untouched, plus a source assertion the file contains no `scrollTo(`.
Existing IMP-065 cases stayed green. **Proof:** `npm test` → **850 passed, 83 suites** (was 848/83). `npx
expo export --platform android` clean. LAST command: `git commit` → `4072e8d`. Archived the spec,
emptied `specs-open.md`'s index, ticked the row, closed the WALK-04 finding note (all three of (g)/(h)/(f)
landed — next run checks all three), updated the ACTIVE TRACK banner, corrected the stack line, moved the
IMP-069 note down. **Not to lose: WALK-04 hasn't actually been re-run since landing** — the 🚦 walks
(WALK-13 → 03 → 12) still gate the native build regardless. NEXT: backlog is empty — Opus must scope a new
`IMP-xxx` before there's a spec to take. A walk chat can still take **WALK-07**, **WALK-06**, or **WALK-15**._

_2026-08-16 (WALK-04, search + moods) — **✅ full pass, emulator, third re-run.** Steps 1–5 and both
IMP-069 (deselect + "N chosen" line) and IMP-071 (front-sort without autoscroll) confirmed live. Two more
defects surfaced in the custom-mood face field and were **fixed live in this chat at the owner's explicit
direction**, skipping the usual Opus-scoping step: the mood-question copy shifted the page on first select
(two lines empty, one line chosen — shortened); the face-field placeholder clipped to "or any" (field
resized to a 34×34 circle matching the palette swatches, "+" placeholder in `c.accent`). That work surfaced
a **real pre-existing bug** — typing a second emoji into the face field never replaced the first, since
`onEmojiTyped` read `firstEmoji()` off the raw accumulated buffer instead of stripping the already-shown
prefix — fixed with a regression test that fails without the fix. A follow-up visual "shake" on swap
(Android auto-scrolling the field to fit a momentary two-emoji string) was fixed by giving the `TextInput`
more width than the visible circle (clipped via `overflow: hidden`) rather than by force-clearing the
native buffer — that was tried first and reverted, since it desyncs the Android IME's emoji-composing state
and silently drops the second keystroke; left as a code comment so it isn't retried. All logged as
**IMP-072** (backlog row only, no spec — see WALK-04's entry in `build-log.md` → "Walk log" for the full
account). **Proof:** `npm test` → **852 passed, 83 suites** (was 850/83). `npx expo export --platform
android` clean. LAST command: `git commit` → `44197e9`. Moved WALK-04's full section from `walk-open.md` to
`build-log.md` → "Walk log" (passed), updated its index row, closed the now-resolved WALK-04 finding note in
this file, updated the ACTIVE TRACK banner. NEXT: backlog is still empty — Opus scopes the next `IMP-xxx`.
A walk chat can take **WALK-07**, **WALK-06**, or **WALK-15** (all emulator); **WALK-13** is next in
strict index order but is device-only._
