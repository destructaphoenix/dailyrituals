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

> ## 🧭 WHAT TO TAKE RIGHT NOW — read this before the tables below (2026-09-06)
>
> ## 🔴 vc14 ON `internal` SHIPS THE PURCHASE SIMULATION — FIXED IN CODE, NOT YET IN A BUILD
>
> **The owner subscribed in AIRPLANE MODE and it succeeded** (2026-09-06, proven on a device). Real Play
> Billing cannot complete a purchase with no network; `simService` can, and grants Plus **free**. So
> **every claim below that Plus is live is wrong.**
> ✅ **[IMP-084](docs/build-log.md) LANDED the same day, commit `da77a7d`** — the queue is empty again.
> 🔴 **But the fix is BUILD-lane and no build carries it yet.** Until one ships: **vc14 is still on
> `internal`, still promotable by mistake, and any device that skipped the 2026-09-06 OTA still fakes
> purchases.** Do not promote vc14. Do not walk billing on it.
> What follows from the finding, all confirmed:
> - **Every "purchase" on vc14 was fake** — nothing reached Google, so nothing is in Play's subscription
>   list and there is **nothing to cancel**. That, not a missing `?sku=`, is why the owner could not find
>   their subscription. **IMP-083 was scoped against a symptom whose stated cause was wrong** (its fix is
>   still correct, and still shipped — it just was not what blocked cancellation).
> - **`12 Jun 2026` does NOT prove an OTA failed to apply.** `simService`'s fake `renewISO` formats
>   through IMP-082's *new* code to exactly that string. Verified by hand 2026-09-06.
> - **WALK-19 is VOID on vc14** and cannot be run until IMP-084 ships in a new build.
> - **Root cause, evidenced:** `RC_ANDROID_KEY` exists on EAS in the `production` environment and the
>   build shipped the sim anyway — because **no `eas.json` profile declares an `environment`**. The
>   preflight passed green throughout because it reads the **CI runner's** env, not the machine that
>   decides. ⚠️ Adding `env:` to the workflow's build step does **nothing** — cloud builds evaluate
>   `app.config.js` on EAS's servers. Full account in [IMP-084](docs/build-log.md) — ✅ all three layers fixed in `da77a7d`.
>
> **PLUS IS ON, AND THAT CHANGED THE SHAPE OF EVERYTHING BELOW (2026-09-05, owner's call).**
> ⚠️ **Read the 🔴 above first — "on" meant the flag, not a build that can take money.**
> `PLUS_ENABLED = true` (commit `7d2e515`) and **v1.0.8 / vc14 is cut to Play `internal`** carrying it.
> Playbook **10b.2 / 10b.3 / 10b.4 are closed**; 10b.5 is in flight. Two things had to be fixed to get
> there, and both are the same defect class — *the paid surface asserting something the app cannot back*:
> the dead PDF perk was **cut** from `PLUS_PERKS`, and the cash ember packs were **decoupled** from the
> Plus flag after flipping it armed a priced surface that gave its goods away (the first vc14 build was
> **cancelled mid-flight** over it, commit `6590834`).
>
> **✅ The build queue is EMPTY again as of 2026-09-06. IMP-082 and IMP-083 both landed** (commits
> `0e73c76`, `1f4f037`) — the third and fourth instances of that same class, both found by putting a real
> license-tester subscription through the app rather than by reading code. Pure JS, **OTA lane — and
> ✅ both SHIPPED by OTA on 2026-09-06** (owner's instruction; update group `ac5c4189-736c-44f0-96ae-6ceea4fe4712`,
> runtime 1.0.8, Android, from commit `8abf11f`). **Nothing should be invented to fill the queue** — new
> work comes from a 🔴 walk finding, the owner, or a design doc.
>
> **⚠️ So the next task is a WALK, not a build.** Three of those specs end in runtime proof that has not
> run: **WALK-07** (Paywall half — IMP-080), **WALK-03 step 4** (`neverBackedUp` — IMP-081) and
> **WALK-18** (IMP-077). Two of them are ready right now; the third needs a new build, see below.
>
> | If this chat is… | Take |
> | --- | --- |
> | a **runtime walk** | **Still the lane with the most work in it, and it now has a 🚦 at the front.** **[WALK-19](docs/walk-open.md) — "money actually changes hands" — is NEW and gates the v1.1 promotion:** Plus is live and *nothing* about billing is proven (live prices, the trial, every purchase state, entitlement after reinstall, perk delivery). jest is **structurally blind** to all of it, because the suite runs `simService`. 🔴 **BLOCKED — it needs a build carrying `da77a7d`, and none exists yet.** Needs a **device**, a **license tester** and a **new `internal` build**; vc14 fakes purchases, so a run against it records a result about the simulation. **[WALK-11](docs/walk-open.md) also REOPENED** — the Plus perk surfaces mount on their own now, so the old "unmountable, needs T1" reason is gone; that one is emulator-friendly. Then the pre-existing rows: ✅ **READY NOW on a debug build of `feat/design-push` (both pure-JS):** **WALK-07** (the Paywall half only — IMP-080 landed) and **WALK-03 step 4** (`neverBackedUp` only — IMP-081 landed; run it at default **and** max font scale, since max is where the third line gets tested). ⚠️ **WALK-18 is unblocked but needs a NEW build** — IMP-077's native deps put the tree on **v1.0.8 / vc14**, which no vc13 artifact carries; it also needs a **mid-range device**, because an emulator renders dropped frames as smooth. **WALK-08 is PARTIAL** — cap confirmed, eight of nine screens plus rotation and `longName` unrun. **WALK-12 (R8) is LAST** and needs the Play `internal` build (A), which has no dev harness. **WALK-16 and WALK-17 are CLOSED ✅ on emulator evidence; WALK-13 is DROPPED** (owner's instruction, 2026-09-05: record emulator results as done, not smoke). ⚠️ **Named gap that no closed row covers:** real doze, OEM battery managers, delivery to a real share target, Google's own backup schedule. |
> | a **design request** | The Claude Design project is **live** — see "Claude Design is set up" below. |
> | a **build task** | ✅ **The queue is EMPTY as of 2026-09-06** — IMP-084 landed (`da77a7d`) and was the last row. **Nothing should be invented to fill it**; new work comes from a 🔴 walk finding, the owner, or a design doc. **The lane with work in it is the walk lane** — but note WALK-19 is now blocked on a *build*, not on a spec. |
>
> **The whole design push lives on `feat/design-push`, which is NEVER pushed, NEVER given a
> `Release-Lane:` trailer, and NEVER merged to `main`** without a separate owner decision.
> **IMP-076 ✅ and IMP-078 ✅ are both code-complete (2026-08-17)**; commits `22fcb96` and `4c1e34b`.
> **IMP-080 ✅, IMP-081 ✅ and IMP-077 ✅ followed on 2026-09-05**; commits `22c9c06`, `c649d7e` and
> `53d20e8`. **IMP-082 ✅ and IMP-083 ✅ landed 2026-09-06**; commits `0e73c76` and `1f4f037`. All seven
> are committed, none is pushed, and the tree now stands at **v1.0.8 / vc14**.

> **🔵 2026-08-16 — the free-app improvement track is CLOSED; active work is Plus (Phase 10b) + the design
> push.** Owner's call. `IMP-001`–`IMP-075` are done bar the deferred `IMP-022` and the reserved `IMP-057`.
> **Do not open new free-track IMP rows** — read [`docs/playbook.md`](docs/playbook.md) → Phase 10b. ⚠️ **The `PLUS_ENABLED` gate is OPEN as of 2026-09-05** — it is `true`, and the one unmet perk (the PDF) was cut rather than built. Full account of that session, the walk
> closures (WALK-04/06/10 ✅, WALK-15 closed, WALK-14 dropped) and IMP-072's no-spec fix: `build-log.md`.
>
> **Still owed, and neither is done:**
> - **The 🔴 WALK-07 Paywall regression is FIXED in code (IMP-080, 2026-09-05) but NOT yet re-walked.** It
>   is a Plus surface, and **it is now reachable** — `PLUS_ENABLED` is true, so the paywall mounts on its
>   own and no T1 dance is needed to see it. A fix jest cannot see is not a pass.
> - **⚠️ NEW 2026-09-05 — nothing about billing is proven.** Plus is on and vc14 is cut to `internal`, but
>   live prices, the trial, every purchase state, entitlement-after-reinstall and perk delivery are all
>   unverified. jest is **structurally blind** here: the suite runs `simService`, which fabricates every
>   purchase result. **That is [WALK-19](docs/walk-open.md), and it gates `internal` → `production`.**
> - **WALK-09 is now ✅ (2026-09-05)** — re-run after IMP-073, full pass, closed. **Every remaining walk
>   needs a device.**
>
> **`IMP-057` is reserved, not missing** — the `dayKey` migration IMP-056 deferred; needs real device
> numbers first (see Open items). **Do not reuse the number.** **IMP-044 claims no queue slot** — it rides
> the next build; don't "start" it, it needs only WALK-12.

**App status — all four Play tracks. Re-read from the Play Developer API 2026-09-05; that read corrected
the `alpha` row, which had been wrong since 2026-08-13. Authoritative; do not re-derive from an older note.**

> ⚠️ **There is no user-visible version string in a release build.** `APP_VERSION` is passed only to the
> dev panel ([`RitualsApp.js:966`](src/RitualsApp.js#L966)), which is `__DEV__`-only, and the About sheet
> that would show it is IMP-022 (deferred). **To check what a phone actually has: Android Settings → Apps
> → Daily Rituals → App details**, or `adb shell dumpsys package app.dailyrituals.mobile | grep versionName`.
> Do this **first** whenever a shipped change appears to be missing — on 2026-09-05 it was the whole answer.
>
> **To re-read the live tracks** (read-only; opens an edit and deletes it, never commits): a ~35-line
> script using `play-service-account.json` + the `androidpublisher` v3 `edits/{id}/tracks` endpoint. It is
> not committed — `googleapis` is not a dependency and the JWT is 15 lines of `node:crypto`.

| Track | Active | API | Note |
| --- | --- | --- | --- |
| `production` (public) | **1.0.3 / vc9** | 36 ✅ | live since 2026-07-30 |
| `beta` (open testing) | **1.0.3 / vc9** | 36 ✅ | was vc8/API 35 — promoted, compliance gap closed |
| `alpha` (closed testing) | **1.0.6 / vc12** | 36 ✅ | ⚠️ **corrected 2026-09-05 from the Play Developer API — this row said 1.0.5 / vc11 and was wrong.** ✅ **NO LONGER THE OWNER'S TRACK — corrected 2026-09-06, owner-confirmed: their phone is on `internal` at 1.0.8 / vc14.** ⚠️ **This row said otherwise and it caused a second round of confusion on 2026-09-06** — do not re-derive the owner's device from this row again. The 2026-09-05 history it records is still true and still the lesson: vc14 shipped to `internal`, the owner installed, saw no Plus, and the cause was that Play serves the **highest-priority track the account qualifies for** (internal > closed > open > production) and their account was then on the alpha list but not the internal one, so vc12 won. **A build on `internal` is invisible to a device that is only a closed tester** — true in general, no longer true of this device |
| _(superseded)_ | ~~1.0.7 / vc13~~ | 36 ✅ | shipped to `internal` 2026-09-05 and **replaced by vc14 the same day**. No longer on any track. Kept here only because WALK-12 and the two local artifacts still reference it |
| `internal` | **1.0.8 / vc14** | 36 ✅ | 🔴 **THIS BUILD FAKES PURCHASES — found 2026-09-06.** It shipped with no RevenueCat key and fell back to `simService`: the paywall grants Plus **free** and no purchase reaches Google. **Do not promote it, and do not walk billing on it.** Fix = **[IMP-084](docs/build-log.md)**, ✅ **landed 2026-09-06 (`da77a7d`) — but it needs a new versionCode and no build carries it yet.** ⚠️ The 2026-09-06 OTA may have flipped it to *real* billing at runtime (it carries a valid key in its manifest) — desirable but unintended and unwalked; a device that never takes the update still fakes purchases. · ✅ **SHIPPED 2026-09-05, 19:09 — it replaced vc13 on this track.** Confirmed from `eas submit:list`, not inferred: `Track: internal`, `Status: finished`, `Release Status: completed`, `App Version 1.0.8`, `Version code 14`. EAS build `87f81b24-cd34-4d42-95d8-6fea4ea76c79`, submission `4b7cf3a2-d946-4f49-8182-74afb9f870b9`, from commit `6590834` on `feat/design-push`. **The first build with `PLUS_ENABLED = true`** and the first carrying reanimated/worklets. ⚠️ **A first vc14 build (`aa89e355…`) was CANCELLED mid-flight** — it carried the armed ember-pack surface; its submission `8074b63c…` reads `canceled`, so it never reached Play. Unblocks WALK-18, WALK-19, WALK-11; reopened the OTA lane |

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

> ✅ **AND IT REOPENED THE SAME DAY — the condition was met. vc14 reached `internal` at 19:09 on
> 2026-09-05**, so `runtimeVersion` `1.0.8` now matches a shipped build and the OTA lane is **open onto
> `internal`**. IMP-077's `bump:native` had shut it that morning — the identical trap IMP-076 sprang on
> 2026-08-17, one spec later — and **a `bump:native` always closes the OTA lane until the new versionCode
> actually ships.** The rule is unchanged for next time; this instance is closed. **IMP-082 and IMP-083
> are pure JS and they DID ride this lane — the first OTA ever published on it, 2026-09-06**, update
> group `ac5c4189-736c-44f0-96ae-6ceea4fe4712`. They shipped **before** WALK-19 proved them, on the owner's
> instruction; the walk is still owed. ⚠️ It reaches `internal` installs only —
> `production` is still on 1.0.3 / vc9, whose runtime an `eas update` from this tree does not match.

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
(`newArchEnabled: true` since IMP-076, 2026-08-17 — **walked ✅, WALK-16 closed 2026-09-05**) ·
**Reanimated 4.1.1 + worklets 0.5.1** (IMP-077, 2026-09-05 — New-Arch-only, which is why WALK-16 gated it;
**`babel.config.js` is deliberately untouched**, `babel-preset-expo` auto-injects the worklets plugin) ·
`targetSdkVersion` **36**, `minSdk` **24** · `npm test` →
**902 passed, 89 suites**, plus **3 zone tests × 2 pinned zones**. **`npm test` = `test:suite` (the ambient
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
| 077 | A motion vocabulary the whole app can speak | Build | ✅ code-complete 2026-09-05 · **branch-only, never pushed** · new `src/motion.js` (DUR/EASE/riseIn/popIn/fadeOut/stagger/usePressScale/useCountUp/ScreenFade), adopted in exactly two places; `art.js` + `Celebration.js` + `Toast.js` + `babel.config.js` all byte-identical · reanimated 4.1.1 + worklets 0.5.1 → **v1.0.8 / vc14** · ⚠️ **873 green tests prove nothing about the motion** — the Reanimated jest mock no-ops every hook · walk = WALK-18, **needs a new build** |
| 078 | A design system Claude Design can work from | Dev-only | ✅ code-complete 2026-08-17 · **branch-only, never pushed** · **15 cards live** in Claude Design project `Daily Rituals Design System`, both themes |
| 080 | The Paywall footer stops fighting the layout | Build | ✅ code-complete 2026-09-05 · **branch-only, never pushed** · from the 🔴 WALK-07 finding · the footer left the flex column for `position: absolute, bottom: 0`, root took an exact `height: winH`; IMP-068 + IMP-074 recorded as **superseded, not wrong** · pure JS, no bump · walk = the Paywall half of WALK-07, **ready to re-run** |
| 081 | The never-backed-up warning says the whole sentence | Build | ✅ code-complete 2026-09-05 · **branch-only, never pushed** · from the WALK-03 step 4 finding · `BackupNudge` goes `numberOfLines` 2 → 3 with the row top-aligned; **the clamp stays** (it is what keeps a long string from pushing "General" off the card) and **the copy was not shortened** · pure JS, no bump · walk = step 4 of WALK-03, **ready to re-run at default AND max font scale** |
| 082 | The member surfaces stop inventing a renewal date | Build | ✅ code-complete 2026-09-06 · **branch-only, never pushed** · `formatRenewDate` returns **`null`** instead of the `12 Jun 2026` mock on both the missing and the unparseable branch; `PlusBanner` gained a `renewLabel` prop and says the bare word **`Member`** without one; Manage and Cancel drop their "until …" clauses. `RENEW_DATE` **stays in `data.js`** for the dev panel + fixtures, now commented as never-a-fallback · pure JS, no bump · ✅ **SHIPPED BY OTA 2026-09-06** (update group `ac5c4189-736c-44f0-96ae-6ceea4fe4712`) — reaches **vc14 `internal` installs only** · walk = **step 5 of WALK-19**, needs a device + license tester |
| 083 | Cancel goes to the subscription, not to a list | Build | ✅ code-complete 2026-09-06 · **branch-only, never pushed** · new pure `manageUrl({platform, productId, packageName})` in `links.js` builds `?sku=&package=`; `openExternal` takes an optional third `opts`; `PACKAGE_NAME` reads `expoConfig.android.package`; `toEntitlement` + `simService` now carry `productId`. Missing either value **degrades to today's generic URL**, never a 404 · pure JS, no bump · ✅ **SHIPPED BY OTA 2026-09-06** (same update group) · ⚠️ **the `plus_annual:annual` → `plus_annual` strip is unproven against a real Play id** · walk = **step 10 of WALK-19** |
| **084** | **The release build stops shipping the purchase simulation** | **Build** | ✅ code-complete 2026-09-06 · commit `da77a7d` · **branch-only, never pushed** · three layers: all three `eas.json` profiles now bind an `environment` (the missing binding is why the key never reached EAS Build), a new pure `easEnvironmentPreflight` fails CI when `build.production.environment` is absent or wrong, and `paywallLive({plusEnabled, billingConfigured, dev})` gates the whole paid surface — all 16 `PLUS_ENABLED` uses in `RitualsApp.js` became `PAYWALL_LIVE`. `PLUS_ENABLED` in `config.js` unchanged · 🔴 **BUILD lane — needs a NEW versionCode; this CANNOT be OTA'd**, and until it ships, vc14 devices that skipped the 2026-09-06 OTA still fake purchases · walk = **WALK-19 step 0(c)** (airplane mode, the purchase must FAIL) |
| — | **Plus is ON** (`PLUS_ENABLED = true`) | Build | ⚠️ **the FLAG is on; the BUILD cannot take money — see 🔴 IMP-084 (2026-09-06).** `PLUS_ENABLED = true` shipped, but vc14 has no RevenueCat key and runs `simService`, so **10b.3 is NOT closed** and the "all real" claim below covers the perks, not the payments · ✅ 2026-09-05 · commit `7d2e515` · **branch-only, never pushed** · ~~playbook 10b.2/10b.3/10b.4 all closed~~; 10b.5 in flight. The dead PDF perk was **cut** from `PLUS_PERKS` rather than built — five perks remain, all real. **Everything about billing is still unproven at runtime: WALK-19** |
| — | Cash ember packs decoupled from the Plus flag | Build | ✅ 2026-09-05 · commit `6590834` · **caught mid-build and the build was cancelled.** Flipping `PLUS_ENABLED` armed the Shop's "Gather Embers" section + the GetEmbers sheet, which show `$1.99/$4.99/$9.99` against a **bare counter increment** — a priced surface giving its goods away. New `EMBER_PACKS_ENABLED` (false) gates it; `Shop` takes `embersForCash` defaulting to **false**. 875 tests |

---

## 🎨 Claude Design is set up — how to use it (IMP-078, 2026-08-17)

**Project: `Daily Rituals Design System`** · id `7bf44d09-f93a-42d2-a8b6-d412d671cf60` · type
`PROJECT_TYPE_DESIGN_SYSTEM`, writable. **13 cards**: Tokens (color, type, shape, elevation) · Frozen
(the rays) · Components (card, buttons, progress, chips, nav, plus) · Screens (baseline-day,
baseline-night).

> **Trimmed 2026-08-17 (owner).** The signature is **`RayFan` + `NightRays` only**. `BigSun`/`BigMoon`
> were demoted out of Frozen (they still ship in Onboarding/Celebration/Paywall, but a design may replace
> them); `NightSky` and the `DARK_THEME` revert flag were deleted from the app outright; the two Motion
> cards were deleted because they documented a `src/motion.js` that IMP-077 had not built yet. **Do not
> re-add any of it to the design system** — a card that describes something the app doesn't have is how
> the design system gets corrupted.
>
> ⚠️ **The Motion exception has now flipped: `src/motion.js` EXISTS as of IMP-077, 2026-09-05.** The two
> Motion cards may be re-added, but **written from the file, not from the old deleted cards** — the real
> exports are `DUR` (`tap: 120, enter: 320, settle: 480, celebrate: 900`), `EASE`, `riseIn`, `popIn`,
> `fadeOut`, `stagger`, `usePressScale`, `useCountUp`, `ScreenFade`. **The Frozen rule is unchanged and
> IMP-077 did not touch it**: `RayFan` + `NightRays` are still the signature, still on `Animated`, still
> not ported. So are `Celebration.js` and `Toast.js` — coexistence is the design.

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

> ⚠️ **The tree has moved past both of these. IMP-077 bumped it to v1.0.8 / vc14 on 2026-09-05** —
> `react-native-reanimated` and `react-native-worklets` are native deps, so **neither artifact below
> contains IMP-077's code and no OTA can add it.** What that means per walk row:
> **WALK-18 needs a NEW build cut from `feat/design-push` at vc14** — nothing here will do.
> **WALK-07 and WALK-03 step 4 are fine on B**, the local debug APK: IMP-080 and IMP-081 are pure JS, so
> rebuilding the debug APK from the current branch picks them up without a native rebuild story.
> **WALK-12 (R8) still needs A specifically** — R8 must be walked on the build you intend to ship, and
> that is still the vc13 on `internal`.

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

### 🔴 LIVE BLOCKER — vc14 fakes purchases (2026-09-06)

- **The build on `internal` cannot take money.** No RevenueCat key reached it, so it runs `simService`:
  the paywall fakes success and grants Plus free. **Proven on a device — a purchase in airplane mode
  succeeded.** Fix is **[IMP-084](docs/build-log.md)**, ✅ landed `da77a7d`, and it needs a **new versionCode**; the
  `eas.json` binding cannot be OTA'd. **Do not promote vc14, and do not walk billing on it.**
- **⚠️ Owner decision, live now: the 2026-09-06 OTA may have quietly turned real billing ON.** Update
  group `ac5c4189-736c-44f0-96ae-6ceea4fe4712` was published from a machine holding a valid `goog_` key,
  and `Constants.expoConfig` reads the running update's manifest — so as it applies, `hasKeyFor` starts
  returning true and the app switches to real RevenueCat. **That stops the giveaway, which is good, but it
  was not intended and the path is unwalked.** Two consequences to decide on:
  **(a)** real charges become possible on `internal` — **confirm every account on that tester list is a
  license tester** before anyone touches a real card; **(b)** rolling the OTA back
  (`.github/workflows/rollback-ota.yml`) would *restore* the free-Plus giveaway, so rollback is the worse
  option and should not be the reflex. Recommendation on record: **keep the OTA, ship IMP-084, then walk.**

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

### 🟢 WALK-07 finding — Paywall footer overlap: FIXED in code, still unwalked

Found on the 2026-08-16 whole-walk re-run (the other five screens and both IMP-067 spot-checks passed).
**✅ Fixed by IMP-080, 2026-09-05, commit `22c9c06`** — the footer left the flex column for
`position: absolute` and the root took an exact `height: winH`. Owner chose the pinned CTA over folding
the footer into the scroll content, because this is the screen that takes money; the alternative floated
during the walk (hide the footer until a plan is picked) **does not work** — `plan` initialises to
`'annual'`, so a plan is always picked. **This entry stays open only until the Paywall half of WALK-07
re-runs green:** jest renders a tree, not pixels, so no test can close it. Full writeup —
`docs/walk-open.md` → WALK-07 → "Re-run — 🟡 2026-08-16"; spec in `docs/build-log.md`.

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


_2026-09-06 (Opus — **IMP-082 and IMP-083 both landed; the build queue is empty again**; branch-only,
committed, NOT pushed) — **a build session. Two specs closed, no walk run.** Both came from the owner
putting a **real license-tester subscription** through the app, not from reading code, and both are the
same class as the cut PDF perk and the decoupled ember packs: **the paid surface asserting something the
app cannot back.**_

**IMP-082 — the member surfaces stop inventing a renewal date.** `RENEW_DATE = '12 Jun 2026'` is
prototype mock data and it was the **runtime fallback in five places, starting in the pure layer**:
`formatRenewDate` handed it back on both the missing *and* the unparseable branch, so even the "live"
path fabricated. Now it returns **`null`**, and every surface drops the claim rather than substituting:
`PlusBanner` gained a `renewLabel` prop and renders the bare word **`Member`** without one (`YouScreen`
and `Shop` thread it), `ManageSubscription` shows `Ends soon · access until then` or the bare plan label
and both billing footnotes lose their "until …" clause, and `CancelSheet` ends at *"…so you can cancel."*.
`RENEW_DATE` **was not deleted** — it stays in `data.js` for the dev panel and fixtures, now carrying a
comment that says so and names the bug shape (`renewLabel || RENEW_DATE`). Neither `format.js` nor
`RitualsApp.js` imports it any more. Commit `0e73c76`, pure JS, no bump.

**IMP-083 — Cancel goes to the subscription, not to a list.** `config.js` carried a bare
`play.google.com/store/account/subscriptions`, so a subscriber mid-cancel got the account-wide list to
hunt through. New pure `manageUrl({ platform, productId, packageName })` builds
`?sku=&package=`; `openExternal` gained an optional third `opts` argument (existing two-arg calls
untouched); `PACKAGE_NAME` comes from `Constants.expoConfig?.android?.package`, not a hardcode;
`toEntitlement` and `simService`'s `ent()` both carry `productId` now, and one `manageOpts()` helper feeds
`openLink`, `doCancel` and `doResume` so all three routes match. **Missing product id or package name
degrades to today's generic URL** — a broken link is worse than a list. Commit `1f4f037`, pure JS, no bump.

**Two traps found while testing, both recorded in `build-log.md`:** `Constants.expoConfig` is **undefined
under jest**, so `PACKAGE_NAME` is `''` in the suite — the spec's decision to make `packageName` a
*parameter* is the only reason `manageUrl` is testable at all. And `react-native-purchases` pulls in ESM
`transformIgnorePatterns` does not cover, which is why `revenueCatService` had no test until now;
`__tests__/billing/revenueCatService.test.js` opens with a `jest.mock` of it. **Do not remove that mock.**

**Proof: 902 passed / 89 suites** (up from 875/85 — four new files:
`__tests__/ui/PlusBanner.test.js`, `__tests__/screens/ManageSubscription.test.js`,
`__tests__/billing/links.test.js`, `__tests__/billing/revenueCatService.test.js`), both zone suites green,
`npx expo export --platform android` clean at each commit.

⚠️ **What the green suite does NOT mean.** The suite runs `simService`, which fabricates every purchase
result — **jest is structurally blind to billing.** Neither fix is verified against a real subscription.
The suffix strip in particular (`plus_annual:annual` → `plus_annual`) rests only on what the RevenueCat
dashboard shows; if WALK-19 step 10 lands on a "not found" page, that is the first suspect.

**✅ SHIPPED THE SAME DAY, by OTA, on the owner's instruction — the first update ever published on this
lane.** `eas update --channel production --platform android`, update group
`ac5c4189-736c-44f0-96ae-6ceea4fe4712` (Android update `01a0737f-bba2-70e6-ae80-4beda488dfc1`), runtime **1.0.8**, from
commit `8abf11f`. **The branch was NOT pushed** — the never-push rule still stands; an OTA goes to Expo's
CDN, not GitHub. Three things this does and does not mean, all of them load-bearing:
**(1) It reaches vc14 `internal` installs only.** `alpha` (vc12), `beta` and `production` (vc9) are on
older runtimes and received nothing — the public still has none of this.
**(2) ~~The owner's own phone may not get it~~ — WRONG, corrected 2026-09-06.** The owner is on
**`internal` at vc14**, so it does reach them. This was asserted from the stale `alpha` row in the track
table (now fixed) and it wasted a round. The general rule still holds for *other* testers: Play serves the
highest-priority track an account qualifies for, so a closed-testing-only account stays on vc12 and
receives no 1.0.8 OTA at all.
**(3) It applies on the SECOND launch.** `expo-updates` runs on defaults here — check on load, download in
background, swap in next launch — so testers must open, fully close, and reopen. "Nothing changed" is
almost certainly this.
⚠️ **Shipped ahead of its proof.** WALK-19 has not run; both fixes are now in front of real testers
unverified. **Shipping is not proof, and the walk is still owed** — a new **step 0** was added to WALK-19
covering the track and OTA checks above, because a walk run on a device that never took the update would
record a result against the wrong build.

**🔴 LATER THE SAME SESSION — the ship exposed something much worse, and it invalidates part of the
above.** Chasing "I can't cancel, and I still see 12 Jun 2026", the owner ran the decisive test:
**they subscribed in AIRPLANE MODE and it succeeded.** vc14 is running `simService`. Three corrections
follow, and each one had been asserted confidently and wrongly earlier in this same session:
- **`12 Jun 2026` was never a valid tell.** I offered it as the clean check for "did the OTA apply".
  It is not: `simService`'s `FALLBACK_RENEW_ISO` formats through IMP-082's *new* code to exactly that
  string. The test I gave could not distinguish a stale bundle from a fake purchase.
- **IMP-083's stated cause was wrong.** The owner could not find their subscription in Play because
  **there was no subscription** — not because the link lacked `?sku=`. The fix is still right and still
  shipped; it was not what was blocking them.
- **The billing preflight has never guarded anything.** It reads `process.env` on the **CI runner**;
  the value that decides sim-vs-real is resolved by **EAS Build** on its own servers. `RC_ANDROID_KEY`
  exists on EAS and the build shipped the sim anyway — because no `eas.json` profile binds an
  `environment`. ⚠️ Adding `env:` to the workflow build step does **nothing**; cloud builds never see the
  runner's environment.
Scoped as **[IMP-084](docs/specs-open.md)** — three layers, the third being the one that would have
prevented this: **the app must hide a paywall it cannot transact through**, the same "never assert what
you cannot back" rule already applied to the PDF perk, the ember packs and IMP-082's dates.

**NEXT: 🔴 [IMP-084](docs/specs-open.md) is the top of the queue and it is a BUILD, not an OTA.**
~~this is a walk lane, and the build queue is genuinely empty~~ — that was true for about an hour.
**[WALK-19](docs/walk-open.md) is the gate on v1.1** and now carries the acceptance for both of these
(steps 5 and 10); it needs a **device**, a **license tester** and the vc14 `internal` build. Also ready:
**WALK-11**, **WALK-07 (Paywall half)** and **WALK-03 step 4** on a debug build of this branch; **WALK-18**
needs a mid-range device; **WALK-12 (R8) LAST**. **Neither fix has shipped** — no `Release-Lane:` trailer,
per the branch rule; the OTA lane is open onto `internal` only._

---

_2026-09-06, later (Opus — **IMP-084 landed; the build queue is empty**; branch-only, committed,
NOT pushed) — **a build session. One spec closed, no walk run.** It is the fix for the live incident
the previous note ends on: **vc14 on `internal` was giving Plus away**, proven by a purchase that
succeeded in airplane mode._

**IMP-084 — a paywall that cannot charge is no longer shown.** All three layers of the spec landed as
written; nothing was redesigned. Commit `da77a7d`.
- **A — the key reaches the build.** No `eas.json` profile declared an `environment`, so `RC_ANDROID_KEY`
  sat on EAS and was never injected into a cloud build. All three profiles now bind one explicitly
  (`development` / `preview` / `production`); `channel`, `distribution` and `submit` untouched.
- **B — the preflight verifies the lever, not the runner.** New pure `easEnvironmentPreflight({ easJson })`
  beside the unchanged `billingPreflight`; `main()` runs both and prints every failure, not the first.
  **Run against the pre-fix `eas.json` it reproduced the vc14 diagnosis exactly** — `declares environment
  undefined, expected "production"` — which is the evidence the guard actually bites. The header comment's
  claim to make the simulation "a hard build failure instead of a shipped one" is replaced by an account
  of what the script cannot see.
- **C — the app hides a paywall it cannot back.** `paywallLive({ plusEnabled, billingConfigured, dev })`
  in `src/billing/index.js`; `RitualsApp.js` derives `PAYWALL_LIVE` right after `PLATFORM` and threads it
  through **all 16** former `PLUS_ENABLED` uses — props, the four `Modal visible=` gates and the
  `restoreAccess({ plusEnabled })` call. `PLUS_ENABLED` in `config.js` is untouched.

**One deviation from the spec, and it is a tightening.** The required source assertion, written first as
`/plusEnabled\s*[=:]\s*PLUS_ENABLED/`, matched the gate's own legitimate `plusEnabled: PLUS_ENABLED,`
line. It is now the JSX-prop form the spec names (`plusEnabled={PLUS_ENABLED}`) plus a second test that
pins the complete list of surviving `PLUS_ENABLED` lines in that file to exactly two — the import and the
gate input. That pair is stricter than the single regex: any *new* use of the bare flag fails the suite.

**Proof: 915 passed / 90 suites** (from 902/89 — one new file `__tests__/billing/paywallLive.test.js`,
four cases appended to `__tests__/scripts/checkBillingConfig.test.js`), both zone suites green,
`npx expo export --platform android` clean. **Last command: `npx expo export --platform android` →
`Exported: dist`.**

⚠️ **What this does NOT do, and it is the whole risk right now. Code-complete is not shipped.** Layer A
only takes effect **in a build**, and no build carries `da77a7d`. So: **vc14 is still on `internal`, still
promotable by mistake, and every device that skipped the 2026-09-06 OTA still fakes purchases.** jest also
remains structurally blind here — the suite runs `simService`, and it renders with `__DEV__` true, which is
precisely why layer C needed a source assertion rather than a render test.

**NEXT: the build queue is genuinely empty and the next move is a BUILD, not a spec.** Cutting
**v1.0.9 / vc15** from this branch is what makes any of this real — it is also the only thing that
unblocks **[WALK-19](docs/walk-open.md)**, whose acceptance for IMP-084 is **step 0(c): airplane mode,
attempt a purchase, and it must FAIL.** That is an owner decision (the branch is never pushed and carries
no `Release-Lane:` trailer). Walks that need no new build and are ready on a debug build of this branch:
**WALK-07 (Paywall half)**, **WALK-03 step 4** and **WALK-11**. **WALK-18** needs the new build and a
mid-range device; **WALK-12 (R8) LAST**._
