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

> ## 🧭 WHAT TO TAKE RIGHT NOW (2026-09-08)
>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | **The backlog is empty** — `docs/specs-open.md` has no open `IMP-xxx` row. Last in: **IMP-099** (the entitlement identifier, 2026-09-08). Do not open a new row from reasoning alone; wait for an owner-filed issue or a failed walk. **One row is written but unscoped:** the `failed` card's *"you weren't charged"* claim + the missing reconcile on a resolved purchase — see the latest session note; it needs an owner call, not a chat's initiative. |
> | a **runtime walk** | 🚦 **The only queue with anything in it — [`docs/walk-open.md`](docs/walk-open.md), and its index says what is left.** ✅ **The OTA every open row was waiting for is LIVE — group `d42b7ec7`, 2026-09-08, all of IMP-094…099. Applies on the SECOND launch; never clear app data to "reset".** WALK-19 now owes **IMP-099's proof, and it needs no second purchase** — the owner already holds an active subscription, so relaunch or Restore settles it. WALK-07/WALK-08 re-run at max font. **Do not re-derive WALK-19 — read its RESULT block; steps 3 and 4a are proven.** |
> | a **design request** | See "Claude Design" below. The live request is **Insights**. |
>
> **The billing surface, honestly.** Five fixes are code-complete and all are shipped by OTA. **IMP-089 and
> IMP-090 are proven on hardware. IMP-092 is half proven** — its online half passed; its `catch` branch has
> never executed on a device. **IMP-091 has never been observed at all**, and may be unobservable on the
> Play-error path by design (see the session note). **None of that is a jest question** — `simService`
> fabricates every one of those outcomes.
>
> **Three standing warnings for anyone touching this surface.** ⚠️ **The two OTA traps — `--environment
> production`, and clearing app data deleting the update — are in [`docs/playbook.md`](docs/playbook.md) →
> "Two OTA traps"; CI owns the first one now. Narrative → [`docs/build-log.md`](docs/build-log.md).**
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

**✅ The branch is merged. `feat/design-push` fast-forwarded onto `main` and was pushed by the owner on
2026-09-08 (`cb3d60e`), ending the no-push rule and the hand-publishing that went with it.** ⚠️ **Ship
through CI now** — `release.yml` runs on `main`, so the test gate, the OTA native-file backstop, the billing
preflight and `--environment production` are all handled by the workflow. **Do not `eas update` by hand.**
A `Release-Lane: ota` trailer on the pushed commit is the whole ceremony. **The free-app improvement track is CLOSED** (owner, 2026-08-16):
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

⚠️ **vc13 and vc14 are history and on no track** — no further OTA, and **vc14 must never be promoted: it
shipped with no RevenueCat key, fell back to `simService` and granted Plus free** — invisible to CI, jest
and a green preflight, caught only by a human. Detail → [`docs/build-log.md`](docs/build-log.md).

**Ship mechanics + the OTA lane's rules** → [`docs/playbook.md`](docs/playbook.md) → "The OTA lane — what it
reaches" (moved 2026-09-08). **✅ API-36 compliance is met account-wide.**

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **New Architecture** ·
**Reanimated 4.1.1 + worklets 0.5.1** · `targetSdkVersion` **36**, `minSdk` **24** ·
`npm test` → **1063 passed, 96 suites** (verified 2026-09-08) + **3 zone tests × 2 pinned zones**.
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
| 076–093 | **The design-push + billing run.** New Architecture (076), motion vocabulary (077), design system (078), Paywall footer (080), backup warning (081), renewal date (082), cancel deep-link (083), the release build's simulation (084), the SDK probe (085), the OTA lane's empty key (086), the paid surface's reason (087), the purchase-overlay trap (088), restore-must-not-buy (089), the trial it cannot see (090), the pending escape (091), "nothing to restore" (092), the vanishing paywall (093). | mixed | ✅ **all code-complete, all shipped by OTA where the lane allowed, all archived** — specs in [`docs/build-log.md`](docs/build-log.md). ✅ **on `main` since 2026-09-08.** ⚠️ **Code-complete is not proven** — 089/090 are proven on hardware, 092 is half proven, **091 has never been observed**; see WALK-19 |
| 094–098 | **The 2026-09-07 walk-sitting fixes + the Recap's bar alignment.** The Annual Recap's phantom "quietest" month (094), DeeperInsights at max font (095), the Paywall badge over the selected tick (096), the dev harness's two lying labels (097), the Top moods bars starting at three different x (098). | OTA | ✅ **all code-complete, archived** in [`docs/build-log.md`](docs/build-log.md) — `085876a`, `3030bca`, `1e12cf7`, `7bced9f`, `edcea0b`. ✅ **shipped by OTA 2026-09-08, group `d42b7ec7`, manifest read back** (`rcAndroidKey` live). ⚠️ **095 and 096 are accepted on a screen, not by the suite** — WALK-08 at max font and WALK-07 at `font_scale` 2.0 in both nav modes. 094 and 098 are logic/style and owe nothing runtime |
| 099 | **The entitlement the store grants is the one the app must read.** `ENTITLEMENT_ID` was `'plus'`; the RevenueCat identifier is `Daily Rituals Plus`, so a **successful** purchase mapped to `null` and `buy()` reported `failed`. | OTA | ✅ **code-complete, archived** in [`docs/build-log.md`](docs/build-log.md) — **1068 green / 96 suites** (was 1063/96), export clean, +5 tests **proven red on the shipped tree first**. ✅ **shipped by OTA 2026-09-08, group `d42b7ec7`, manifest read back** (`rcAndroidKey` live). ⚠️ **The suite pins the string; only a device can confirm RevenueCat sends it** — WALK-19 owes that, and Restore/relaunch proves it without a second purchase |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, UNWALKED.** R8 must be walked on the build you actually ship, so it rides **vc15 or later**; walk = WALK-12, on hardware, last in the sitting |
| 057 | Historical `dayKey` migration | Build | 🔒 **reserved, not missing** — cannot be written until real device numbers come back from the dev panel's "Data health" reporter. See below |
| — | **Plus is ON** (`PLUS_ENABLED = true`, commit `7d2e515`) | Build | ✅ **and vc15 can take money for real** — proven on a device. Cash ember packs were decoupled from the flag first (`6590834`), caught mid-build: flipping `PLUS_ENABLED` had armed the Shop's "Gather Embers" purchase path as a side effect |

---

## 🎨 Claude Design (IMP-078)

**Project `Daily Rituals Design System`** · id `7bf44d09-f93a-42d2-a8b6-d412d671cf60` · writable ·
**13 cards** (Tokens · Frozen · Components · Screens day+night). Regenerate after a theme change with
`node scripts/gen-design-system.js`, then re-push — the cards are generated from `theme.js`/`data.js`/
`art.js` so they cannot drift, but they do not update themselves. **No auto-sync** — but the reason expired: it needed the branch
published, and `main` now carries `design-system/`. Wiring the pane's GitHub connection to it is an owner
call, not a chat's.

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

**✅ No live blocker.** Everything below the line is a walk, an owner decision, or a reserved number —
runtime proof, not code. ⚠️ **The one thing genuinely unproven is IMP-099**: the suite pins
`ENTITLEMENT_ID` to `'Daily Rituals Plus'` and *nothing in this repo can confirm that is what RevenueCat
sends.* Relaunch or Restore on the shipped OTA settles it — **no second purchase needed**, the owner's
subscription from the 2026-09-08 failed attempt is active.

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

_2026-09-08, later (Opus — **the first completed purchase in the app's life was reported as a failure. The
entitlement identifier never matched the dashboard, and no test could have seen it.**) — on `main`, merged
and pushed by the owner._

**What the owner hit.** A Play licence-tester purchase: Play confirmed the subscription, the app said
**"That didn't go through … you weren't charged."** Both from the same successful transaction.

**What finished.** **IMP-099**, built and archived to [`docs/build-log.md`](docs/build-log.md).
`Purchases.purchasePackage()` **resolved** — nothing failed — but `toEntitlement` read
`entitlements.active['plus']` while the RevenueCat identifier is **`Daily Rituals Plus`**, so the lookup
missed, the mapper returned `null`, and `buy()` read a resolved purchase as `{ kind: 'failed' }`. Fixed in
three parts: the constant now carries the real identifier; `toEntitlement` gains a **sole-entitlement
fallback** (one active entitlement grants Plus whatever it is called — this app sells exactly one thing;
two or more stay ambiguous and it declines to guess); and both fixtures key off `ENTITLEMENT_ID` instead of
a literal `plus`, which is the reason 1063 green tests never noticed. **RevenueCat cannot rename an
entitlement identifier** (owner confirmed), so the code moved, not the dashboard.

**The proof.** +5 tests, **run red against the shipped tree first** — 3 failed, and the decisive one
reproduced the owner's bug exactly: `buy()` returned `"failed"` on a resolved purchase. **1068 passed, 96
suites** (was 1063/96), `expo export` clean. ⚠️ **The suite proves the mapper, not the dashboard** — nothing
in this repo can verify `'Daily Rituals Plus'` is what RevenueCat actually sends. **WALK-19 owes that.**

**✅ SHIPPED — the first release through CI since the merge.** One `Release-Lane: ota` push carried all six
(IMP-094…099): an OTA ships the whole bundle, not a diff. **Group `d42b7ec7`, runtime `1.0.9`, 2026-09-08.**
**Manifest read back before believing the green check** — `rcAndroidKey` is a live `goog_…`, so the IMP-086
trap did not fire; CI owns `--environment production` now, and hand-publishing is over.
⚠️ **The first attempt failed and shipped nothing** — `eas-version: latest` moved to eas-cli 23.2.0, whose
`@oclif/plugin-autocomplete` wants node >=22, against a workflow pinned to Node 20. All four `setup-node`
pins are now 24 (`c2f35a1`). **`eas-version: latest` will do this again** — pinning it is an open owner call.

**The exact next step.** 👤 **Owner, on the phone: open, wait ~15s, force-kill, open again** (an OTA applies
on the SECOND launch; **never clear app data** — that deletes the update). Plus should appear on that
relaunch via the launch check at [`RitualsApp.js:385`](src/RitualsApp.js#L385), or via **Restore**. That is
**WALK-19's IMP-099 item** and it needs no second purchase. Then **WALK-07** and **WALK-08** are unblocked —
re-run at max font on this bundle.

**Left open on purpose, and it is a real defect.** The `failed` card still claims *"you weren't charged"* on
a path that cannot know it, and `run()` still reaches the result phase with **no store reconcile** —
IMP-093's reconcile fires only for a flow abandoned while *pending*. Its primary button is "Try again",
which walks an already-subscribed buyer back into Play. IMP-099 removes the **trigger**; the lie is still
there behind it. **Needs its own row — owner call.**

_2026-09-08 (Sonnet — **IMP-098 built the day after it was scoped: the Annual Recap's Top moods bars now
share one label width, reusing IMP-067's `moodLabelWidth`.**) — branch-only, NOT pushed._

**What finished.** [`AnnualRecap.js`](src/screens/AnnualRecap.js) now reuses `moodLabelWidth` from
`../insights/moodMixLayout`: the Top-moods label column is `width: labelW` (computed above the early
return) instead of `minWidth: 84, flexShrink: 1` — no new constant, no shared component. New
`__tests__/screens/AnnualRecap.test.js` (+4), verified red against the pre-fix tree first (3/4 failed).
**1063 passed, 96 suites** (was 1059/95), export clean. Committed `edcea0b`. Spec archived to
[`docs/build-log.md`](docs/build-log.md); [`docs/specs-open.md`](docs/specs-open.md) is empty again.
⚠️ **Gotcha for next time:** `T` wraps its own `Text` (host `Text` → composite `T`), so the label column's
`View` is **three** `.parent` hops above `view.getByText(mood)`, not one as the spec's example implied.

**The exact next step.** No build queue left. **DeeperInsights.js:139** carries the identical `minWidth`
defect ("Moods that travel together") and remains deliberately unscoped — an owner call, not a bug fix.
Otherwise unchanged: IMP-094…098 are all committed and **unshipped** (OTA lane, no `eas update` published),
and **WALK-07/WALK-08 still need a build that carries 095/096** before they can be re-run.
