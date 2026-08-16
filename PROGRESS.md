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

**⛔ THE OTA LANE IS SHUT — IMP-076's `bump:native` closed it on 2026-08-17.** The repo is now
`version: 1.0.7` / vc13, and `runtimeVersion` = `appVersion`, so **1.0.7 matches no build on any track**: an
`eas update` would publish to a runtime nothing is running. It reopens only when a 1.0.7 build actually
ships. (For the record of what it was: while the repo sat at 1.0.6 the lane reached **`internal` only** —
vc12's track — never `alpha`'s orphaned vc11 and never the public on vc9.) **Anything found in the device
walks now needs a build, not an OTA**, and reaching the public still means the manual `internal` →
`production` promotion.

**⚠️ OTA has no Play track.** `eas update` publishes to Expo's CDN — no Google, no review. Gated only by
**channel** (`production`) + **matching `runtimeVersion`**. An installed build receives an OTA regardless of
which track it came from. (Once a `bump:native` lands, the OTA lane is closed for that release until the
build ships.)

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **New Architecture**
(`newArchEnabled: true` since IMP-076, 2026-08-17 — **unwalked, WALK-16 is the gate**) ·
`targetSdkVersion` **36**, `minSdk` **24** · `npm test` →
**867 passed, 84 suites**, plus **3 zone tests × 2 pinned zones**. **`npm test` = `test:suite` (the ambient
suite, no TZ pin) + `test:zone`** (`__tests__/zone/`, run at UTC+14 and UTC−11 via `jest.zone.config.js`).
**Verified `exit=0` under five ambient zones** — UTC, +5:30, +14, −11, −5. **Run `npm test`, not bare
`npx jest`**, or the zone half is skipped. Details in [`docs/playbook.md`](docs/playbook.md).

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
| 076 | The app moves to the New Architecture | Build | ✅ code-complete 2026-08-17 · **branch-only, never pushed** (`feat/design-push`) · `assembleRelease` clean, **v1.0.7 / vc13** · walk = WALK-16 + WALK-17 |
| 077 | A motion vocabulary the whole app can speak | Build | ⬜ **blocked on WALK-16** · branch-only, never pushed · walk = WALK-18 |
| 078 | A design system Claude Design can work from | Dev-only | ⬜ **branch-only, never pushed** · no app code, no gate — takeable any time |

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

### 📏 Standing rule — how new tests build dates (from the 2026-08-16 timezone fix)

**Build dates with the local constructor `new Date(y, m, d, h)`** — never `Date.UTC(...)`, an ISO `Z`
string, or a bare date-only string (which parses as UTC). `dayKeyOf` and `recapYears` read **local**
calendar fields, so a UTC-built fixture means a different calendar day in a different zone. If a test
genuinely needs a specific zone it belongs in `__tests__/zone/`, run pinned by `npm run test:zone`.

_The incident that produced this rule is closed (RESOLVED 2026-08-16 — CI caught 4/866 failing on the UTC
runner; the tests were wrong, `dayKeyOf` was correct throughout). Full account in `docs/build-log.md` →
"Resolved findings"._

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

_2026-08-17 (IMP-076 — the app moves to the New Architecture; **branch-only, committed, NOT pushed**) —
**code-complete. `newArchEnabled: true`, `assembleRelease` clean, v1.0.7 / vc13.** Landed exactly as
specified and **changed no app code at all**, which is what keeps rollback to one line each way. Both flags
flipped; both surrounding comments **rewritten, not deleted**, each naming the shipped v1.0.3 / vc9 build as
the reason the IMP-027 hold ended, so the next reader sees a superseded decision rather than a silent
reversal; `playbook.md`'s stack block rewritten to match.
**⚠️ Read this before rebuilding locally: `android/` is gitignored** (`.gitignore:19`). The
`android/gradle.properties` flip the spec asks for is what made **this machine's** gradle build honour New
Arch, but it is **not in the commit and cannot be** — `app.config.js` is the one durable switch, and EAS
regenerates `gradle.properties` from it at prebuild. From a clean checkout, run `expo prebuild` (or re-flip
by hand) before `./gradlew`, or you will build Legacy Arch and not notice.
**The permissions patch did not fire, and it is NOT retired.** `npm install` → exit 0,
`patch(permissions): already null-safe — nothing to do`. The flag cannot affect that script either way (it
inspects `node_modules`), so the real question was answered from source: `PermissionsService.kt` sits in
`expo-modules-core/android/src/main/`, and the **only** arch-gated sourceset there is `src/fabric/`, which is
**C++ only**. It is supplied unconditionally by `ReactAdapterPackage.createInternalModules()` and consumed by
`ModuleRegistryAdapter.createNativeModules()` with **no** `IS_NEW_ARCHITECTURE_ENABLED` branch — that file's
one arch branch (line 115) is additive, for Fabric *view managers*. Re-verified against a **pristine**
`expo-modules-core@3.0.30` tarball per the spec: `requestedPermissions!!` is still there at line 174. Patch
stays, unchanged.
**Proof — the native build, which is the whole point.** `./gradlew assembleRelease` → **BUILD SUCCESSFUL in
4m 34s**, 847 tasks, exit 0, 94 MB APK. **Verifiably** New Arch, not just built with the flag on: the APK
carries `libappmodules.so`, `libreact_codegen_rnsvg.so` and `libreact_codegen_safeareacontext.so` — codegen
artifacts that exist only under `newArchEnabled=true`. **Both RevenueCat modules assembled clean** (the
audit's one soft spot), and R8 ran over the result. `npm test` → **867 passed, 84 suites** + 3 zone tests × 2
pinned zones, exit 0; `npx expo export --platform android` clean — **but neither proves anything here**, no
app code changed. `npm run bump:native` → **v1.0.7 / vc13**, which **shuts the OTA lane** (see above).
**One environment gotcha, not New-Arch-specific:** the first build died in 2s on
`Error resolving plugin [id: 'com.facebook.react.settings'] > 25.0.2` — **Android Studio's bundled JBR is
Java 25**, which AGP rejects. Build with **JDK 17** (`/opt/homebrew/opt/openjdk@17/...`). The
`~/.gradle/init.d` kapt fix was **not** needed and that directory does not exist; the issue did not
resurface. `PLUS_ENABLED` untouched (`false`); WALK-11 not reopened.
**NEXT: [WALK-16](docs/walk-open.md) on a device — the only evidence that exists for this spec.** Then
WALK-17 (edge-to-edge, re-audited: IMP-027's pass was on Legacy Arch and does not carry over). **IMP-077 is
gated on WALK-16 passing.** **IMP-078 needs no gate and can be taken now**, including in parallel._

_2026-08-17 (planning only — no code changed; **branch-only, never pushed**) — **the design push is scoped:
IMP-076/077/078 + WALK-16/17/18, on `feat/design-push`.** Owner's ask: the app has too little motion outside
the sun, and the Plus surfaces need designing — via **Claude Design**, with two hard constraints (**the sun
and rays in `src/art.js` are frozen**, and **no backend rewiring**). Design doc:
[`docs/superpowers/specs/2026-08-16-motion-and-design-system-design.md`](docs/superpowers/specs/2026-08-16-motion-and-design-system-design.md).
**The finding that set the shape: IMP-027's Legacy-Architecture hold had already expired.** Its stated reason
was the Aug-31 API-36 deadline — **met 2026-07-30** by v1.0.3 / vc9 in production — so the hold outlived its
reason by three weeks, and SDK 55 removes Legacy Arch outright. **A first draft of the design doc targeting
Reanimated 3.19.5 on Legacy Arch was written and then discarded**; it traded a known forced migration for an
unverified compat bet (3.19.5's peer deps are wildcards — npm has no opinion on RN 0.81.5) and would have
thrown the animation code away at SDK 55 anyway. **The dep audit is what made New Arch tractable:**
`react-native-svg` 15.12.1, `async-storage` 2.2.0 and `safe-area-context` 5.6.2 all carry `codegenConfig` +
New Arch sourcesets; every `expo-*` is SDK 54, where New Arch is the **default**. **Only RevenueCat is
unmigrated** (legacy bridge, and `-ui` is a legacy *view* component at one call site,
`RitualsApp.js:253`) — **and it is dormant, because `PLUS_ENABLED = false`.** Migrating while the risky
surface is switched off is deliberate, so **`PLUS_ENABLED` stays `false` across all three IMPs** and
**WALK-11 is not reopened**. Two mechanical notes for whoever takes these: `babel-preset-expo` auto-injects
the worklets plugin (`build/index.js:286-289`), so **`babel.config.js` is not touched**; and
`scripts/patch-permissions.js` targets the **legacy bridge adapter** path, so it may fail `npm install`
loudly under New Arch — **by design, do not soften it** (IMP-076 step 2 says what to do instead).
**Publication discipline, owner instruction:** branch has **no upstream**, **no `Release-Lane` trailer on any
commit**, **no merge to `main`** — `release.yml` fires on `push: branches: [main]` + that trailer, so both
guards fail closed. **Proof:** planning only — no source file touched, `npm test` deliberately unrun and
unchanged. **NEXT:** IMP-076 (flip both `newArchEnabled` flags, full native build, `bump:native`) → **WALK-16
on a device, which is the only evidence that exists for it** → then IMP-077. **IMP-078 needs no gate and can
be taken any time, including first.**_
