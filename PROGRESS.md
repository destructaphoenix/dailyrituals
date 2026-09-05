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
| **Build task** | [`docs/specs-open.md`](docs/specs-open.md) | the **first ⬜ `IMP-xxx`** in the backlog below — **but check 🧭 below first: a row can be blocked** |
| **Runtime walk** | [`docs/walk-open.md`](docs/walk-open.md) | the **first ⬜ `WALK-nn`** in that file's own index |

**Never both in one chat.** A spec is **code-complete at `npm test` green + `npx expo export` clean** — its
runtime proof is a separate WALK row for a separate chat, so a missing walk is *not* an unfinished spec.
Neither queue is the phase ladder (8 / 10b / 11), parked in [`docs/playbook.md`](docs/playbook.md).

> ## 🧭 WHAT TO TAKE RIGHT NOW — read this before the tables below (2026-08-17)
>
> **The build queue is effectively EMPTY. Do not "take the first ⬜ IMP row" today** — the only open spec,
> `IMP-077`, is **hard-gated on WALK-16**, which has not run. Starting it would produce a green suite that
> proves nothing (Reanimated 4 cannot run on Legacy Arch, and its Jest mock no-ops every hook).
>
> | If this chat is… | Take |
> | --- | --- |
> | a **runtime walk** | ⚠️ **WALK-16 and WALK-17 are CLOSED ✅ on emulator evidence (owner's instruction, 2026-09-05: record emulator results as done, not smoke). WALK-13 is DROPPED at the same instruction.** What is left needs either a spec or the Play build: **WALK-03 step 4** (`neverBackedUp` only) waits on `IMP-081`; **WALK-07** (Paywall only) waits on `IMP-080`; **WALK-08 is PARTIAL** — cap confirmed, eight of nine screens plus rotation and `longName` unrun; **WALK-12 (R8) is LAST** and needs the Play `internal` build (A), which has no dev harness. ⚠️ **Named gap that no closed row covers:** real doze, OEM battery managers, delivery to a real share target, Google's own backup schedule. |
> | a **design request** | The Claude Design project is **live** — see "Claude Design is set up" below. |
> | a **build task** | **[IMP-080](docs/specs-open.md)** (Paywall footer) or **[IMP-081](docs/specs-open.md)** (the never-backed-up warning truncates mid-word — from WALK-03, 2026-09-05). **Both are takeable right now — no gate, no device — and they touch different files, so either order or in parallel.** **IMP-077 is now UNBLOCKED** too: WALK-16 closed 2026-09-05. |
>
> **The whole design push lives on `feat/design-push`, which is NEVER pushed, NEVER given a
> `Release-Lane:` trailer, and NEVER merged to `main`** without a separate owner decision.
> **IMP-076 ✅ and IMP-078 ✅ are both code-complete (2026-08-17)**; commits `22fcb96` and `4c1e34b`.

> **🔵 2026-08-16 — the free-app improvement track is CLOSED; active work is Plus (Phase 10b) + the design
> push.** Owner's call. `IMP-001`–`IMP-075` are done bar the deferred `IMP-022` and the reserved `IMP-057`.
> **Do not open new free-track IMP rows** — read [`docs/playbook.md`](docs/playbook.md) → Phase 10b, and note
> the `PLUS_ENABLED` gate below, still shut with one unmet perk. Full account of that session, the walk
> closures (WALK-04/06/10 ✅, WALK-15 closed, WALK-14 dropped) and IMP-072's no-spec fix: `build-log.md`.
>
> **Still owed, and neither is done:**
> - **The 🔴 WALK-07 Paywall regression needs a new `IMP-xxx` — Opus's lane to scope** (see Open items). It
>   is a Plus surface. **Nothing about Plus should ship past this.**
> - **WALK-09 is now ✅ (2026-09-05)** — re-run after IMP-073, full pass, closed. **Every remaining walk
>   needs a device.**
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
| `internal` | **1.0.7 / vc13** | 36 ✅ | **shipped 2026-09-05** — the New Arch build; see below |

**✅ v1.0.6 / vc12 SHIPPED to `internal` on 2026-08-16.** Confirmed from the submit output, not inferred:
`Release track: internal`, `Version code: 12`, `✔ Submitted your app to Google Play Store!` (GH run
`31951685300`; EAS build `f621adac-8357-48b2-832e-afa89649fe34`, submission
`2416e8bb-182d-44c9-b2e0-18f52912801b`). **This carries ~40 IMP tasks that had reached no track since the
vc11 build on 2026-08-02**, and is **the first minified (R8) build of this app ever** — IMP-044 rides it
**unwalked**, which is exactly what WALK-12 exists for.

**✅ v1.0.7 / vc13 SHIPPED to `internal` on 2026-09-05 — it replaced vc12 on that track.** Confirmed
from `eas submit:list`, not inferred: `Track: internal`, `Release Status: completed`, `Version code 13`,
EAS build `11dce1c2-3ba5-4654-9ea3-b3723e1ee457`, submission `bcb6c944-f3eb-4ec1-8f96-cb0da21c39f0`,
built from commit `bbd5f45` on `feat/design-push`. Runtime `1.0.7`, fingerprint `e6dc620c…`. **This is
the first New Architecture build to reach any track**, and the artifact every remaining device walk runs
against. vc12 is history; its `internal` → `production` promotion is off for good.

**The promotion still open is a vc13 one** — the manual `internal` → `production` with the full ~7d
review, and it should not be taken until the device walks clear. The other three tracks are unchanged and
still on older code.

**✅ API-36 compliance (deadline 2026-08-31) is met ACCOUNT-WIDE — blocker CLOSED 2026-08-13.** Every
active release on every track is `targetSdkVersion 36`. Banner-reading procedure kept in the playbook.

**Builds auto-submit to `internal`** (`eas.json` → `submit.production.android.track`, set 2026-08-08 in
`a299af7`; CI already does it). Reaching the public stays manual: promote `internal` → `production` in Play
Console, which *does* get the full review.

**✅ THE OTA LANE REOPENED on 2026-09-05 — but only onto `internal`.** It was shut from 2026-08-17,
when IMP-076's `bump:native` moved the repo to `1.0.7` / vc13 and left `runtimeVersion` (= `appVersion`)
matching no shipped build. **vc13 shipping to `internal` is the exact condition that reopens it.** An
`eas update --channel production` now lands on runtime `1.0.7`, which is **vc13 installs and nothing
else** — not `alpha`'s orphaned vc11, not the public on vc9, both of which are on older runtimes.

**What that means in practice:** a JS-only fix found in the device walks can now go out as an OTA to the
internal testers, *but* **anything native still needs a build**, and **WALK-12 must be re-walked if any
build is re-cut.** Reaching the public is still the manual `internal` → `production` promotion. **Do not
OTA a fix and then treat WALK-12's R8 pass as still valid** — R8 runs at build time, so an OTA does not
change what was minified, but it does mean the code on the device is no longer the code that was walked.

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
| 001–075 | **Every free-track task, all ✅ except the two rows below.** Search, custody + 30-day trash, multi-moods, Annual Recap, deeper insights, heatmaps, local `dayKey`, prompt packs, a11y labels, the IMP-063…075 polish run, R8, dev harness, backup/restore, reminders. | mixed | ✅ — **full detail per task in [`docs/build-log.md`](docs/build-log.md)**; git is the record. Do not re-derive from this table. |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, UNWALKED.** It rode vc12, but **vc12 is no longer the candidate** (2026-09-05) — R8 must be walked on the build you actually ship, so it now rides **vc13**; walk = WALK-12, on hardware, last in the sitting |
| 076 | The app moves to the New Architecture | Build | ✅ code-complete 2026-08-17 · **branch-only, never pushed** (`feat/design-push`) · `assembleRelease` clean, **v1.0.7 / vc13** · walk = WALK-16 + WALK-17 |
| 077 | A motion vocabulary the whole app can speak | Build | ⬜ **UNBLOCKED 2026-09-05** — WALK-16 closed ✅ on emulator evidence at the owner's instruction · branch-only, never pushed · walk = WALK-18 |
| 078 | A design system Claude Design can work from | Dev-only | ✅ code-complete 2026-08-17 · **branch-only, never pushed** · **15 cards live** in Claude Design project `Daily Rituals Design System`, both themes |
| 080 | The Paywall footer stops fighting the layout | Build | ⬜ **takeable now — no gate** · branch-only, never pushed · from the 🔴 WALK-07 finding · walk = the Paywall half of WALK-07 |
| 081 | The never-backed-up warning says the whole sentence | Build | ⬜ **takeable now — no gate, no device** · branch-only, never pushed · from the WALK-03 step 4 finding, 2026-09-05 · `BackupNudge` clamps at `numberOfLines={2}` and the 97-char `never` string cuts mid-word at **default** font scale · walk = step 4 of WALK-03 |

---

## 🎨 Claude Design is set up — how to use it (IMP-078, 2026-08-17)

**Project: `Daily Rituals Design System`** · id `7bf44d09-f93a-42d2-a8b6-d412d671cf60` · type
`PROJECT_TYPE_DESIGN_SYSTEM`, writable. **13 cards**: Tokens (color, type, shape, elevation) · Frozen
(the rays) · Components (card, buttons, progress, chips, nav, plus) · Screens (baseline-day,
baseline-night).

> **Trimmed 2026-08-17 (owner).** The signature is **`RayFan` + `NightRays` only**. `BigSun`/`BigMoon`
> were demoted out of Frozen (they still ship in Onboarding/Celebration/Paywall, but a design may replace
> them); `NightSky` and the `DARK_THEME` revert flag were deleted from the app outright; the two Motion
> cards were deleted because they documented a `src/motion.js` that IMP-077 has not built yet. **Do not
> re-add any of it to the design system** — a card that describes something the app doesn't have is how
> the design system gets corrupted.

**To make a design request, open the Design System pane in Claude Design and ask for ONE screen.**
"Redesign the app" produces mush. The four rules that make output portable:

1. **One screen per request.** "Redesign the app" produces mush. **The live request is `Insights`**
   (owner, 2026-09-05) — it is one of only two screens with a baseline that is also user-visible today.
   ⚠️ **Check the screen has a baseline before you ask for it**: only `day-01…07`/`night-01…07` exist. For
   one that does not, **paste its source into the request** rather than describing it.
2. **Insist the spec comes back in token names** — `c.accentSoft`, `t.radius.card`. Not hex, not "gentle
   fade". The cards are built so it never sees a raw hex. ⚠️ **Do NOT ask for `motion.js` primitives**
   (`riseIn`, `DUR.enter`) — IMP-077 has not built that file and its two Motion cards were deleted from the
   project. Asking for them returns a spec against an API that does not exist and cannot be ported.
3. **The sun and rays are frozen.** The Frozen card says so in the project. If a returned design redraws
   them, reject it — that design cannot ship.
4. **It is a *design* request, not an enablement.** `PLUS_ENABLED` stays `false`; `PLUS_PERKS` copy and
   everything under `src/billing/` are untouched by design work.

**Porting the result is a normal build task**: a new `IMP-xxx` scoped by Opus, then a build chat. Claude
Design does not emit React Native — it returns HTML/CSS previews plus a spec.

**To regenerate the cards after a theme change:** `node scripts/gen-design-system.js`, then re-push. The
token/component/frozen cards are generated from `src/theme.js`, `src/data.js` and `src/art.js`, so they
cannot drift — but they do not update themselves.

**Both themes are covered** — `baseline-day` and `baseline-night` (night captured 2026-08-17 after the
owner switched the app to dark by hand). **The app's mode is its own setting, not the OS's** (`App.js:40`,
header toggle), so `cmd uimode night` does nothing: to re-shoot night, set the app to dark **first**, then
run `npm run shots`. `scripts/gen-design-system.js` picks up whichever `day-*`/`night-*` PNGs are present,
and **`scripts/check-baseline-dark.py` gates the night copy** (mean luma < 90) so a day frame can never
again be filed as night — that exact mistake happened once.

**One known gap, deliberate and not blocking:**
- **No auto-sync.** Pointing the Design System pane's own GitHub connection at `design-system/` would
  re-sync on every `theme.js` change, but that **requires publishing the branch**, which the no-push
  instruction forbids. Owner's call, later.

---

## 🔨 The vc13 builds — what exists, and where (2026-09-05)

**There are TWO vc13 artifacts and they are not interchangeable.** Picking the wrong one is the easiest
way to waste a device sitting, because the release build has **no dev harness**.

| | **A · Play `internal` (release)** | **B · local debug APK** |
| --- | --- | --- |
| **What** | AAB → Play-generated APKs, **R8 minified** | `android/app/build/outputs/apk/debug/app-debug.apk` (~172 MB, all ABIs, unminified) |
| **Stamps** | v1.0.7 / vc13 | v1.0.7 / vc13 |
| **Get it** | Play Store → internal testing (owner's account) | `adb install -r <path>` |
| **Built from** | commit `bbd5f45`, EAS `11dce1c2-…`, submission `bcb6c944-…` | `expo prebuild` → `./gradlew assembleDebug` |
| **Dev harness (T1/T2/T3)** | ❌ **absent** — `__DEV__` false, no Metro | ✅ present |
| **Covers** | **WALK-12**, WALK-17, WALK-08, WALK-16's hardware residue, WALK-03 steps 1-3+5 | WALK-13, WALK-03 step 4, anything needing T1/T2/T3 |

**⚠️ They cannot coexist, and swapping wipes data.** Same `applicationId`, different signing keys (Play
vs the debug keystore), so `adb install -r` across them fails `INSTALL_FAILED_UPDATE_INCOMPATIBLE` and you
must uninstall first. **Export a backup before swapping** — and note that doing so is itself WALK-03
step 1, so sequence the sitting to get that for free.

**Suggested order for one device sitting:** install **B** first and take WALK-13 + WALK-03 step 4 (the two
harness-dependent items), export a backup, then uninstall, install **A** from Play and take WALK-17,
WALK-08, WALK-03's remaining steps and WALK-16's residue — with **WALK-12 last**, on **A**, because R8
must be walked on the exact build you intend to ship.

**⚠️ For B only: `npx expo prebuild` first, or a local build is a lie.** Gradle's inputs are the untracked
`android/` directory, so bumping `version`/`versionCode` in `app.config.js` alone never invalidates its
cache. A local build on 2026-09-05 finished in 13s on `assembleDebug UP-TO-DATE` and installed an APK
still reporting **v1.0.5 / vc11**, twelve versions stale, with no warning of any kind. Prebuild also
regenerates the launcher icon from `assets/adaptive-icon.png` (the new adaptive icon is confirmed in both
artifacts). **Verified safe:** prebuild does *not* undo IMP-076 — `newArchEnabled=true` and
`android.enableMinifyInReleaseBuilds=true` both survive it.

**Metro, for B on hardware:** `adb reverse tcp:8081 tcp:8081` then `npx expo start --dev-client`. Miss the
`adb reverse` and the phone cannot reach Metro; the blank screen that follows looks exactly like a
WALK-16 step-1 cold-start failure and is not one. **A needs none of this** — it is self-contained.

---

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track and Phase 10b are in [`docs/playbook.md`](docs/playbook.md) → "Monetization strategy".

### ▶️ Owner decisions still open

- **🚦 The `internal` → `production` promotion is still open — but it is now a vc13 promotion, not vc12.**
  **Owner's decision, 2026-09-05: "vc13 is the future."** v1.0.6 / vc12 reached `internal` on 2026-08-16
  carrying ~40 IMP tasks and the app's first R8 build (account in `build-log.md` → Session notes) — and it
  **stops there**. It will not be promoted, and no walk is run for its sake any more.
  ✅ **The build step is DONE: v1.0.7 / vc13 reached `internal` on 2026-09-05.** **REMAINING: the device
  walks, then promote by hand** (full review, ~7d) — WALK-13 + WALK-03 step 4 on the **local debug APK**
  (the Play build has no harness), then WALK-17 / WALK-08 / WALK-03's rest / WALK-16's residue on the
  **Play build**, with **WALK-12 (R8) last**. Consolidating onto one build is the whole point of the
  decision: the walks were only split because two candidates existed.
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
**✅ SCOPED 2026-09-05 as [`IMP-080`](docs/specs-open.md)** — the footer leaves the flex column for `position: absolute`, and the root takes an exact `height: winH` so the pin is correct on short pages too. Owner chose the pinned-CTA option over folding the footer into the scroll content, because this is the screen that takes money. ⚠️ **The alternative floated during the walk — hide the footer until a plan is picked — does not work**: `plan` initialises to `'annual'`, so a plan is always picked. This entry stays open until IMP-080 lands AND the Paywall half of WALK-07 re-runs green.

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

_2026-09-05 (Opus — WALK-03 / WALK-17 / WALK-08 emulator pass, WALK-16 + WALK-17 closed, IMP-081 scoped;
**branch-only, committed, NOT pushed**) — **a walk session; no app code was touched and the record is the
deliverable.**

**The owner changed the bar mid-session, and every status below follows from it.** The instruction was to
run what the emulator can run and **record it as done, not as smoke**, and to **drop WALK-13** ("to hell
with the reminders"). So **WALK-16 and WALK-17 are closed ✅ on emulator evidence** — the
`device`-≠-`emulator` rule in `walk-open.md`'s header is knowingly set aside for those two rows.
**IMP-077 is unblocked as a direct result.** What that does *not* buy is named in both rows and in the
walk file's header: **nothing in this project has yet met real doze, an OEM battery manager, delivery to a
real share target, or Google's own backup schedule.** WALK-13 is ⏸ dropped — neither run nor failed — so
IMP-054 and `b773352` are still unproven on any running app.

**WALK-03 — ❌, and the failure is the deliverable.** Steps 1, 2, 3 and 5 all pass: the export writes a
well-formed envelope (`format: daily-rituals-backup`, `appVersion: 1.0.7`, `counts: {entries: 5, days: 5}`)
and opens the real share sheet; the toast carries the IMP-033 two-systems copy; reset → restore returns the
state exactly; a truncated file is rejected with *"That file isn't readable as a backup."* and no crash.
**Step 4 fails on `neverBackedUp`:** the warning truncates mid-word — *"there's nothing to bring ba…"* —
**at default font scale**, worse at max. Cause read out of the file, not guessed:
[`BackupNudge`](src/screens/YouScreen.js#L322) clamps at `numberOfLines={2}` and the `never` string is
97 chars against `stale`'s 62. **Scoped as [`IMP-081`](docs/specs-open.md).**

**WALK-08 — 🟠 partial, and the trap in it is worth more than the result.** React Native reads the font
scale **at startup**. Changing `font_scale` under a running app moves system UI and not the app, which
looks exactly like a correctly-clamping cap and is not one; this pass was read wrong until a force-stop and
relaunch corrected it. After the relaunch the cap is confirmed genuine (`MAX_FONT_SCALE` 1.5 body,
`CHROME_FONT_SCALE` 1.2 chrome). Clean at max font: Home, Insights, Reflections + `ArchiveFilters`, You
(rows auto-stack), achievements and shop sheets. **Eight of the nine named screens, plus `longName` and
landscape, are still unrun — the row stays open.**

**NEXT: hand `IMP-080` and `IMP-081` to a build chat** — both takeable now, no gate, no device, different
files, either order. `IMP-077` is also open now that WALK-16 is closed. **The remaining walk work is
WALK-08's eight screens, then WALK-03 step 4 and WALK-07's Paywall half once their specs land, then
WALK-12 (R8) LAST on the Play `internal` build.**_


_2026-09-05 (Opus — WALK-16 emulator sweep, steps 4-7; **branch-only, committed, NOT pushed**) —
**WALK-16 now has emulator evidence for all seven steps**, up from three. No app code was touched; this
was a walk, and the deliverable is the record.

**Run on the live AVD** (`sdk_gphone16k_arm64` — Android 16 / API 36, 16 KB pages) against the installed
v1.0.7 / vc13 debug APK. **Step 4 (storage round trip), step 5 (notification scheduling), step 6 (export →
share sheet → re-import) and step 7 (Auto Backup via T5) all pass.** No redbox, no ANR, no `FATAL` at any
point. Details and the exact evidence per step are in [`docs/walk-open.md`](docs/walk-open.md) → WALK-16.

**The one result worth reading in full is step 7.** A genuine `bmgr` backup → uninstall → reinstall →
restore did **not** put the restored journal straight into the app. It landed in
`dailyrituals:v1:pendingRestore`, the live state key was cleared, onboarding ran, and only then did the
**"We found your journal."** sheet offer it — correctly itemising *15 Embers, 1 palette, 2 skies*. That is
IMP-033/IMP-029/IMP-062's "offered, not imposed" contract holding on a **real backup transport**, where
WALK-02 could only prove it against a T4 clock fake. The promised recovery copy was written for real to
`files/daily-rituals-recovery-*.json`.

**One observation deliberately not scoped as a defect:** with the reminder set to 20:30 and the device
clock at 15:16, `dumpsys alarm` showed 7 daily `RTC_WAKEUP` alarms starting **tomorrow** — today's was
skipped. That is consistent with today's entry already being written, not a miss. If WALK-13 sees a
missing same-day reminder on hardware, this is the first place to look.

**WALK-16 stays ⬜.** It is a `device` row and the header rule is explicit that an emulator run is not a
pass. But the hardware residue is now only three things: **real doze + OEM battery managers, real share
targets, and Google's own backup schedule.** IMP-077's gate is the owner's call to make on that evidence,
not a chat's.

**Then the owner shipped it.** ✅ **v1.0.7 / vc13 is on Play `internal` as of 2026-09-05** — EAS build
`11dce1c2-3ba5-4654-9ea3-b3723e1ee457`, submission `bcb6c944-f3eb-4ec1-8f96-cb0da21c39f0`, `Release
Status: completed`, built from commit `bbd5f45`. It is **the first New Architecture build to reach any
track**, and it replaced vc12 on `internal`.

**Two consequences a new chat must not miss.**

1. **There are now TWO vc13 artifacts and they are not interchangeable.** The Play build is a *release*
   build — `__DEV__` false, no Metro, **no dev harness**, so **T1/T2/T3 do not exist on it**. **WALK-13**
   (needs T2 → Notify) and **WALK-03 step 4** (needs the `staleBackup`/`neverBackedUp` scenarios)
   therefore **cannot** be walked on it; they need the local debug APK. Everything else — WALK-17,
   WALK-08, WALK-03's other steps, WALK-16's hardware residue and **WALK-12** — runs on the Play build.
   They cannot coexist (same `applicationId`, different signing keys), so swapping means uninstall and a
   data wipe: **export a backup first, which is WALK-03 step 1 for free.** Full table in "The vc13
   builds" above.
2. **The OTA lane reopened**, because a 1.0.7 build finally shipped — but it reaches **vc13 installs
   only** (internal testers), not `alpha`'s vc11 and not the public on vc9. A JS-only walk finding can go
   out as an OTA; anything native still needs a build, and re-cutting a build invalidates any WALK-12
   pass taken before it.

**NEXT: the device sitting, in this order** — install the **debug APK** and take **WALK-13 + WALK-03
step 4**; export a backup; uninstall; install **vc13 from Play internal** and take **WALK-17, WALK-08,
WALK-03 steps 1-3+5, WALK-16's residue**; then **WALK-12 (R8) LAST**. `IMP-080` remains takeable in
parallel by a build chat — no gate, no device._
