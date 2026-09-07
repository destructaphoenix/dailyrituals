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

> ## 🧭 WHAT TO TAKE RIGHT NOW (2026-09-07)
>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | ⛔ **There isn't one — [`docs/specs-open.md`](docs/specs-open.md) is EMPTY.** IMP-093 landed and shipped on 2026-09-07. ⚠️ **Do not open a new billing row from reasoning alone**: every row since IMP-084 came out of a device sitting, and the two most recent (IMP-092's cache limit, IMP-093) were found by someone holding the phone, not by reading the code. |
> | a **runtime walk** | 🚦 **The only queue with anything in it — [`docs/walk-open.md`](docs/walk-open.md), and its index says what is left.** In one line: WALK-19 needs a purchase attempt, and **WALK-07 / WALK-03 step 4 / WALK-11 are ready now** on a debug build of this branch. **Do not re-derive WALK-19 — read its RESULT block; steps 3 and 4a are proven.** |
> | a **design request** | See "Claude Design" below. The live request is **Insights**. |
>
> **The billing surface, honestly.** Five fixes are code-complete and all are shipped by OTA. **IMP-089 and
> IMP-090 are proven on hardware. IMP-092 is half proven** — its online half passed; its `catch` branch has
> never executed on a device. **IMP-091 has never been observed at all**, and may be unobservable on the
> Play-error path by design (see the session note). **None of that is a jest question** — `simService`
> fabricates every one of those outcomes.
>
> **Three standing warnings for anyone touching this surface.** ⚠️ **The two OTA traps that cost four
> rounds — `eas update` needs `--environment production`, and clearing app data deletes the downloaded
> update — moved to [`docs/playbook.md`](docs/playbook.md) → "Two OTA traps". Read them before publishing.**
> Full narrative → [`docs/build-log.md`](docs/build-log.md) → "The 2026-09-06 billing incident".
>
> 1. ⚠️ **jest cannot see any of this.** It renders with `__DEV__` true and cannot read a published manifest,
>    so every guard here is a **source assertion** — each was proven to fail on the real defect before it
>    shipped. A green suite is not evidence about billing.
> 2. ⚠️ **IMP-088's escape is NOT a timeout-to-failure and must never be "simplified" into one.** A real
>    purchase takes minutes on INR/3DS flows; declaring failure mid-charge is worse than hanging.
> 3. ⚠️ **A hung purchase cannot be reproduced cheaply.** Restore was the obvious no-money diagnostic and it
>    does not work: it answers instantly from RevenueCat's local cache (that is IMP-092). Testing the pending
>    overlay requires a real purchase attempt.
>
> ✅ **Settled, do not re-raise.** The free trial is **burned on the owner's Google account** (subbed and
> unsubbed before; Play grants one per account ever) — Play saying "charging today" is Play being *correct*.
> RevenueCat has **no sandbox for Google Play**, and RC's own Play service-account credential is configured.
> ⚠️ **Real charges are possible on `internal`** — confirm every account on that tester list is a Play
> **license tester**.

**The whole design push lives on `feat/design-push`, which is NEVER pushed, NEVER given a `Release-Lane:`
trailer, and NEVER merged to `main`** without a separate owner decision. ⚠️ **That is why every OTA on this
lane is published BY HAND** — CI only runs on `main`, so `release.yml`'s guards never fire here, and
`--environment production` is on you. **The free-app improvement track is CLOSED** (owner, 2026-08-16):
`IMP-001`–`IMP-075` are done bar the deferred `IMP-022` and the reserved `IMP-057`; **do not open new
free-track rows.** **`IMP-057` is reserved, not missing** — do not reuse the number, and **`IMP-079` is
burnt** (used for a path written and deleted the same session). **IMP-044 claims no queue slot** — it rides
the next build and needs only WALK-12.

---

**App status — all four Play tracks.** Read from the Play Developer API 2026-09-05 and corrected 2026-09-06;
authoritative, do not re-derive from an older note.

| Track | Active | API | Note |
| --- | --- | --- | --- |
| `production` (public) | **1.0.3 / vc9** | 36 ✅ | live since 2026-07-30 |
| `beta` (open testing) | **1.0.3 / vc9** | 36 ✅ | was vc8/API 35 — promoted, compliance gap closed |
| `alpha` (closed testing) | **1.0.6 / vc12** | 36 ✅ | ⚠️ **NOT the owner's track** — their phone is on `internal`. The lesson this row cost two rounds of confusion to learn: Play serves the **highest-priority track the account qualifies for** (internal > closed > open > production), so **a build on `internal` is invisible to a device that is only a closed tester** |
| `internal` | **1.0.9 / vc15** | 36 ✅ | ✅ **SHIPPED 2026-09-06**, confirmed from `eas submit:list` not inferred. EAS build `e97db74d-…`, submission `a43f49c1-…`, from commit `980cdad`. Runtime `1.0.9`. ✅ **With the OTAs applied it takes money for real** — proven on a device (WALK-19). ⚠️ **The binary alone does NOT** — vc15's embedded bundle carries IMP-085's broken probe, so a device that has not taken the OTAs is back to a dead paywall. **The capability lives in the update, not the build.** Unblocks WALK-19, WALK-18, WALK-11, WALK-12 |

⚠️ **vc13 and vc14 are history and on no track** — they take no further OTA, and **vc14 must never be
promoted: it shipped with no RevenueCat key, fell back to `simService` and granted Plus free.** That defect
was invisible to CI, to jest and to a green preflight, and was caught only by a human subscribing in
airplane mode. Both builds' full detail is in [`docs/build-log.md`](docs/build-log.md).

**Ship mechanics.** Builds **auto-submit to `internal`** (`eas.json` → `submit.production.android.track`).
Reaching the public is the **manual `internal` → `production` promotion** in Play Console, which gets the
full ~7d review — and it should not be taken until the device walks clear. **✅ API-36 compliance is met
account-wide**; every active release on every track is `targetSdkVersion 36`.

**⚠️ The OTA lane.** `eas update` publishes to Expo's CDN — **no Play track, no Google, no review** — gated
only by **channel** (`production`) + a **matching `runtimeVersion`** (= `appVersion`). It is **`1.0.9`,
which means vc15 installs and nothing else** (`alpha` on vc12 and `beta`/`production` on vc9 receive
nothing). An installed build takes an OTA regardless of which track it came from, and **it applies on the
SECOND launch**. **Anything native needs a build**, and **a `bump:native` closes the lane until that
versionCode actually ships** — the trap IMP-076 and IMP-077 both sprang. **Do not OTA a fix and then treat
WALK-12's R8 pass as valid:** R8 runs at build time, so the code on the device is no longer what was walked.

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **New Architecture** ·
**Reanimated 4.1.1 + worklets 0.5.1** · `targetSdkVersion` **36**, `minSdk` **24** ·
`npm test` → **1031 passed, 93 suites** (verified 2026-09-07) + **3 zone tests × 2 pinned zones**.
⚠️ **Run `npm test`, not bare `npx jest`**, or the zone half is skipped. Version-checking a phone, the
track-reading script and the rest of the stack notes are in [`docs/playbook.md`](docs/playbook.md).

---

## 🔧 Improvements backlog (post-launch — ACTIVE TRACK)

Opus scopes each owner-filed issue into a numbered `IMP-xxx` spec in
[`docs/specs-open.md`](docs/specs-open.md). Sonnet takes the **first ⬜** row, opens **only that spec**,
executes it, commits with the exact message given, ticks the row, moves the spec to `docs/build-log.md`, and
writes the session note. **Full detail for every ✅ row is in [`docs/build-log.md`](docs/build-log.md).**

| ID | Title | Lane | Status |
| --- | --- | --- | --- |
| 001–075 | **Every free-track task.** Search, custody + 30-day trash, multi-moods, Annual Recap, deeper insights, heatmaps, local `dayKey`, prompt packs, a11y labels, the IMP-063…075 polish run, R8, dev harness, backup/restore, reminders. | mixed | ✅ **all done except the two rows below** — full detail per task in [`docs/build-log.md`](docs/build-log.md); git is the record. Do not re-derive from this table. |
| 076–093 | **The design-push + billing run.** New Architecture (076), motion vocabulary (077), design system (078), Paywall footer (080), backup warning (081), renewal date (082), cancel deep-link (083), the release build's simulation (084), the SDK probe (085), the OTA lane's empty key (086), the paid surface's reason (087), the purchase-overlay trap (088), restore-must-not-buy (089), the trial it cannot see (090), the pending escape (091), "nothing to restore" (092), the vanishing paywall (093). | mixed | ✅ **all code-complete, all shipped by OTA where the lane allowed, all archived** — specs in [`docs/build-log.md`](docs/build-log.md). ⚠️ **branch-only, never pushed.** ⚠️ **Code-complete is not proven** — 089/090 are proven on hardware, 092 is half proven, **091 has never been observed**; see WALK-19 |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, UNWALKED.** R8 must be walked on the build you actually ship, so it rides **vc15 or later**; walk = WALK-12, on hardware, last in the sitting |
| 057 | Historical `dayKey` migration | Build | 🔒 **reserved, not missing** — cannot be written until real device numbers come back from the dev panel's "Data health" reporter. See below |
| — | **Plus is ON** (`PLUS_ENABLED = true`, commit `7d2e515`) | Build | ✅ **and vc15 can take money for real** — proven on a device. Cash ember packs were decoupled from the flag first (`6590834`), caught mid-build: flipping `PLUS_ENABLED` had armed the Shop's "Gather Embers" purchase path as a side effect |

---

## 🎨 Claude Design (IMP-078)

**Project `Daily Rituals Design System`** · id `7bf44d09-f93a-42d2-a8b6-d412d671cf60` · writable ·
**13 cards** (Tokens · Frozen · Components · Screens day+night). Regenerate after a theme change with
`node scripts/gen-design-system.js`, then re-push — the cards are generated from `theme.js`/`data.js`/
`art.js` so they cannot drift, but they do not update themselves. **No auto-sync**: pointing the pane's
GitHub connection at `design-system/` would need the branch published, which the no-push rule forbids.

**Ask for ONE screen per request** — "redesign the app" produces mush. **The live request is
Insights** (owner, 2026-09-05). ⚠️ **The four standing rules — baseline-first, specs in token names, the
frozen sun/rays, and design-is-not-enablement — plus the motion-card and night-shot rules now live in
[`docs/playbook.md`](docs/playbook.md) → "Claude Design — standing rules". Read them before asking.**
**Porting a returned design is a normal build task** — a new `IMP-xxx` scoped by Opus. Claude Design does
not emit React Native; it returns HTML/CSS previews plus a spec.

---

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track, the parked phase ladder and the standing test-date rule are in
> [`docs/playbook.md`](docs/playbook.md).

**✅ No live blocker.** The 2026-09-06 "vc14 fakes purchases" blocker is **closed** — vc15 carries IMP-084
and replaced vc14 on `internal`. What remains is runtime proof, not code: everything below the line is a
walk, an owner decision, or a reserved number.

### ▶️ Owner decisions still open

- **🚦 The `internal` → `production` promotion.** **vc15 is the live `internal` build and the only
  promotion candidate.** Remaining: the device walks, then promote by hand (full review, ~7d).
  🚦 **WALK-19 gates it.** ⚠️ vc12 will not be promoted (owner, 2026-09-05) and vc14 must never be.
- **Cash embers: settled in principle (dropped 2026-08-03), not finalised.** It determines which Play
  products get created. Full argument in the playbook.
- **Perk #6, the PDF, is still not built** (IMP-022, deferred). It was **cut** from `PLUS_PERKS` rather
  than built, which is how `PLUS_ENABLED` flipped honestly. Gate checklist in the playbook → Phase 10b.

### 🟡 IMP-056 residual + the IMP-057 decision (2026-08-10)

`dayKey` is now derived locally (walked both offset directions). **Existing entries were deliberately not
migrated**, leaving two things:

- **The residual — nothing to act on.** Old entries keep their UTC key, so for ~a day a negative-offset user
  can have last evening's *already-stored* entry answer to today's key. New writes are correct immediately;
  old data self-heals as those keys age out.
- **IMP-057 is the owner's decision, not a build chat's.** The Inspector's "Data health" group counts rows
  disagreeing with `dayKeyOf()` and whether remapping moves `currentStreak`. **It reads 0 on the emulator
  fixture — meaningless** (`gen-v2-fixture.js` seeds ids the reporter doesn't key on), and **real device
  numbers have never been read.** Once they exist IMP-057 can be scoped — noting remapping can move an entry
  off a day and **break a live streak**: correct, but it reads as a regression to whoever it happens to.

### ⛔ Parked

- **iOS (Phase 11):** blocked on a Mac / EAS macOS + Apple Developer Program enrollment. The Phase 6 iOS
  real-billing row is blocked on the same. Per-step runbook in the playbook → Phase ladder.
- **IMP-044 (R8):** on for release builds since 2026-08-08, and **jest cannot prove it** — the failure mode
  is silent stripping at runtime, not a compile error. It rides the next build; **WALK-12** is the checklist.

---

## Last session note

_Only the **two newest** notes stay here; each chat moves the older one into
[`docs/build-log.md`](docs/build-log.md) → "Session notes". Keep them to the shape below: what finished,
the proof, the exact next step._

_2026-09-07, late (Opus — **IMP-093 written and landed the same day the walk found it. The build queue is
empty again and everything now waits on an OTA plus a phone.**) — branch-only, NOT pushed._

**What finished.** **IMP-093** (`061b1ff`) — the paywall no longer walks away from a purchase it started.
`dismiss()` reconciles whenever a flow was **in flight**, not only when the 20-second escape had armed;
`usePurchaseFlow` exposes `pending`/`dismiss`; `Paywall` publishes them to whoever owns its Modal through
a `closeGuard` ref cleared on unmount; `RitualsApp`'s `onRequestClose` reconciles **then closes**.
**1031 passed, 93 suites** (was 1017). Export clean. Archived to
[`docs/build-log.md`](docs/build-log.md); [`docs/specs-open.md`](docs/specs-open.md) is empty again.

**Three things worth carrying:**

1. ⚠️ **The fix deliberately does NOT keep the card on screen.** Back still closes the paywall. Refusing
   to close would have re-created IMP-088's trap for the first 20 seconds, when no exit exists — so
   **IMP-091 stays unobservable on the Play-error path, and that is the correct outcome, not a
   regression.** The device acceptance for IMP-093 is *"back out of a pending purchase and confirm the app
   asks the store"*, **not** *"step 4c now shows a Close button"*. Do not re-open 4c expecting one.
2. ⚠️ **Scope correction, recorded rather than quietly dropped.** The spec named two mount sites; only
   `RitualsApp` wraps `Paywall` in a `Modal`. Onboarding's mount is an absolutely-positioned `View` with
   no `onRequestClose` to route, so a back press there is unhandled — **a separate pre-existing gap,
   neither fixed nor introduced here.**
3. ✅ **The two behavioural guards were verified to FAIL against the old `wasStuck` gate before being kept**
   — worth doing here specifically, because jest runs `simService` and fabricates every purchase outcome.

**The exact next step.** ✅ **IMP-093 shipped by OTA 2026-09-07** — group
`964e4fc2-709c-48b1-bba1-25c603722b1c`, runtime 1.0.9, manifest read back (key non-empty, serving id
matches the publish). WALK-19's remaining steps need a **purchase attempt** (4b, 4d–4f, 5–10), so
the next billing sitting is the one where money moves. ✅ **Not blocked on any of that: WALK-07, WALK-03
step 4 and WALK-11**, which need the **local debug APK** — it cannot coexist with the Play build, so
**export a backup first (that export is WALK-03 step 1).** **Nothing is promoted `internal` →
`production`.**


_2026-09-07, afternoon (Opus — **WALK-19 re-ran on hardware: two fixes proven, one half-proven, one
unobservable — and the reason it is unobservable is a new defect.**) — branch-only, NOT pushed._

**What ran.** WALK-19 steps 3, 4a and 4c on v1.0.9 / vc15 from Play `internal`, license tester, against the
2026-09-07 OTA — **bundle confirmed with no cable** (the Plus banner read **"See Plus"**, a string that did
not exist before that OTA). **Full paragraph → [`docs/walk-open.md`](docs/walk-open.md) → WALK-19 → RESULT;
do not re-derive it here.** ✅ **IMP-090 proven** — and "Subscribe" means the live offering exposes **no free
phase at all**, so the old hardcoded *"Start 7-day free trial"* was never backed by anything the app could
reach. ✅ **IMP-089 proven**, which also closes **IMP-092's online half**. ⬜ **IMP-091 not observed** —
Play's no-connection page has no dismiss control but Back, and Back closed the whole paywall. **Do not let
"IMP-088 does not work" enter the record; it still has not been tested.** 🆕 **IMP-093 scoped here.**

**Two gaps on step 3 that cannot be closed on this device**, recorded rather than papered over: the
**trial-eligible CTA branch** (needs an account that has not burned its trial — this one has, forever) and
the **onboarding paywall mount** (needs a data clear, which deletes the OTA). ⚠️ **This sitting corrected the
IMP-088 record**, written as *"force-quit was the only way out."* **Back was always a way out** — the card's
*"Don't close the app"* was talking the user out of the one thing that worked; that is step 3 of IMP-093.
