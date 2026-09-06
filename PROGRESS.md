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
> ## 🔴 STOP — THE OTA LANE PUBLISHES AN **EMPTY** RevenueCat KEY. IMP-085 SHIPPED IT.
>
> **Found 2026-09-06 from the owner's device report** (clear data → onboarding offers a 7-day trial →
> the You tab has **no** subscribe *and* no manage entry, either way). Read back from the **live**
> production manifest, runtime `1.0.9`, group `d5f03a47` — this is measured, not derived:
>
> ```
> rcAndroidKey":""      rcIosKey":""      createdAt 2026-09-06T10:46:33Z
> ```
>
> **`eas update` evaluates `app.config.js` on whatever machine runs it**, and an `eas.json` profile
> `environment` binds the **BUILD lane only**. Without `--environment production` the runner has no
> `RC_ANDROID_KEY`, `extra.rcAndroidKey` publishes as `''`, **and the update OVERWRITES the key the
> installed build embedded.** So the two halves have never been in the same place:
>
> | | probe | key | result |
> | --- | --- | --- | --- |
> | vc15 **embedded** | ❌ `require.resolve` | ✅ present | billing off |
> | production **OTA** `d5f03a47` | ✅ fixed | ❌ **wiped** | billing off |
>
> **IMP-085 fixed the probe and, in the same update, deleted the key the probe now correctly checks.**
> ⚠️ **The commit message `9df451d` — "real billing is live for the first time" — is WRONG. It never was.**
> IMP-084 layer A is still real and still proven (EAS injects the key at **build**); nothing guarded the
> **update**. ⚠️ **This branch never reaches CI**, so every OTA here was published **by hand** with the
> same naked command — `docs/playbook.md` documented it that way too.
>
> ✅ **[IMP-086](docs/build-log.md) fixes both, commit `c50e7e7`** — `--environment production` on the
> workflow command, `otaEnvironmentPreflight` failing CI on any `eas update` line missing it, the
> playbook's copy corrected, **and onboarding brought under the gate** (see below). `npm test` **936**
> green (was 915), `npx expo export` clean.
>
> ## ✅ THE PAID SURFACE IS BACK ON THE DEVICE — 2026-09-06
>
> ✅ **IMP-086 (`c50e7e7`) and IMP-087 (`74084e5`) are both published** and the owner confirms the Plus
> option is now **visible in the You tab** on their phone. The manifest reads back **non-empty**.
>
> 🧠 **The behaviour that caused three rounds of confusion, written down so nobody re-derives it.** The
> owner cleared data, onboarded, skipped the trial offer, saw an **empty You tab** — then backgrounded the
> app a couple of times and the Plus option **appeared**. Nothing raced and nothing is flaky. That is the
> OTA lane doing exactly what it documents:
>
> 1. **Clearing app data deletes the downloaded update**, so the next launch runs the **embedded vc15** —
>    which predates IMP-085/086/087: its onboarding offer is gated on bare `PLUS_ENABLED` (**the offer
>    shows**) and its You tab on a `PAYWALL_LIVE` that the dead `require.resolve` probe forces false
>    (**empty tab**). The exact symptom, from the bundle nobody thought they were testing.
> 2. That launch **downloads** the new update in the background.
> 3. The next **cold** start swaps it in — and backgrounding hard enough for Android to restart the
>    process is what did it.
>
> ⚠️ **So "clear data to reproduce" is the one gesture that guarantees you are testing the OLD bundle.**
> The trial offer appearing at all is now a **reliable tell**: under IMP-086 an offer means the gate is
> live, and an offer followed by an empty You tab is impossible — it can only be a pre-`c50e7e7` bundle.
>
> 🚦 **What is proven and what is NOT.** Proven: the key ships, the probe works, the surface renders.
> **NOT proven: that money can actually change hands.** `useLivePrices` merges the store's real prices
> over the `PLUS_PRICES` design constants and **silently keeps the constants when the store is
> unreachable**, so a paywall reading exactly **`$4.99` / `$29.99`** is the *fallback*, not Play. **Real
> billing shows localized Play prices in the owner's own currency.** That check, plus **WALK-19 step 0(c)
> — airplane mode, the purchase must FAIL** — is the acceptance. ⚠️ **Real charges are possible now:
> confirm every account on the `internal` tester list is a license tester first.**
>
> ⚠️ **The owner's Plus is still a leftover FAKE entitlement** from a `simService` purchase, persisted
> locally — which is why the skins stayed unlocked while the paid surface vanished. **There is almost
> certainly no Play subscription to cancel and no real charge has occurred.** Confirm in Play.
>
> ⚠️ **Second defect, same report: onboarding was NEVER under IMP-084's gate.** Its three paid mounts read
> the bare `PLUS_ENABLED` flag, so the trial teaser and the **full Paywall** opened in a build that cannot
> transact — where `createPurchaseService` falls back to `simService`: a fake `success` after 1500ms that
> **grants Plus free and persists it**. That is the vc14 giveaway, still reachable on first run, and it is
> what the owner was offered. Fixed in `c50e7e7` (`OB_PAYWALL_LIVE`). ⚠️ **IMP-084's audit read
> `RitualsApp.js` only** — and so did its source assertion. Both now cover `Onboarding.js`.
>
> **jest is blind to all of this by construction**: it renders with `__DEV__` true, so the gate is
> legitimately live there, and no test can read a published manifest. 936 green tests cannot see it. Every
> guard added for it is a **source assertion**, and each was proven to fail on the real defect first.
>
> ## ✅ THE PURCHASE SIMULATION IS OFF THE TRACK — v1.0.9 / vc15 shipped 2026-09-06
>
> **The incident:** the owner subscribed in **AIRPLANE MODE and it succeeded** (2026-09-06, proven on a
> device). Real Play Billing cannot complete a purchase with no network; `simService` can, and grants Plus
> **free**. vc14 had shipped with no RevenueCat key and fell back to it.
> ✅ **[IMP-084](docs/build-log.md) fixed all three layers, commit `da77a7d`, and BOTH lanes shipped:**
> - **OTA (layer C), runtime 1.0.8** — update group `90aa2074-6625-4072-8d35-71244a525b2d`, from `2834dd9`.
> - **BUILD (layers A + B), v1.0.9 / vc15 → `internal`** — confirmed from `eas submit:list`, not inferred:
>   `Status: finished`, `Release Status: completed`, `Version code 15`, build
>   `e97db74d-e53d-4290-af3d-80b2e8163737`, submission `a43f49c1-f1fd-4964-bc85-ae05b1357e5c`, from commit
>   `980cdad`, runtime `1.0.9`, fingerprint `1a1cb4bd…`. **vc15 replaces vc14 on the track.**
>
> ✅ **Layer A is PROVEN, and this is the line to check on every future build.** The vc15 log reads
> **`Environment variables with visibility "Plain text" and "Sensitive" loaded from the "production"
> environment on EAS: RC_ANDROID_KEY`** — EAS Build injecting the key it silently omitted for vc14.
> **Its absence is the defect.** Root cause, evidenced, do not re-derive: the key always existed on EAS;
> **no `eas.json` profile declared an `environment`** (now all three do). The old preflight passed
> throughout because it reads the **CI runner's** env, not the machine that decides. ⚠️ Adding `env:` to
> the workflow's build step does **nothing** — cloud builds evaluate `app.config.js` on EAS's servers.
>
> ⚠️ **What is still NOT proven — this is unwalked, not verified.** No purchase has been put through vc15.
> **WALK-19 step 0(c) is the acceptance: airplane mode, attempt a purchase, and it must FAIL.** jest is
> structurally blind here (the suite runs `simService` and renders with `__DEV__` true), which is why layer
> C needed a source assertion rather than a render test. Two residues from the incident, both still true:
> - **Every "purchase" on vc14 was fake** — nothing reached Google, so there was **nothing to cancel**.
>   That, not a missing `?sku=`, is why the owner could not find their subscription. **IMP-083 was scoped
>   against a symptom whose stated cause was wrong** (its fix is still correct, and still shipped).
> - **`12 Jun 2026` does NOT prove an OTA failed to apply.** `simService`'s fake `renewISO` formats
>   through IMP-082's *new* code to exactly that string. Verified by hand 2026-09-06.
>
> ⚠️ **Real charges are now possible on `internal`** — vc15 transacts for real. **Confirm every account on
> that tester list is a license tester** before anyone touches a real card. **Do not promote to
> `production`** until the walks clear.
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
> | a **build task** | ✅ **The queue is EMPTY** — IMP-087 (`74084e5`) was the last row and **both it and IMP-086 are shipped**. The work left is a **walk**, not a build (see the 🚦 above). **Nothing should be invented to fill it**; new work comes from a 🔴 walk finding, the owner, or a design doc. |
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
| `internal` | **1.0.9 / vc15** | 36 ✅ | ✅ **SHIPPED 2026-09-06 — it replaced vc14 on this track.** Confirmed from `eas submit:list`, not inferred: `Status: finished`, `Release Status: completed`, `App Version 1.0.9`, `Version code 15`. EAS build `e97db74d-e53d-4290-af3d-80b2e8163737`, submission `a43f49c1-f1fd-4964-bc85-ae05b1357e5c`, from commit `980cdad` on `feat/design-push`. Runtime `1.0.9`, fingerprint `1a1cb4bd…`. ⚠️ **It embeds the key but CANNOT take money as installed** — vc15's bundle still carries IMP-085's broken `require.resolve` probe, and the OTA that fixed the probe **wiped the key** (IMP-086). Its build log does confirm EAS injected `RC_ANDROID_KEY` (IMP-084 layer A) — that half is real; the update lane undid it. ⚠️ **Unwalked: WALK-19 step 0(c) — airplane mode, the purchase must FAIL.** ⚠️ **Real charges are possible here now** — confirm the tester list is all license testers. Unblocks WALK-19, WALK-18, WALK-11, WALK-12 |
| _(superseded)_ | ~~1.0.8 / vc14~~ | 36 ✅ | 🔴 **THIS BUILD FAKED PURCHASES** — no RevenueCat key, fell back to `simService`, granted Plus free. Replaced by vc15 on 2026-09-06. Kept here as the worked example: the giveaway was invisible to CI, to jest and to a green preflight, and was caught only by a human subscribing in airplane mode |

**Ship mechanics, all still in force.** Builds **auto-submit to `internal`** (`eas.json` →
`submit.production.android.track`, set 2026-08-08 in `a299af7`). Reaching the public is the **manual
`internal` → `production` promotion** in Play Console, which does get the full ~7d review — and it should
not be taken until the device walks clear. **✅ API-36 compliance (deadline 2026-08-31) is met
ACCOUNT-WIDE** — blocker closed 2026-08-13; every active release on every track is `targetSdkVersion 36`.

**⚠️ The OTA lane: reopened onto vc15, and it cannot carry everything.** `eas update` publishes to
Expo's CDN — **no Play track, no Google, no review** — gated only by **channel** (`production`) + a
**matching `runtimeVersion`** (= `appVersion`). **It is now `1.0.9`, which vc15 shipping to `internal` on
2026-09-06 reopened**; that is **vc15 installs and nothing else** (`alpha` on vc12, `beta`/`production` on
vc9 receive nothing, and **vc14 installs are now orphaned** — they take no further OTA). An installed build
takes an OTA regardless of which track it came from, and **it applies on the SECOND launch** (check on
load, download in background, swap next launch) — "nothing changed" is almost always this. **Anything
native needs a build**, and **a `bump:native` closes the lane until that versionCode actually ships** — the
trap IMP-076 and IMP-077 both sprang, and which the vc15 bump sprang deliberately for the ~20 minutes the
build took. **Do not OTA a fix and then treat WALK-12's R8 pass as valid:** R8 runs at build time, so the
code on the device is no longer the code that was walked.

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
| **084** | **The release build stops shipping the purchase simulation** | **Build** | ✅ code-complete + **SHIPPED 2026-09-06** · commit `da77a7d` · three layers: all three `eas.json` profiles bind an `environment`, `easEnvironmentPreflight` fails CI when `build.production.environment` is absent or wrong, and `paywallLive({plusEnabled, billingConfigured, dev})` gates the paid surface (all 16 `PLUS_ENABLED` uses in `RitualsApp.js` → `PAYWALL_LIVE`; `config.js` unchanged) · ✅ **layer C by OTA** (group `90aa2074-…`, runtime 1.0.8) then ✅ **layers A+B in v1.0.9 / vc15 → `internal`** (`980cdad`) · **branch still never pushed** · ⚠️ **UNWALKED — WALK-19 step 0(c): airplane mode, the purchase must FAIL** |
| **085** | **The SDK probe that has always said no** | **OTA** | ✅ code-complete 2026-09-06 · commit `2672bf2` · **branch-only, never pushed** · `require.resolve` is not implemented by Metro, so `isBillingConfigured()` returned **false in every build ever shipped** — every release ran `simService`. Now a static `require` + pure `billingModuleOk(mod)` (`typeof mod.configure === 'function'`), with a source assertion banning `require.resolve` from code lines · **and a subscriber keeps the cancel route**: Manage gates on `plus`, `PlusBanner` renders on `plusEnabled || plus` in YouScreen **and** Shop (the render gate, not the handler, was what hid it), falling back to Play's own subscription screen · pure JS · ✅ **SHIPPED by OTA 2026-09-06** (group `d5f03a47-…`, runtime 1.0.9) · ⚠️ **UNWALKED — WALK-19 step 0(c) inverted: the paywall must be VISIBLE and an airplane-mode purchase must FAIL** |
| **086** | **The OTA lane publishes an empty RevenueCat key** | **OTA** | ✅ code-complete 2026-09-06 · commit `c50e7e7` · **branch-only, never pushed** · `eas update` evaluates `app.config.js` on the machine that runs it and an `eas.json` profile `environment` binds the **build** lane only, so every OTA ever published here shipped `extra.rcAndroidKey: ""` — **overwriting the key the installed build embedded**. Measured from the live `1.0.9` manifest (group `d5f03a47`), not derived. Now `--environment production` on the workflow command + in the playbook, a third pure check `otaEnvironmentPreflight` failing CI on any naked `eas update` line, **and onboarding's three paid mounts moved off bare `PLUS_ENABLED` onto `OB_PAYWALL_LIVE`** (the `simService` free-Plus giveaway was still reachable on first run) · 936 green (was 915) · ✅ **SHIPPED by OTA 2026-09-06** (group `62a8f8cf-9853-47e8-b013-907544e85f0c`, runtime 1.0.9) — manifest verified non-empty, surface confirmed on the owner's device |
| **087** | **The paid surface says why it is missing** | **OTA** | ✅ code-complete 2026-09-06 · commit `74084e5` · **branch-only, never pushed** · vc14, vc15 and the IMP-085 OTA all rendered as **one empty You tab** from three different causes, each costing a device round trip · new `billingStatus()` splits the two facts `isBillingConfigured()` collapses, pure `billingDiagnostic()` names whichever is false, and a **"Plus is unavailable"** row stands where the paid surface would be — **null in every healthy build** (live / Plus off / dev) so it cannot become noise · also reports the running bundle via pure `describeUpdate(expo-updates)`, required in a try/catch · IMP-084's `PLUS_ENABLED` pin **updated, not loosened** · 952 green (was 936) · ✅ **SHIPPED by OTA 2026-09-06** · ⚠️ **it should now render NOTHING** — if the "Plus is unavailable" row ever appears, read the bundle id it prints before doing anything else |
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
  be promoted and no walk runs for its sake. ⚠️ **That decision is now two builds stale**: vc13 → vc14 →
  **vc15, which is the live `internal` build and the only promotion candidate** (vc13 and vc14 are history;
  vc14 must never be promoted — it fakes purchases). **Remaining: the device walks, then promote by hand**
  (full review, ~7d). 🚦 **WALK-19 gates it.**
- **✅ SETTLED by vc15 — kept because the reasoning still applies to any OTA.** The 2026-09-06 OTAs
  quietly turned real billing ON at runtime, which vc15 now does properly at build time. Update
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


_2026-09-06, later (Opus — **IMP-084 landed AND shipped on both lanes; v1.0.9 / vc15 is on `internal`**;
branch-only, NOT pushed) — **a build session that became a ship session on the owner's instruction.**_

**IMP-084 — a paywall that cannot charge is no longer shown.** All three layers landed as the spec wrote
them; nothing was redesigned. Commit `da77a7d`.
- **A — the key reaches the build.** No `eas.json` profile declared an `environment`, so `RC_ANDROID_KEY`
  sat on EAS and was never injected. All three profiles now bind one; `channel`/`distribution`/`submit`
  untouched.
- **B — the preflight verifies the lever, not the runner.** New pure `easEnvironmentPreflight({ easJson })`
  beside the unchanged `billingPreflight`; `main()` runs both and prints every failure. **Run against the
  pre-fix `eas.json` it reproduced the vc14 diagnosis exactly** — `declares environment undefined, expected
  "production"`. The header's "hard build failure instead of a shipped one" claim is replaced by an account
  of what the script cannot see.
- **C — the app hides a paywall it cannot back.** `paywallLive({ plusEnabled, billingConfigured, dev })`
  in `src/billing/index.js`; `RitualsApp.js` derives `PAYWALL_LIVE` after `PLATFORM` and threads it through
  **all 16** former `PLUS_ENABLED` uses — props, four `Modal visible=` gates, `restoreAccess`.

**One deviation from the spec, a tightening.** The required source assertion, first written as
`/plusEnabled\s*[=:]\s*PLUS_ENABLED/`, matched the gate's own legitimate `plusEnabled: PLUS_ENABLED,`
line. It is now the JSX-prop form the spec names, plus a second test pinning the surviving `PLUS_ENABLED`
lines in that file to exactly two (the import, the gate input). Stricter than one regex: any new bare use
fails the suite.

**Proof: 915 passed / 90 suites** (from 902/89 — new `__tests__/billing/paywallLive.test.js`, four cases
appended to `__tests__/scripts/checkBillingConfig.test.js`), both zone suites green, `npx expo export
--platform android` clean.

**✅ SHIPPED ON BOTH LANES, in that order, on the owner's instruction ("I need this in internal asap").**
The order was forced and matters: **the OTA had to go first**, because the `bump:native` that the build
needs moves `runtimeVersion` to 1.0.9 and closes the 1.0.8 lane behind it.
1. **OTA — layer C only**, `eas update --channel production --platform android`, update group
   `90aa2074-6625-4072-8d35-71244a525b2d` (Android update `01a07618-8aed-7143-b09b-ff58c1b5d1ca`), runtime
   **1.0.8**, from commit `2834dd9`. The publish log shows `env: export RC_ANDROID_KEY`, so **that update
   carries the key in its manifest** — on vc14 `hasKeyFor` returns true, billing goes real, and
   `PAYWALL_LIVE` keeps the surface visible instead of hiding it.
2. **BUILD — layers A + B**, `npm run bump:native` → **v1.0.9 / vc15** (`980cdad`), preflight green on both
   checks with the key loaded (`exit=0`), then `eas build --platform android --profile production
   --auto-submit`. **Confirmed from `eas submit:list`, not inferred:** `Status: finished`, `Release Status:
   completed`, `Version code 15`, build `e97db74d-e53d-4290-af3d-80b2e8163737`, submission
   `a43f49c1-f1fd-4964-bc85-ae05b1357e5c`, runtime `1.0.9`, fingerprint `1a1cb4bd…`. **vc15 replaced vc14
   on `internal`.**

**✅ Layer A is proven, and the proof is a log line to check on every future build:** `Environment
variables with visibility "Plain text" and "Sensitive" loaded from the "production" environment on EAS:
RC_ANDROID_KEY`. **Its absence is the vc14 defect.**

⚠️ **Shipped ahead of its proof, again.** Nothing about vc15's billing has been walked — **WALK-19 step
0(c) is the acceptance: airplane mode, attempt a purchase, and it must FAIL.** jest cannot see any of it.
**Real charges are now possible on `internal`** — confirm every tester is a license tester. **Do not
promote to `production`** until the walks clear. vc14 installs are now orphaned: runtime 1.0.9 means they
take no further OTA, so anyone still on vc14 who never took the 2026-09-06 update keeps a fake paywall
until they update to vc15.

**One workflow trap, cost a restart:** `npx eas-cli@latest` stops at an `Ok to proceed? (y)` install prompt
and hangs any tee'd or non-interactive run. **This machine has a global `eas` (21.8.0) — call it directly.**

**NEXT: this is a WALK lane now and the build queue is empty.** 🚦 **[WALK-19](docs/walk-open.md) is
UNBLOCKED for the first time** — it needs vc15 on the owner's phone (Play → internal), a license tester,
and it gates the `internal` → `production` promotion. Its **step 0(c)** is IMP-084's acceptance. Also ready
on a debug build of this branch: **WALK-07 (Paywall half)**, **WALK-03 step 4**, **WALK-11**. **WALK-18**
is now runnable too — vc15 carries Reanimated — but needs a **mid-range device**. **WALK-12 (R8) LAST**,
and it must be re-walked on **vc15**, not vc13._

---

_2026-09-06, third session (Opus — **IMP-085: the real root cause, found from the owner's device report**;
branch-only, committed, **NOT shipped**) — **the session where the previous two diagnoses turned out to be
incomplete.**_

**The report that broke it open:** after vc15, **Manage Subscription was gone from the app entirely** while
**Plus was still applied and the skins still unlocked** — the signature of `PAYWALL_LIVE === false` plus a
stale local `plus` flag. It meant `isBillingConfigured()` was still false on a build that provably received
the key.

**The cause, verified in the toolchain source.** `src/billing/index.js` probed with
`require.resolve('react-native-purchases')`. **Metro does not implement it:**
`metro-runtime/src/polyfills/require.js` assigns `importDefault`, `importAll`, `context`, **`resolveWeak`**,
`unpackModuleId`, `packModuleId` — **never `resolve`**; and `metro/src/ModuleGraph/worker/collectDependencies.js`
rewrites `resolveWeak` and `require.context` but **not** `require.resolve`. It threw in every bundle, the
catch swallowed it, and **`isBillingConfigured()` returned false in every build this app has ever shipped.**
**Every release ran `simService`, vc15 included.** The SDK was bundled and would have worked —
`revenueCatService.js` statically imports it — only the probe was broken.

**What that rewrites.** IMP-084 layer A is **correct and its proof stands** (EAS really does inject the key
now), but nothing read it. "vc14 had no key" was a real bug and **not the primary cause**. And **no real
purchase has ever been possible in this app** — so there is almost certainly no Play subscription against
the owner's account and no charge has occurred. Their Plus is a **fake entitlement** written by
`simService` and persisted locally.

**IMP-085 (`2672bf2`), both halves.** (a) A plain static `require` — which Metro *does* collect — feeding a
pure `billingModuleOk(mod)` (`typeof mod.configure === 'function'`), with a source assertion banning
`require.resolve` from any code line. (b) **A subscriber must never lose the route to cancel:** Manage gates
on `plus`, not on saleability, and falls back to Play's own subscription screen when billing cannot
transact. ⚠️ **The spec's Step 4 was insufficient, and this is the part worth remembering** — changing the
handlers did nothing, because `PlusBanner` *is* the Manage route and was rendered behind `{plusEnabled && …}`
in **both `YouScreen.js` and `Shop.js`**. The render gate, not the handler, was what hid it.

**Proof: 926 passed / 91 suites** (from 915/90), both zone suites green, `npx expo export --platform
android` clean. **The two render-gate tests were verified to FAIL against the pre-fix gate** — reverted by
hand, re-run, one red, restored — because a test that passes either way would have been worthless here.
**Last command: `npx expo export --platform android` → `Exported: dist`.**

**⚠️ The standing lesson, three incidents deep: jest is structurally blind to billing and always has been.**
Under jest `require` is **node's**, where `require.resolve` works — which is exactly why 915 green tests
could not see a defect present in every shipped build. The suite also runs `simService` and renders with
`__DEV__` true. **A green suite is not evidence about billing. It never was.**

**NEXT.** ✅ **IMP-085 SHIPPED by OTA on the owner's instruction** — update group
`d5f03a47-48be-4539-9a8c-fc9b5be46f69`, runtime **1.0.9**, from `6d4dd72`, reaching vc15 `internal`
installs on their second launch. ⚠️ **Real billing is now live for the first time in this app's history** —
confirm the tester list. ⚠️ **Shipped ahead of its proof, a third time.** **[WALK-19](docs/walk-open.md) is what is actually owed** —
three consecutive billing fixes have landed without a single runtime check, and each found the previous
diagnosis incomplete. **Step 0(c), inverted, is the acceptance: the paywall must be VISIBLE, an
airplane-mode purchase must FAIL, and an online purchase must appear in Play's subscription list.**_
