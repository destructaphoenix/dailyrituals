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
> | a **build task** | ✅ **IMP-101 is done — the queue is empty.** ⚠️ **IMP-102 is BLOCKED on an owner answer** — see Open items. Nothing else is open in [`docs/specs-open.md`](docs/specs-open.md). |
> | a **runtime walk** | 🚦 **The only queue with anything in it — [`docs/walk-open.md`](docs/walk-open.md), and its index says what is left.** ✅ **The OTA every open row was waiting for is LIVE — group `d42b7ec7`, 2026-09-08, all of IMP-094…099. Applies on the SECOND launch; never clear app data to "reset".** ✅ **IMP-099 is PROVEN — Plus works on the owner's device.** Left: WALK-07/WALK-08 at max font, **WALK-19's steps 4b, 4d–4f, 5–10 + the aeroplane-mode Restore**, WALK-12, WALK-18. **Do not re-derive WALK-19 — read its RESULT block; steps 3 and 4a are proven.** |
> | a **design request** | See "Claude Design" below. The live request is **Insights**. |
>
> **The billing surface, honestly.** ✅ **It works end to end — a real entitlement grants Plus (2026-09-08).**
> **089, 090 and 099 are proven on hardware; 092 is half proven** (its `catch` never ran on a device);
> **091 has never been observed** and may be unobservable by design. **None of that is a jest question.**
>
> **Three standing warnings for anyone touching this surface.** ⚠️ **The two OTA traps — `--environment
> production`, and clearing app data deleting the update — are in [`docs/playbook.md`](docs/playbook.md) →
> "Two OTA traps"; CI owns the first one now. Narrative → [`docs/build-log.md`](docs/build-log.md).**
>
> **The five standing warnings + what is settled** (jest is blind here; IMP-088's escape is not a
> timeout; a hung purchase cannot be reproduced cheaply; the burned trial; real charges on `internal`) →
> [`docs/playbook.md`](docs/playbook.md) → "Billing — standing warnings". **Read before touching this surface.**

**✅ The branch is merged** — `feat/design-push` fast-forwarded onto `main` 2026-09-08 (`cb3d60e`), ending
the no-push rule. ⚠️ **Ship through CI now**: `release.yml` runs on `main`, so the test gate, the native-file
backstop, the billing preflight and `--environment production` are the workflow's job. **Never `eas update`
by hand** — a `Release-Lane: ota` trailer on the pushed commit is the whole ceremony.
**The free-app track is CLOSED** (owner, 2026-08-16): `IMP-001`–`IMP-075` done bar the deferred `IMP-022`
and reserved `IMP-057`; **do not open new free-track rows.** **`IMP-079` is burnt.** **IMP-044 claims no
queue slot** — it rides the next build and needs only WALK-12.

---

**App status — all four Play tracks.** Read from the Play Developer API 2026-09-05 and corrected 2026-09-06;
authoritative, do not re-derive from an older note.

| Track | Active | API | Note |
| --- | --- | --- | --- |
| `production` (public) | **1.0.3 / vc9** | 36 ✅ | live since 2026-07-30 |
| `beta` (open testing) | **1.0.3 / vc9** | 36 ✅ | was vc8/API 35 — promoted, compliance gap closed |
| `alpha` (closed testing) | **1.0.6 / vc12** | 36 ✅ | ⚠️ **NOT the owner's track** — their phone is on `internal`. The lesson this row cost two rounds of confusion to learn: Play serves the **highest-priority track the account qualifies for** (internal > closed > open > production), so **a build on `internal` is invisible to a device that is only a closed tester** |
| `internal` | **1.0.9 / vc15** | 36 ✅ | ✅ **SHIPPED 2026-09-06**, confirmed from `eas submit:list` not inferred. EAS build `e97db74d-…`, submission `a43f49c1-…`, from commit `980cdad`. Runtime `1.0.9`. ✅ **With the OTAs applied it takes money for real** — proven on a device (WALK-19). ⚠️ **The binary alone does NOT** — vc15's embedded bundle carries IMP-085's broken probe, so a device that has not taken the OTAs is back to a dead paywall. **The capability lives in the update, not the build.** Unblocks WALK-19, WALK-18, WALK-11, WALK-12 |

⚠️ **vc13 and vc14 are history and on no track** — no further OTA, and **vc14 must never be promoted: no
RevenueCat key, fell back to `simService`, granted Plus free** — invisible to CI, jest and a green
preflight. Detail → [`docs/build-log.md`](docs/build-log.md).

**Ship mechanics + OTA lane rules** → [`docs/playbook.md`](docs/playbook.md) → "The OTA lane". **✅ API-36 met account-wide.**

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **New Architecture** ·
**Reanimated 4.1.1 + worklets 0.5.1** · `targetSdkVersion` **36**, `minSdk` **24** ·
`npm test` → **1079 passed, 96 suites** (verified 2026-09-08) + **3 zone tests × 2 pinned zones**.
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
| 099 | **The entitlement the store grants is the one the app must read.** `ENTITLEMENT_ID` was `'plus'`; the RevenueCat identifier is `Daily Rituals Plus`, so a **successful** purchase mapped to `null` and `buy()` reported `failed`. | OTA | ✅ **code-complete, archived** in [`docs/build-log.md`](docs/build-log.md) — **1068 green / 96 suites** (was 1063/96), export clean, +5 tests **proven red on the shipped tree first**. ✅ **shipped by OTA 2026-09-08, group `d42b7ec7`, manifest read back** — and ✅ **PROVEN on hardware the same day: Plus is live on the owner's device.** ⚠️ The walk proved the outcome, **not which of the two routes granted it** (named lookup vs sole-entitlement fallback) — **the fallback is not dead code, do not remove it**. ⚠️ **The suite pins the string; only a device can confirm RevenueCat sends it** — WALK-19 owes that, and Restore/relaunch proves it without a second purchase |
| 100 | **Every purchase error becomes `failed`.** `e.code` is the stringified numeric enum (`"6"`, `"10"`, `"20"`), `mapError.js` matched names, so only `userCancelled` worked. Killed the `owned` rescue path, read `PAYMENT_PENDING` as "you weren't charged", broke Change plan. | OTA | ✅ **code-complete, archived** in `docs/build-log.md` — `3774195`. **1077 passed, 96 suites** (was 1068/96), export clean, +9 tests, 6/7 new assertions proven red first. ⚠️ **Walk owed** — WALK-19 needs an already-owns-it Subscribe tap |
| 101 | **The `failed` card claims "you weren't charged" and never asks the store.** Asserted on a resolved purchase, a pending charge, and every unrecognised error; `run()` reaches the result phase with no reconcile, and offers "Try again". | OTA | ✅ **code-complete, archived** in `docs/build-log.md` — `f170c0a`. **1079 passed, 96 suites** (was 1077/96), export clean, +2 tests. ⚠️ **No new walk owed** — covered by WALK-19 |
| 102 | **+3 freezes on every completion, not once.** `subscribe()` grants them for `success`, `owned` **and** `restored`; "Change plan" reopens the paywall for a member, so the loop is reachable — and IMP-100 is about to make the `owned` half work. | OTA | 🔒 **BLOCKED on an owner answer** (joining gift vs per-period perk) — see Open items. Do not build or guess |
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
runtime proof, not code. ✅ **Plus works on hardware (owner, 2026-09-08)** — a real Play entitlement now
resolves and the paywall grants membership. ⚠️ **That did NOT validate the `ENTITLEMENT_ID` string**: the
shipped bundle grants Plus by the named lookup **or** IMP-099's sole-entitlement fallback, and from outside
the two are indistinguishable. **Do not remove the fallback** — see WALK-19.

### ▶️ Owner decisions still open

- **🚦 The `internal` → `production` promotion.** **vc15 is the live `internal` build and the only
  promotion candidate.** Remaining: the device walks, then promote by hand (full review, ~7d).
  🚦 **WALK-19 gates it.** ⚠️ vc12 will not be promoted (owner, 2026-09-05) and vc14 must never be.
- **🔒 IMP-102 — are the 3 streak freezes a JOINING GIFT or a PER-PERIOD PERK?** `subscribe()` grants
  `+3` on every completion, so `restored` and `owned` re-grant them. **Joining** ⇒ gate on `plus` being
  false at grant time. **Per-period** ⇒ still must not fire on a re-recognition. **A chat may not guess
  this** — the spec is written and waits on the answer.
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

_2026-09-08, latest (Sonnet — **IMP-101 fixed: the `failed` card claimed "you weren't charged" and `run()`
never asked the store before declaring failure.**) — on `main`, committed, not shipped._

**What finished.** **IMP-101**, archived to [`docs/build-log.md`](docs/build-log.md), commit `f170c0a`.
`usePurchaseFlow`'s `run()` now `await checkEntitlement(service)` **before** `clearTimer()` when a `buy`
resolves to `failed`, promoting to `success` if the store confirms — order is load-bearing, keeping
IMP-088's escape armed for the reconcile's duration. `resultCopy()` gained a `platform` param and a buy-mode
branch (mirroring IMP-092's restore branch): the buy `failed` card now reads "We couldn't confirm that... If
you were charged it will appear shortly" instead of denying a charge happened. Restore's variant is
untouched.

**The proof.** +2 tests in `purchaseFlow.test.js` (store confirms → ends in `success`; store also can't
confirm → new copy, no denial). Updated `pendingEscape.test.js`'s IMP-092 `resultCopy` block, which had
pinned the exact lie this row removes. **1079 passed, 96 suites** (was 1077/96), export clean.

**Not shipped** — committed only, no trailer, no release requested. **No new walk owed** — WALK-19 already
covers this surface.

**The exact next step.** **The build queue is empty** — `docs/specs-open.md` now holds only IMP-102, which
stays 🔒 **BLOCKED on the owner's joining-gift-vs-per-period-perk answer** (see Open items). The next build
chat should check whether that answer has arrived; if not, there is no unblocked IMP row to take.

_2026-09-08, earlier (Sonnet — **IMP-100 fixed: the Android bridge sends a numeric error code, `mapError.js`
matched names, so every non-cancel error read as `failed`.**) — on `main`, committed, not shipped._

**What finished.** **IMP-100**, archived to [`docs/build-log.md`](docs/build-log.md), commit `3774195`.
Added a `RC_CODE` exact-match map for the real numeric codes (`"6"`→owned, `"20"`→new **`deferred`** kind,
etc.), name-matching kept as fallback for iOS/web/sim. `PlusFlow.js` gained `RESULT_META.deferred`
("Payment still processing," `dismissTo: 'paywall'`, no "Try again"). `revenueCatService.js` needed no
functional change — both `buy()`/`restore()` already passed unmatched kinds through correctly.

**The proof.** +9 tests, new `mapError.test.js` block **run red first** (6/7 failed pre-fix).
`revenueCatService.test.js` now asserts `getCustomerInfo` is actually **called** on `"6"` — the `owned`
rescue path executing, not just the label. **1077 passed, 96 suites** (was 1068/96), export clean.

**Not shipped** — committed only, no trailer, no release requested. **Walk owed**, added to
`docs/walk-open.md` WALK-19 step 4: `owned` has never executed on a device before this fix.

**The exact next step.** **IMP-101** next — spec at
[`docs/specs-open.md#imp-101`](docs/specs-open.md#imp-101): removes the "you weren't charged" claim + adds
the missing store reconcile. **IMP-102 stays blocked** on the owner's joining-gift-vs-per-period-perk answer.
