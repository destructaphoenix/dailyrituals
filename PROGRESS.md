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

> ## 🧭 WHAT TO TAKE RIGHT NOW (2026-09-06)
>
> ## 🔴 vc14 ON `internal` FAKES PURCHASES — FIXED IN CODE, NOT YET IN ANY BUILD
>
> **The owner subscribed in AIRPLANE MODE and it succeeded** (2026-09-06, proven on a device). Real Play
> Billing cannot complete a purchase with no network; `simService` can, and grants Plus **free**.
> ✅ **[IMP-084](docs/build-log.md) fixed all three layers the same day, commit `da77a7d`.**
> ✅ **Layer C SHIPPED BY OTA 2026-09-06** — update group `90aa2074-6625-4072-8d35-71244a525b2d`,
> Android update `01a07618-8aed-7143-b09b-ff58c1b5d1ca`, runtime **1.0.8**, from commit `2834dd9`. The
> publish log confirms `env: export RC_ANDROID_KEY`, so **this update carries the key in its manifest**:
> on vc14 `hasKeyFor` returns true, billing goes **real**, and `PAYWALL_LIVE` keeps the surface visible
> rather than hiding it. **Testers must open, fully close, and reopen** — it applies on the second launch.
> 🔴 **Layers A and B still need a build.** ⚠️ **Do not promote vc14** and **do not walk billing on it**:
> a device that never takes an OTA still fakes purchases, and only the `eas.json` binding stops the *next*
> build regressing to the simulation. **v1.0.9 / vc15 is cut and building** (`980cdad`) — the bump closed
> the OTA lane behind it, which is expected: `runtimeVersion` 1.0.9 matches no shipped build until vc15
> lands on `internal`.
> What follows from the finding, all confirmed:
> - **Every "purchase" on vc14 was fake** — nothing reached Google, so there is **nothing to cancel**.
>   That, not a missing `?sku=`, is why the owner could not find their subscription. **IMP-083 was scoped
>   against a symptom whose stated cause was wrong** (its fix is still correct, and still shipped).
> - **`12 Jun 2026` does NOT prove an OTA failed to apply.** `simService`'s fake `renewISO` formats
>   through IMP-082's *new* code to exactly that string. Verified by hand 2026-09-06.
> - **Root cause, evidenced — do not re-derive.** `RC_ANDROID_KEY` existed on EAS and the build shipped
>   the sim anyway, because **no `eas.json` profile declared an `environment`** (now all three do). The
>   preflight passed throughout because it reads the **CI runner's** env, not the machine that decides.
>   ⚠️ Adding `env:` to the workflow's build step does **nothing** — cloud builds evaluate
>   `app.config.js` on EAS's servers.
>
> **Plus is ON** (`PLUS_ENABLED = true`, commit `7d2e515`, owner's call 2026-09-05) — but "on" means the
> flag, not a build that can take money. Playbook 10b.2/10b.4 closed; **10b.3 is NOT** (see the 🔴 above);
> 10b.5 in flight. Three fixes were needed to get here and all are one defect class — *the paid surface
> asserting something the app cannot back*: the dead PDF perk **cut** from `PLUS_PERKS`, the cash ember
> packs **decoupled** from the Plus flag (a priced surface giving its goods away — the first vc14 build was
> cancelled mid-flight over it, `6590834`), and IMP-082's invented renewal dates.
>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | ✅ **The queue is EMPTY** — IMP-084 (`da77a7d`) was the last row. **Nothing should be invented to fill it**; new work comes from a 🔴 walk finding, the owner, or a design doc. |
> | a **runtime walk** | **The lane with the work in it.** 🚦 **[WALK-19](docs/walk-open.md) — "money actually changes hands" — gates the v1.1 promotion and is BLOCKED**: it needs a build carrying `da77a7d`, a **device** and a **license tester**. vc14 fakes purchases, so a run against it records a result about the simulation. ✅ **Ready now on a debug build of this branch (all pure-JS):** **WALK-07** (Paywall half — IMP-080), **WALK-03 step 4** (`neverBackedUp` — IMP-081; run at default **and** max font scale, where the third line gets tested) and **WALK-11** (the Plus perk surfaces mount on their own now, so the old "needs T1" reason is gone). ⚠️ **WALK-18 needs a NEW build** — IMP-077's native deps put the tree on v1.0.8/vc14, which no vc13 artifact carries — **and a mid-range device**, because an emulator renders dropped frames as smooth. **WALK-08 is PARTIAL** (cap confirmed; eight of nine screens, rotation and `longName` unrun). **WALK-12 (R8) is LAST** and needs the Play `internal` build, which has no dev harness. **WALK-16/17 CLOSED ✅ on emulator evidence; WALK-13 DROPPED** (owner, 2026-09-05: record emulator results as done, not smoke). ⚠️ **Gap no closed row covers:** real doze, OEM battery managers, delivery to a real share target, Google's own backup schedule. |
> | a **design request** | See "Claude Design" below. The live request is **Insights**. |

**The whole design push lives on `feat/design-push`, which is NEVER pushed, NEVER given a `Release-Lane:`
trailer, and NEVER merged to `main`** without a separate owner decision. Nine specs are code-complete and
branch-only: IMP-076 ✅ IMP-078 ✅ (2026-08-17), IMP-080 ✅ IMP-081 ✅ IMP-077 ✅ (2026-09-05), IMP-082 ✅
IMP-083 ✅ IMP-084 ✅ (2026-09-06). **The free-app improvement track is CLOSED** (owner, 2026-08-16):
`IMP-001`–`IMP-075` are done bar the deferred `IMP-022` and the reserved `IMP-057`; **do not open new
free-track rows.** **`IMP-057` is reserved, not missing** — do not reuse the number. **IMP-044 claims no
queue slot** — it rides the next build and needs only WALK-12.

---

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

**Ship mechanics, all still in force.** Builds **auto-submit to `internal`** (`eas.json` →
`submit.production.android.track`, set 2026-08-08 in `a299af7`). Reaching the public is the **manual
`internal` → `production` promotion** in Play Console, which does get the full ~7d review — and it should
not be taken until the device walks clear. **✅ API-36 compliance (deadline 2026-08-31) is met
ACCOUNT-WIDE** — blocker closed 2026-08-13; every active release on every track is `targetSdkVersion 36`.

**⚠️ The OTA lane: open onto `internal` only, and it cannot carry everything.** `eas update` publishes to
Expo's CDN — **no Play track, no Google, no review** — gated only by **channel** (`production`) + a
**matching `runtimeVersion`** (= `appVersion`). At `1.0.8` that is **vc14 installs and nothing else**:
`alpha` (vc12), `beta` and `production` (vc9) are on older runtimes and receive nothing. An installed build
takes an OTA regardless of which track it came from, and **it applies on the SECOND launch** (check on
load, download in background, swap next launch) — "nothing changed" is almost always this. **Anything
native needs a build**, and **a `bump:native` closes the lane until that versionCode actually ships** —
the trap IMP-076 and IMP-077 both sprang. **Do not OTA a fix and then treat WALK-12's R8 pass as valid:**
R8 runs at build time, so the code on the device is no longer the code that was walked.

**Current stack:** Expo SDK **54** · RN **0.81.5** · React **19.1.0** · **New Architecture**
(`newArchEnabled: true` since IMP-076 — walked ✅, WALK-16 closed) · **Reanimated 4.1.1 + worklets 0.5.1**
(IMP-077 — New-Arch-only, which is why WALK-16 gated it; **`babel.config.js` is deliberately untouched**,
`babel-preset-expo` auto-injects the worklets plugin) · `targetSdkVersion` **36**, `minSdk` **24** ·
`npm test` → **915 passed, 89+1 suites**, plus **3 zone tests × 2 pinned zones**. **`npm test` =
`test:suite` + `test:zone`** (`__tests__/zone/`, run at UTC+14 and UTC−11 via `jest.zone.config.js`).
Verified `exit=0` under five ambient zones. **Run `npm test`, not bare `npx jest`**, or the zone half is
skipped. Details in [`docs/playbook.md`](docs/playbook.md).

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

---

## 🎨 Claude Design (IMP-078)

**Project `Daily Rituals Design System`** · id `7bf44d09-f93a-42d2-a8b6-d412d671cf60` · writable ·
**13 cards** (Tokens · Frozen · Components · Screens day+night). Regenerate after a theme change with
`node scripts/gen-design-system.js`, then re-push — the cards are generated from `theme.js`/`data.js`/
`art.js` so they cannot drift, but they do not update themselves. **No auto-sync**: pointing the pane's
GitHub connection at `design-system/` would need the branch published, which the no-push rule forbids.

**Ask for ONE screen per request** — "redesign the app" produces mush. The live request is **Insights**
(owner, 2026-09-05). Four rules:
1. **Check the screen has a baseline first** — only `day-01…07`/`night-01…07` exist. For one that does
   not, **paste its source** into the request rather than describing it.
2. **Insist the spec comes back in token names** (`c.accentSoft`, `t.radius.card`) — not hex, not "gentle
   fade".
3. **The sun and rays are frozen.** `RayFan` + `NightRays` are the signature. If a returned design redraws
   them, reject it — it cannot ship. `BigSun`/`BigMoon` were demoted out of Frozen (still shipping in
   Onboarding/Celebration/Paywall, but a design may replace them); `NightSky` and the `DARK_THEME` revert
   flag were **deleted from the app**. **Do not re-add any of it** — a card describing something the app
   does not have is how the design system gets corrupted.
4. **It is a design request, not an enablement.** Everything under `src/billing/` is untouched by design
   work. ⚠️ *(Corrected 2026-09-06: this rule used to read "`PLUS_ENABLED` stays `false`". It has been
   `true` since 2026-09-05 — the rule is hands-off, not off.)*

⚠️ **Motion cards may now be re-added** — `src/motion.js` EXISTS as of IMP-077 — but **written from the
file, not from the old deleted cards**: `DUR` (`tap:120, enter:320, settle:480, celebrate:900`), `EASE`,
`riseIn`, `popIn`, `fadeOut`, `stagger`, `usePressScale`, `useCountUp`, `ScreenFade`. The Frozen rule is
unchanged: `RayFan`, `NightRays`, `Celebration.js` and `Toast.js` stay on `Animated` — coexistence is the
design.

**The app's mode is its own setting, not the OS's** (`App.js:40`, header toggle) — `cmd uimode night` does
nothing. To re-shoot night, set the app to dark **first**, then `npm run shots`;
`scripts/check-baseline-dark.py` gates the night copy (mean luma < 90) so a day frame cannot be filed as
night again. **Porting a returned design is a normal build task** — a new `IMP-xxx` scoped by Opus. Claude
Design does not emit React Native; it returns HTML/CSS previews plus a spec.

---

## 🔨 Build artifacts a walk can run against

**⚠️ The tree is at v1.0.8 / vc14 and BOTH artifacts below are vc13** — they predate IMP-077's native deps,
so **no OTA can add Reanimated to them.** **WALK-18 needs a new build.** Pure-JS walks (WALK-07,
WALK-03 step 4, WALK-11) are fine on **B**, rebuilt from this branch.

| | **A · Play `internal` (release)** | **B · local debug APK** |
| --- | --- | --- |
| **What** | AAB → Play-generated APKs, **R8 minified**, no dev harness | `android/app/build/outputs/apk/debug/app-debug.apk` (~172 MB, all ABIs, unminified) |
| **Get it** | Play Store → internal testing (owner's account) — **now serves vc14, not vc13** | `adb install -r <path>` |
| **Built from** | vc13: commit `bbd5f45`, EAS `11dce1c2-…`, submission `bcb6c944-…` | `expo prebuild` → `./gradlew assembleDebug` |

**WALK-12 (R8) must be walked on the build you intend to ship** — that is now a vc15, not either of these.
⚠️ `android/` is gitignored, so `expo prebuild` staleness is a live trap for local gradle builds.

---

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track and Phase 10b are in [`docs/playbook.md`](docs/playbook.md) → "Monetization strategy".

### 🔴 LIVE BLOCKER — vc14 on `internal` fakes purchases (2026-09-06)

**Full account is the 🔴 callout at the top of this file — not repeated here.** In one line: no RevenueCat
key reached the build, so it runs `simService`, fakes success and grants Plus free (proven on a device, in
airplane mode). ✅ Fixed by **IMP-084**, commit `da77a7d`. 🔴 **Still live because the fix is BUILD-lane and
no build carries it** — `eas.json` cannot be OTA'd. **Do not promote vc14. Do not walk billing on it.**
The OTA consequence is an owner decision — see below.

### ▶️ Owner decisions still open

- **🚦 The `internal` → `production` promotion.** Owner, 2026-09-05: **"vc13 is the future"** — v1.0.6/vc12
  reached `internal` carrying ~40 IMP tasks and the app's first R8 build, and **stops there**; it will not
  be promoted and no walk runs for its sake. ⚠️ **That decision is now one build stale**: vc14 replaced
  vc13 on `internal`, and **vc14 must not be promoted either** (it fakes purchases). The real candidate is
  a **new build carrying `da77a7d`**. Remaining: the device walks, then promote by hand.
- **⚠️ The 2026-09-06 OTA may have quietly turned real billing ON, and that is still unwalked.** Update
  group `ac5c4189-736c-44f0-96ae-6ceea4fe4712` was published from a machine holding a valid `goog_` key,
  and `Constants.expoConfig` reads the **running update's** manifest — so as it applies, `hasKeyFor`
  returns true and the app switches to real RevenueCat. **That stops the giveaway, which is good, but it
  was not intended.** Two live consequences: **(a)** real charges become possible on `internal` —
  **confirm every account on that tester list is a license tester** before anyone touches a real card;
  **(b)** rolling the OTA back (`.github/workflows/rollback-ota.yml`) would **restore** the free-Plus
  giveaway, so rollback is the worse option and must not be the reflex. **On record: keep the OTA, ship a
  build with IMP-084, then walk.**
- **Cash embers: settled in principle (dropped 2026-08-03), not finalised.** It determines which Play
  products get created. Full argument in the playbook.
- **Perk #6, the PDF, is still not built** (IMP-022, deferred). It was **cut** from `PLUS_PERKS` rather
  than built, which is how `PLUS_ENABLED` flipped honestly. Gate checklist in the playbook → Phase 10b.

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


_2026-09-06 (Opus — **IMP-082 and IMP-083 landed, shipped by OTA, and the ship then exposed the vc14
giveaway**; branch-only, NOT pushed). **Full note archived verbatim in `docs/build-log.md`.**_

**IMP-082 — the member surfaces stop inventing a renewal date** (`0e73c76`). `RENEW_DATE = '12 Jun 2026'`
is prototype mock data and it was the runtime fallback in **five** places, starting in the pure layer:
`formatRenewDate` returned it on both the missing *and* the unparseable branch, so even the "live" path
fabricated. It now returns **`null`** and every surface drops the claim rather than substituting —
`PlusBanner` renders the bare word `Member`, the billing footnotes and `CancelSheet` lose their "until …"
clauses. `RENEW_DATE` **stays in `data.js`** for the dev panel and fixtures, commented as never-a-fallback.

**IMP-083 — Cancel goes to the subscription, not to a list** (`1f4f037`). New pure
`manageUrl({ platform, productId, packageName })` builds `?sku=&package=`; `PACKAGE_NAME` comes from
`Constants.expoConfig`, not a hardcode. **Missing either value degrades to the generic URL** — a broken
link is worse than a list. ⚠️ **The `plus_annual:annual` → `plus_annual` strip is still unproven against a
real Play id** (WALK-19 step 10); if that lands on "not found", it is the first suspect.

**Two traps worth keeping.** `Constants.expoConfig` is **undefined under jest**, which is the only reason
`manageUrl` had to take `packageName` as a *parameter* to be testable. And `react-native-purchases` pulls
in ESM that `transformIgnorePatterns` does not cover — `__tests__/billing/revenueCatService.test.js` opens
with a `jest.mock` of it. **Do not remove that mock.**

**Both SHIPPED by OTA the same day** on the owner's instruction — the first update ever published on this
lane — update group `ac5c4189-736c-44f0-96ae-6ceea4fe4712`, runtime 1.0.8, from commit `8abf11f`. **Shipped
ahead of their proof; WALK-19 is still owed.** ⚠️ Then the owner subscribed in airplane mode and it
succeeded — which is where IMP-084 came from, and which retired three things I had asserted confidently
and wrongly that day: `12 Jun 2026` was never a valid "did the OTA apply" tell, IMP-083's stated cause was
wrong (there was no subscription to find), and the billing preflight had never guarded anything.

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
