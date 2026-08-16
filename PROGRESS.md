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

> **🔵 2026-08-16 — the free-app improvement track is CLOSED and the work moved to Plus (Phase 10b).** The
> owner's call, taken with the backlog empty. `IMP-001`–`IMP-075` are done bar the deferred `IMP-022` and the
> reserved `IMP-057`; `docs/specs-open.md`'s index is empty. **Do not open new free-track IMP rows** — read
> [`docs/playbook.md`](docs/playbook.md) → Phase 10b first, and note the `PLUS_ENABLED` gate below, which is
> still shut and still has one unmet perk. The same session cut **v1.0.6 / vc12** to `internal` (below), so
> everything from IMP-032 onward finally has a track.
>
> **What did NOT come with that decision, and is still owed:**
> - **The WALK-07 Paywall regression needs a new `IMP-xxx` — Opus's lane to scope** (Open items → "WALK-07
>   finding, reopened"). It is a Plus surface, so it now belongs to the Plus work rather than sitting beside
>   it: the footer overlaps the plan selector and disclaimer from first open, with both IMP-074 fix-halves
>   confirmed present in `Paywall.js`. **Nothing about Plus should ship past this.**
> - **WALK-09 (lifetime heatmap) is unblocked and never re-run** — IMP-073 landed; a walk chat can take it.
> - **The 🚦 device walks are still unwalked** — WALK-13, WALK-03, WALK-12. vc12 reaching `internal` is what
>   makes them runnable; they gate `internal` → `production`, not the internal build itself.
>
> `IMP-063` through `IMP-075` have all landed. `IMP-072` has no spec at all — found and fixed live during the
> WALK-04 re-run at the owner's direction, skipping Opus-scoping; full account in `build-log.md` → "Walk log"
> → WALK-04, commit `44197e9`. **WALK-04, WALK-06 and WALK-10 all passed 2026-08-16**, and **WALK-15 was
> closed the same day at the owner's call** (steps 1–3 + 7 passed, 4–6 accepted unrun — the listing assets
> are committed and `npm run shots` is green end to end). **WALK-14 (TalkBack) was dropped from the queue
> entirely** on 2026-08-16, also the owner's call — it was never a gate and nothing waits on it; the row in
> `docs/walk-open.md` now states what dropping it costs and what would reopen it.
>
> **`IMP-057` is reserved, not missing** — the `dayKey` migration IMP-056 deferred; needs real device
> numbers first (see Open items). **Do not reuse the number.** **IMP-044
> claims no queue slot** — it rides the next build; don't "start" it, it needs only WALK-12.

**App status — all four Play tracks, read from the Play Developer API 2026-08-13. Authoritative; do not
re-derive from an older note.**

| Track | Active | API | Note |
| --- | --- | --- | --- |
| `production` (public) | **1.0.3 / vc9** | 36 ✅ | live since 2026-07-30 |
| `beta` (open testing) | **1.0.3 / vc9** | 36 ✅ | was vc8/API 35 — promoted, compliance gap closed |
| `alpha` (closed testing) | **1.0.5 / vc11** | 36 ✅ | frozen by design 2026-08-08; the newest *built* code |
| `internal` | **1.0.6 / vc12** | 36 ✅ | **shipped 2026-08-16** — see below |

**✅ v1.0.6 / vc12 SHIPPED to `internal` on 2026-08-16.** Confirmed from the submit output, not inferred:
`Release track: internal`, `Version code: 12`, `✔ Submitted your app to Google Play Store!` (GH run
`31951685300`; EAS build `f621adac-8357-48b2-832e-afa89649fe34`, submission
`2416e8bb-182d-44c9-b2e0-18f52912801b`). **This carries ~40 IMP tasks that had reached no track since the
vc11 build on 2026-08-02**, and is **the first minified (R8) build of this app ever** — IMP-044 rides it
**unwalked**, which is exactly what WALK-12 exists for.

**🚦 vc12 is a BUILD CANDIDATE, not the release.** `internal` reaches the owner's devices and invited
testers only. **WALK-13 → WALK-03 → WALK-12 (R8 last) must pass on real hardware before `internal` →
`production`**, which is manual and gets the full ~7d review. If WALK-12 finds R8 stripping something, that
is another bump and another build. The other three tracks below are unchanged and still on older code.

**✅ API-36 compliance (deadline 2026-08-31) is met ACCOUNT-WIDE — blocker CLOSED 2026-08-13.** Every
active release on every track is `targetSdkVersion 36`. Banner-reading procedure kept in the playbook.

**Builds auto-submit to `internal`** (`eas.json` → `submit.production.android.track`, set 2026-08-08 in
`a299af7`; CI already does it). Reaching the public stays manual: promote `internal` → `production` in Play
Console, which *does* get the full review.

**⚠️ THE OTA LANE REACHES `internal` ONLY** (reopened 2026-08-16 when vc12 shipped). `runtimeVersion` =
`appVersion` = **1.0.6** = **vc12**, which lives on `internal` alone — so an `eas update` reaches the owner's
own devices and invited testers, nobody else. **vc11 on `alpha` is orphaned from OTAs for good**, and the
public on vc9 was never reachable. An OTA fix for anything found in the device walks lands on `internal`
only; getting it to the public still means the manual `internal` → `production` promotion.

**⚠️ OTA has no Play track.** `eas update` publishes to Expo's CDN — no Google, no review. Gated only by
**channel** (`production`) + **matching `runtimeVersion`**. An installed build receives an OTA regardless of
which track it came from. (Once a `bump:native` lands, the OTA lane is closed for that release until the
build ships.)

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **Legacy Architecture**
(`newArchEnabled: false`, held deliberately) · `targetSdkVersion` **36**, `minSdk` **24** · `npm test` →
**866 passed, 84 suites**. **`npm test` now pins `TZ=Asia/Kolkata`** (2026-08-16) — the suite does not pass
under an arbitrary zone and CI runs UTC; see Open items → "the suite is timezone-coupled". **Run tests via
`npm test`, not bare `npx jest`**, or you lose the pin. Details in [`docs/playbook.md`](docs/playbook.md).

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
| 041 | Teach the app — tips + explainers | OTA | ✅ walked 2026-08-16 (WALK-10) — tip-card half now slated for removal, see IMP-075 |
| 042 | The Keepsakes screen scrolls | OTA | ✅ |
| 043 | Recoverability pass — re-verify entitlement, backup health | OTA | ✅ |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, UNWALKED — rides v1.0.6 / vc12** (bumped 2026-08-16); walk = WALK-12, on hardware, before `internal` → `production` |
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
| 059 | The app has one accessibility label | OTA | ✅ code-complete 2026-08-13 · **WALK-14 ⏭ dropped 2026-08-16** (owner) — labels ship unwalked; reopen triggers in `walk-open.md` → WALK-14 |
| 058 | Prompt packs — grief / gratitude / change | OTA | ✅ code-complete 2026-08-14 |
| 061 | Store screenshots build themselves | Dev-only | ✅ code-complete 2026-08-14 · **WALK-15 ✅ closed 2026-08-16** (steps 4–6 accepted unrun); seven assets committed to `store/play/` |
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
| 073 | The lifetime heatmap reads as one grid | OTA | ✅ code-complete 2026-08-16 · walk = WALK-09 (re-run whole) |
| 074 | The Paywall footer survives the first measure pass | OTA | ✅ code-complete 2026-08-16 · walk = WALK-07 (re-run whole) |
| 075 | The tip cards go away | OTA | ✅ code-complete 2026-08-16 · reverses IMP-041's tip half by owner's design choice, not a defect · no walk needed (owner already walked this behaviour live in WALK-10) |

---

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track and Phase 10b are in [`docs/playbook.md`](docs/playbook.md) → "Monetization strategy".

### ▶️ Owner decisions still open

- **✅ RESOLVED 2026-08-16 — the ~40 unpublished IMP tasks reached `internal` as v1.0.6 / vc12.** Kept here
  (not archived) because the *promotion* half is still open and the walks below still gate it.
  Everything from IMP-032/033 through IMP-075 (search, custody +
  trash, multi-moods, recap, deeper insights, heatmap, `dayKey`, keyboard fix, prompt packs, a11y, mood
  management, and the whole IMP-063…075 polish run) had reached **no track at all** since the vc11 build on
  2026-08-02. An OTA could never have delivered it — `runtimeVersion` = `appVersion` matched vc11 on `alpha`
  only, and the batch touches `app.config.js` / `eas.json` / `package.json` / `package-lock.json`, so CI's
  backstop auto-rejects an `ota` trailer — so a **build** was the only route, and it necessarily carries
  IMP-044's R8, the first minified build of this app ever.
  **What actually happened vs. the sequence this bullet used to prescribe.** The old plan was *clear the 🚦
  walks (13 → 03 → 12) first, then bump*. **The three remaining 🚦 rows are all `device` walks and were NOT
  run** — the owner's call, and the reasoning is sound rather than a corner cut: all three need this build
  installed on real hardware, and `internal` is how it gets there. **The gate did not disappear, it moved
  one step later — `internal` → `production` is manual and is where WALK-13, WALK-03 and WALK-12 now bite.**
  What ships to `internal` reaches the owner's own devices and invited testers, not the public.
  **Done: CI test gate ✅ (after the TZ fix below) → owner approved the `production` environment →
  `eas build --auto-submit` → `internal` ✅.
  REMAINING: install vc12 on hardware → WALK-13 → WALK-03 → WALK-12 (R8 last) → promote `internal` →
  `production` by hand** (full review, ~7d). **If WALK-12 finds R8 stripping something, the fix means another
  bump and another build — vc12 is a candidate, not the release.**
- **Cash embers: settled in principle (dropped 2026-08-03), not finalised.** Must be decided before
  `PLUS_ENABLED` flips — it determines which Play products get created. Full argument in the playbook.
- **`PLUS_ENABLED` must not flip until every `PLUS_PERKS` line is true.** The one remaining gap is perk #6,
  the PDF (IMP-022, deferred). Gate checklist in the playbook → Phase 10b.

### 🔴 WALK-07 finding (reopened) — Paywall footer still overlaps content after IMP-074

Whole-walk re-run, 2026-08-16. The five other screens (Achievements, Shop, Reading sheet, Get Embers, Manage
Subscription) and both IMP-067 spot-checks (Annual Recap teaser wrap, Mood Mix bar alignment) all passed —
both nav modes, max font scale. **Paywall did not.** On first open, normal font, gesture nav: the fixed
footer overlaps the plan-selector row and the "Your journal lives on your device" disclaimer from the very
first frame — not the delayed-then-correcting pass IMP-074's writeup described. Both of IMP-074's fix halves
are confirmed present and unchanged in code — `maxHeight: winH` on the root `View`
(`src/screens/Paywall.js:40`) and `flex: 1` on the inner `ScrollView` (`src/screens/Paywall.js:56`) — so the
fix is not holding, not merely unshipped.
The plan selector stays tappable underneath, so this blocks nothing functionally, but it fails the walk's
visual bar. The owner floated an alternative design live: don't render the footer until a plan is picked,
then let the page grow to fit it, instead of reserving space up front — a real option for whoever scopes the
next spec to weigh. Full writeup in `docs/walk-open.md` → WALK-07 → "Re-run — 🟡 2026-08-16 (whole walk...)".
**Needs Opus to scope a new `IMP-xxx`.**

### 🟠 The suite is timezone-coupled — pinned, not fixed (2026-08-16)

**Found by CI, on the first `npm test` it has actually run in weeks.** The gate only executes when HEAD
carries a `Release-Lane` trailer; every push since the vc11 era carried none, so those ~10s runs were
no-ops. vc12's push ran it for real and **4 tests failed on the runner while all 866 passed locally**.

**Root cause — the tests, not the app. `dayKeyOf` is correct.** Four tests (`time/dayKey`,
`home/todaysEntry`, `dev/inspect` ×2) set `process.env.TZ = 'Pacific/Kiritimati'` at runtime and assert that
the local day differs from the UTC day. **Jest gives each test file a copy of `process.env`, so that write
never reaches Node's timezone** — probed directly: `{"ambient":"UTC","dateBefore":15,"dateAfter":15,
"mutationWorks":false}`. The same code works in plain `node`, which is why it reads as correct. So the
mutation was always inert, and the assertions passed **only because the dev machine is IST (+05:30)**, where
`23:30Z` really is the next day. On a UTC runner the coincidence disappears.

**What was done: `npm test` pins `TZ=Asia/Kolkata`.** Jest cannot change the zone from inside a test, so a
pin before process start is the only mechanism. Verified across the full suite: `Asia/Kolkata` → **866/866
green**; `Pacific/Kiritimati` → **1 failure**, and a *different* test (`recap/annualRecap`, the 1-Dec/30-Nov
boundary) — i.e. there is at least a **fifth** zone-fragile test the original four never exposed.

**🟠 This unblocks CI; it does not fix anything.** The pin makes the runner reproduce the dev machine, which
means **CI can no longer catch a timezone regression** — in an app whose IMP-056 was exactly a timezone bug
and whose reserved IMP-057 is a `dayKey` migration. **Needs a follow-up `IMP-xxx` (Opus's lane):** make these
tests zone-independent — inject the zone into the code under test, or drive the ambient zone from outside the
process — then remove or re-choose the pin. **Do not treat the green gate as proof the dayKey logic is
zone-safe.**

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

### ✅ WALK-15 screenshot automation — CLOSED 2026-08-16, no spec needed

Fixed as **test-infra repair** (no app code, no accessibility label touched) and **closed at the owner's
call** the same day. `npm run shots` runs green end to end and the seven Play-legal 1080×1920 assets are
committed under `store/play/`. Six defects total, five of them the same family — a maestro step reporting
`COMPLETED` while the app is somewhere else, so the artifact is a *wrong picture* rather than an error
(`04-reflections.png` was the Android launcher; `07-shop.png` was the home screen). **Full writeup, including
what each fix was and why:** `docs/build-log.md` → "Walk log" → WALK-15.

**Steps 4, 5 and 6 were accepted unrun** — the second-AVD resolution check, the byte-comparable re-run, and
the 👤 half where someone opens all seven and looks. **Bounded on purpose:** those three protect only the
*listing assets*, which are uploaded by hand and seen by a human at upload time; nothing here can reach the
app or a user. If a later run's output drifts with the emulator, this is the first place to look.

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

_2026-08-16 (release — v1.0.6 / vc12 to `internal`, and the free track closes) — **the ~40 unpublished IMP
tasks finally have a lane.** Owner's direction, three decisions in one session. **(1) WALK-15 closed ✅** —
steps 1–3 and 7 passed, steps **4–6 accepted unrun** (second AVD, repeat run, the 👤 look at all seven);
section moved to `build-log.md` → "Walk log", which records exactly what that costs — those steps protect
only the listing assets, which a human eyeballs at upload anyway. The seven `store/play/` PNGs are now
committed. **(2) WALK-14 (TalkBack) dropped ⏭** — the owner asked why it existed at all; the honest answer is
it is not a Play requirement and never gated anything, it existed only because `npm test` can prove a label
exists but not that a blind user can reach the save button. Row kept, not deleted, and rewritten to say what
dropping it costs (a wrong label goes unfound; every fix is a string, so it goes out OTA same-day) and what
reopens it (an accessibility complaint, or institutional Plus buyers). **(3) The build.** `npm run bump:native`
→ `version: '1.0.6'` / `versionCode: 12`; committed with `Release-Lane: build` and pushed. **The 🚦 device
walks (WALK-13, WALK-03, WALK-12) were deliberately NOT run first**, reversing the sequence the old Open-items
bullet prescribed — all three need this build on real hardware, and `internal` is how it gets there. **The
gate moved rather than vanished: it now sits on `internal` → `production`, which is manual.** **vc12 is a
candidate, not the release** — if WALK-12 finds R8 stripping something, that is another bump and another
build. **Proof:** `npm test` → **866 passed, 84 suites** (run in a visible Terminal, `EXIT: 0`);
`node scripts/check-billing-config.js` → OK (`PLUS_ENABLED` false, no purchase surface ships). LAST command:
`git push`. **vc12 SHIPPED to `internal`** — confirmed from the submit output (`Release track: internal`,
`Version code: 12`, `✔ Submitted your app to Google Play Store!`; GH run `31951685300`).

**The push failed the CI test gate first, and it caught something real.** 4 of 866 failed on the runner while
all 866 passed locally — **the first time `npm test` had actually executed in CI in weeks**, since the gate
only runs on a `Release-Lane` trailer and every intermediate push carried none (those ~10s runs are no-ops).
Root cause was the **tests, not the app**: they set `process.env.TZ` at runtime, which is **inert under Jest**
(each file gets a copy of `process.env`), so they only ever passed because this machine is IST (+05:30).
Fixed by pinning `TZ=Asia/Kolkata` in the `test` script — the only mechanism available, since Jest cannot
change the zone from inside. Verified `TZ=UTC npm test` → 866/866, which simulates the runner directly.
**See Open items → "the suite is timezone-coupled" — the pin unblocks CI without fixing the fragility, and
needs a follow-up `IMP-xxx`.**

**NEXT: install vc12 from `internal` on real hardware, then WALK-13 → WALK-03 → WALK-12 (R8 last).** Those
three gate the manual `internal` → `production` promotion. **The active work is now Plus (Phase 10b)** — read
the playbook's Phase 10b gate; the first thing Opus owes it is a spec for the reopened WALK-07 Paywall
finding, plus the timezone-test follow-up above._

_2026-08-16 (WALK-07, modal scroll — whole-walk re-run) — **no app defect on five of six screens; Paywall
fails again.** T1 flipped for the session and reverted after (confirmed `src/billing/config.js:39` back to
`false`). Achievements, Shop, Reading sheet, Get Embers and Manage Subscription all passed — gesture and
3-button nav, max (2.0x) OS font scale, no regressions. Both IMP-067 spot-checks passed too (Annual Recap
teaser wraps, Mood Mix bars stay aligned). **Paywall did not clear this walk despite IMP-074 landing**: the
fixed footer overlaps the plan selector and the disclaimer line from the very first frame, not after a
correcting re-render as IMP-074's own writeup predicted. Owner-reported and confirmed against the running
code — both fix halves are present unchanged (`maxHeight: winH` at `Paywall.js:40`, `flex: 1` at
`Paywall.js:56`), so this is the fix not holding rather than a fix never shipped. Nothing was edited — per
the walk's own rule, a failure gets written up, not patched live. Logged as a reopened WALK-07 finding under
Open items, with the owner's live alternative-design suggestion (hide the footer until a plan is picked, grow
the page to fit it) noted for whoever scopes the next spec. Full writeup: `docs/walk-open.md` → WALK-07 →
"Re-run — 🟡 2026-08-16 (whole walk...)". NEXT: **Opus needs to scope a new `IMP-xxx`** for the Paywall
regression before a build chat can take it. A walk chat can otherwise take **WALK-09** (unblocked) or
**WALK-15** (steps 4–6)._
