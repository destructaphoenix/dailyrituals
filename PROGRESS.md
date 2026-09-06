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
> ## ✅ BILLING IS REAL — AND WALK-19 HAS NOW RUN, WITH THREE DEFECTS — 2026-09-06 (night)
>
> **`PAYWALL_LIVE` is true on the owner's device, prices render in INR from the live Play offering, and an
> airplane-mode purchase does not complete.** The simulation is off the device and Play is transacting.
> **Full narrative → [`docs/build-log.md`](docs/build-log.md) → "The 2026-09-06 billing incident".** Do not
> re-derive any of it; the four fixes are IMP-084 → IMP-088 and all are shipped.
>
> **The seven things worth carrying forward, and nothing else:**
>
> 1. ⚠️ **Every `eas update` needs `--environment production`.** It evaluates `app.config.js` on whatever
>    machine runs it, and an `eas.json` profile `environment` binds the **build** lane only. Without the
>    flag the manifest publishes `rcAndroidKey:""` and **overwrites the key the installed build embedded**
>    — billing goes off on every device that takes it. A local `.env` does **not** save you.
>    **A publish log line is not evidence — read the manifest back**, every time:
>    `curl -sS -H 'expo-platform: android' -H 'expo-runtime-version: 1.0.9' -H 'expo-channel-name: production'`
>    `-H 'expo-protocol-version: 1' -H 'accept: multipart/mixed' https://u.expo.dev/1a0f9b15-cb1a-4cec-9577-3cd66e9f1d36 | grep -o 'rcAndroidKey":"[^"]*"'`
>    `scripts/check-billing-config.js` guards the workflow copy; **it cannot guard what you type by hand.**
> 2. ⚠️ **Clearing app data DELETES the downloaded update** — this cost four rounds. The gesture used to
>    "reproduce cleanly" sends the next launch back to the **embedded** bundle, which predates every OTA
>    fix. An OTA applies on the **SECOND** launch. To test one: **open, wait ~15s, fully kill, open again —
>    never clearing data in between.** "Nothing changed" has been this every single time.
> 3. ⚠️ **jest cannot see any of this.** It renders with `__DEV__` true and cannot read a published
>    manifest, so every guard here is a **source assertion** — and each was proven to fail on the real
>    defect before it shipped. A green suite is not evidence about billing.
> 4. ⚠️ **IMP-088's escape is NOT a timeout-to-failure and must never be "simplified" into one.** A real
>    purchase takes minutes on INR/3DS flows; declaring failure mid-charge is worse than hanging.
> 5. ⚠️ **IMP-091's cause is NOT established and its first step is a MEASUREMENT.** IMP-088's escape never
>    appeared on the device — but that is equally consistent with the phone not running the IMP-088 bundle.
>    Settle it with `adb logcat | grep -i "expo-updates\|EXUpdates"` or the IMP-087 diagnostic's bundle id
>    **before writing a fix**, and do not let "IMP-088 doesn't work" enter the record until it is proven.
> 6. ⚠️ **A hung purchase cannot be reproduced cheaply.** Restore was the obvious no-money diagnostic and it
>    does not work: it never hangs, it answers instantly from RevenueCat's local cache (that is IMP-092).
>    Testing the pending overlay requires a real purchase attempt.
> 7. ✅ **Settled, do not re-raise: the free trial is BURNED on the owner's Google account** (subbed and
>    unsubbed before; Play grants one per account ever). Play's sheet saying "charging today" is Play being
>    **correct** — the product config is not the suspect, our hardcoded CTA is (IMP-090).
>
> 🚦 **WALK-19 RAN ON HARDWARE 2026-09-06 (night) and found THREE defects in four steps.** Steps 1 and 2
> pass; the sitting **stopped before any purchase**, which was the right call — IMP-089 could charge someone
> who tapped Restore. **Full paragraph → [`docs/walk-open.md`](docs/walk-open.md) → WALK-19. Do not
> re-derive it.** IMP-089 is **fixed but unshipped**; **IMP-090, 091, 092 are the build queue.** Nothing is
> promoted `internal` → `production`.
>
> ⚠️ **Real charges are possible on `internal`** — confirm every account on that tester list is a Play
> **license tester**. ✅ RevenueCat has **no sandbox for Google Play**, and **RC's own Play service account
> credential is configured** (owner-confirmed, long ago) — **settled, do not re-raise.**
>

>
> | If this chat is… | Take |
> | --- | --- |
> | a **build task** | ⛔ **There isn't one — [`docs/specs-open.md`](docs/specs-open.md) is EMPTY.** IMP-093 landed 2026-09-07, the same day it was written. ⚠️ **Do not open a new billing row from reasoning alone**: every row since IMP-084 came out of a device sitting, and the two most recent (IMP-092's cache limit, IMP-093) were both found by someone holding the phone, not by reading the code. |
> | a **runtime walk** | 🚦 **This is the only queue with anything in it.** ✅ **IMP-093 shipped by OTA 2026-09-07** (group `964e4fc2-…`), so the phone can be brought current with open → wait ~15s → swipe away → open. **WALK-19 re-ran 2026-09-07: step 3 ✅, step 4a ✅, step 4c ⬜ inconclusive → IMP-093.** Read its RESULT block before touching it again; **do not re-derive it and do not re-run 3 or 4a**, they are proven. What is left on that row needs either IMP-093 landed (4c) or a purchase attempt (4b, 4d–4f, 5–10). ⚠️ **The aeroplane-mode Restore check — IMP-092's second half — is one tap and is UNRUN.** ✅ **Ready NOW on a debug build of this branch:** **WALK-07** (Paywall half — IMP-080), **WALK-03 step 4** (`neverBackedUp` — IMP-081; default **and** max font) and **WALK-11**. ⚠️ **Those need the local debug APK, which cannot coexist with the Play build** — same `applicationId`, different signing key, so swapping means uninstall and a data wipe. **Export a backup first; that export is WALK-03 step 1, so sequence the sitting to get it free.** ✅ **Ready NOW on a debug build of this branch, no OTA needed:** **WALK-07** (Paywall half — IMP-080), **WALK-03 step 4** (`neverBackedUp` — IMP-081; default **and** max font) and **WALK-11** (the Plus perk surfaces mount on their own). ⚠️ **WALK-18 needs a mid-range device.** **WALK-08 is PARTIAL.** **WALK-12 (R8) is LAST** and must be re-walked on the exact build you ship. **WALK-16/17 CLOSED ✅ on emulator evidence; WALK-13 DROPPED.** ⚠️ **Gap no closed row covers:** real doze, OEM battery managers, delivery to a real share target, Google's own backup schedule. |
> | a **design request** | See "Claude Design" below. The live request is **Insights**. |

**The whole design push lives on `feat/design-push`, which is NEVER pushed, NEVER given a `Release-Lane:`
trailer, and NEVER merged to `main`** without a separate owner decision. ⚠️ **That is why every OTA on this
lane is published BY HAND** — CI only runs on `main`, so `release.yml`'s guards never fire here, and
`--environment production` is on you. Thirteen specs are code-complete and branch-only: IMP-076 ✅ IMP-078 ✅
(2026-08-17), IMP-080 ✅ IMP-081 ✅ IMP-077 ✅ (2026-09-05), IMP-082 ✅ IMP-083 ✅ IMP-084 ✅ IMP-085 ✅
IMP-086 ✅ IMP-087 ✅ IMP-088 ✅ (2026-09-06). **The free-app improvement track is CLOSED** (owner,
2026-08-16): `IMP-001`–`IMP-075` are done bar the deferred `IMP-022` and the reserved `IMP-057`; **do not
open new free-track rows.** **`IMP-057` is reserved, not missing** — do not reuse the number. **IMP-044
claims no queue slot** — it rides the next build and needs only WALK-12.
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
| `internal` | **1.0.9 / vc15** | 36 ✅ | ✅ **SHIPPED 2026-09-06 — it replaced vc14 on this track.** Confirmed from `eas submit:list`, not inferred: `Status: finished`, `Release Status: completed`, `App Version 1.0.9`, `Version code 15`. EAS build `e97db74d-e53d-4290-af3d-80b2e8163737`, submission `a43f49c1-f1fd-4964-bc85-ae05b1357e5c`, from commit `980cdad` on `feat/design-push`. Runtime `1.0.9`, fingerprint `1a1cb4bd…`. ✅ **WITH THE OTAs APPLIED IT TAKES MONEY FOR REAL — proven on a device 2026-09-06** (WALK-19 step 0(c): an airplane-mode purchase does not complete; step 2: prices render in INR). ⚠️ **The binary alone does NOT** — vc15's embedded bundle carries IMP-085's broken probe, so a device that has not taken the OTAs (or has just had its data cleared) is back to a dead paywall. **The capability lives in the update, not the build.** ⚠️ **Real charges are possible here now** — confirm the tester list is all license testers. Unblocks WALK-19, WALK-18, WALK-11, WALK-12 |
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
| **088** | **The purchase overlay stops being a trap** | **OTA** | ✅ code-complete 2026-09-06 · commit `c494721` · **branch-only, never pushed** · from the 🔴 WALK-19 step 0(c) finding on hardware · `usePurchaseFlow` awaited the service **unbounded** and the pending card had **no dismiss control** while saying *"Don't close the app"* — a hung RevenueCat call left force-quit as the only exit · ⚠️ **NOT a timeout-to-failure, and must never become one** — a real purchase takes minutes on INR/3DS flows, so declaring failure mid-charge is worse than hanging · new `PENDING_GRACE_MS` + pure `stuckCopy()` (pinned to never claim failure and to protect the user who WAS charged), an escape button, and `onAbandon` → `checkEntitlement`/`nextPlusState` reconcile in **both** RitualsApp and Onboarding · 965 green (was 952) · ✅ **SHIPPED by OTA 2026-09-06** (group `82bc2b16`, manifest key verified non-empty) |
| **089** | **"Try again" on a restore must never buy** | **OTA** | ✅ code-complete 2026-09-06 · **branch-only, never pushed** · from the 🔴 WALK-19 step 4a/4c finding on hardware · `usePurchaseFlow`'s `onRetry` called `buy()` **unconditionally**, so "Try again" on the **restore-empty** and **network** cards opened Play's purchase sheet — a subscriber tapping "I already paid" was one tap from a charge · the mode was already tracked (`lastModeRef`, which `dismiss()` reads correctly two lines above); retry just never consulted it · 968 green (was 965) · ⚠️ **fixed inside the walk chat at the owner's explicit instruction**, a deliberate departure from "a walk only scopes" · ✅ **SHIPPED by OTA 2026-09-07** (group `424b5a88-c993-44d7-91d6-db586ad22c32`, runtime 1.0.9, manifest read back with a non-empty `rcAndroidKey`) · ✅ **PROVEN ON HARDWARE 2026-09-07** — WALK-19 step 4a: "Nothing to restore." → **"Try again" repeated the restore and Play's purchase sheet did NOT open** |
| **090** | **The paywall stops promising a trial it cannot see** | **OTA** | ⬜ **OPEN** · from the 🔴 WALK-19 step 3 finding · our CTA is the literal `Start 7-day free trial` while **Play's sheet said "charging today" + the INR amount** · `getPrices()` fetches only `priceString`/`price`, so the app has **never had offer data** · ⚠️ the owner has subbed/unsubbed on this account and a Play trial is **once per account ever**, so Play is right and the product config is probably fine · **the CTA must never name a trial it cannot confirm the buyer gets** — Android has no eligibility check, so reading the offer and printing the days reproduces the same bug · ✅ code-complete 2026-09-07 · commit `f38ca24` · **branch-only, never pushed** · `getPrices()` gained `trialDays` (guarded across three SDK shapes, any miss → `null`), `mergePrices` carries it, new pure `ctaLabel()` → `Subscribe` / `Try free, then subscribe` and **never the day count** · the legal footer's *"Your 7-day free trial converts to…"* now appears only when the live offer has one, worded as the offer not a promise · same sweep on `shopui.js`'s **"Try free"** banner and the onboarding teaser · 1017 green across the three (was 968) · ✅ **SHIPPED by OTA 2026-09-07** (group `424b5a88-c993-44d7-91d6-db586ad22c32`, runtime 1.0.9, manifest read back with a non-empty `rcAndroidKey`) · ✅ **PROVEN ON HARDWARE 2026-09-07** — WALK-19 step 3: our button read **"Subscribe"**, Google's sheet read **"Starting today"**, they agree · ⚠️ "Subscribe" means the live offering exposes **no free phase at all**, so the old hardcoded *"Start 7-day free trial"* was never backed by anything reachable · ⬜ **two branches unexercised and unexercisable here:** the trial-eligible CTA (needs an account that has not burned its trial) and the onboarding mount (needs a data clear, which deletes the OTA) |
| **091** | **The pending escape never appeared on hardware** | **OTA** | ⬜ **OPEN — this is IMP-088's acceptance FAILING** · from the 🔴 WALK-19 step 4c finding · airplane-mode purchase hung past **60s** with no Close button and unchanged copy · wiring re-read and **correct** (`Paywall.js` renders `flow.overlay`, which passes `stuck`) — not a missing prop · ⚠️ **cause NOT established: step 0 of the spec is a MEASUREMENT.** Prime suspect is Android throttling the `setTimeout` while Play's sheet (a separate activity) holds the foreground; the alternative is that the device never ran the IMP-088 bundle · fix, if the former: arm off **elapsed time + AppState resume**, never off a timer alone · **IMP-088's never-assert-an-outcome rule is inherited verbatim** · ✅ code-complete 2026-09-07 · commit `cba53b1` · **branch-only, never pushed** · `run()` stamps `startedAt`, an `AppState` → `active` transition arms the escape off **elapsed wall-clock time** when the grace period is already spent, timer kept for the foreground case, unsubscribed on unmount · new pure `graceSpent()` · ✅ **SHIPPED by OTA 2026-09-07** (group `424b5a88-c993-44d7-91d6-db586ad22c32`, runtime 1.0.9, manifest read back with a non-empty `rcAndroidKey`) · ⚠️ **the spec's step 0 MEASUREMENT was NOT run — no device in the session that landed it.** The fix is correct under (a) and harmless under (b); **the re-run separates them** · ⬜ **STILL UNPROVEN after the 2026-09-07 re-run — step 4c was INCONCLUSIVE, not failed.** Play's no-connection page has **no dismiss control but Back**, and Back closes the **whole paywall**, destroying the overlay before the Close button can be seen; waiting 30s does not help, Play's page does not self-dismiss → **IMP-093** · ⚠️ **it may be unprovable on this path at all** — IMP-093 concludes the honest fix keeps Back as the exit and makes it *reconcile*, rather than keeping the card alive to be looked at · **do not record "IMP-088 does not work"; it was never observed** |
| **092** | **"Nothing to restore" is also what a failed check says** | **OTA** | ⬜ **OPEN** · found off-script during WALK-19 while trying to test IMP-091 · **an airplane-mode Restore answers "Nothing to restore." instantly** — and it always has · `revenueCatService.restore()` relabels every unrecognised error as `restore-empty`, so one sentence means both *"we checked, you have nothing"* and *"we could not check"* · **the exact inverse of the IMP-043 rule `getEntitlement()` states four lines below it** · the person most likely to see it is a real subscriber on a new phone · ⚠️ it also **invalidated the IMP-091 diagnostic** — the restore path never hangs · ✅ code-complete 2026-09-07 · commit `de5cd34` · **branch-only, never pushed** · an unrecognised error now returns `failed`; only a *successful* empty call returns `restore-empty` · new pure `resultCopy()` gives the `failed` card a restore variant (*"We couldn't check."*) and the result phase carries `mode` · **plus a second call site the spec did not name**: the You tab's `doRestore` toasted "Nothing to restore" for every non-success kind · ✅ **SHIPPED by OTA 2026-09-07** (group `424b5a88-c993-44d7-91d6-db586ad22c32`, runtime 1.0.9, manifest read back with a non-empty `rcAndroidKey`) · ⚠️ **known limit, recorded not fixed:** `restorePurchases()` resolves from RevenueCat's local cache offline, so `restore-empty` stays reachable offline for a subscriber with a cold cache · 🟠 **HALF PROVEN 2026-09-07** — the **online** half passed inside step 4a (a genuine check that finds nothing still says "Nothing to restore.") · ⬜ **the aeroplane-mode half ran 2026-09-07 and is INCONCLUSIVE — the fix was never reached.** Restore answered "Nothing to restore.", i.e. `restorePurchases()` **resolved from cache** and took the *success* path; the `catch` branch that IS the fix never executed · ⚠️ **may be unprovable on any device with network history** — the SDK warms its cache at launch; nearest route is step 9 (reinstall → OTA → aeroplane mode before any online restore) · ⚠️ **do not clear app data to chase it, that deletes the OTA** · **reframing worth keeping:** if the cached reply is the dominant behaviour then the cache limit is the bigger half of this defect and the relabelling was the rarer one |
| **093** | **The paywall must not vanish mid-purchase** | **OTA** | ⬜ **OPEN — not urgent, and the spec says so** · from the WALK-19 step 4c re-run 2026-09-07 · Play's no-connection page offers **only Back**, and Back closes the **entire paywall**, unmounting `usePurchaseFlow` and discarding the pending flow — **`onAbandon` never fires**, so the app walks away from a purchase it started without asking the store · ✅ **checked, not assumed: this does NOT lose money** — `useLaunchEntitlementCheck` grants Plus on the next launch, so the cost is a delay, not a stranded subscriber · **it is written because it is why a 🚦 walk row cannot close** · ⚠️ **the obvious fix is wrong**: making Back a no-op re-creates the IMP-088 trap for the first 20s · ✅ **code-complete 2026-09-07** · commit `061b1ff` · **branch-only, never pushed** · `dismiss()` reconciles whenever a flow was **in flight** (was: only when `stuck`); `usePurchaseFlow` exposes `pending`/`dismiss`, `Paywall` publishes them through a `closeGuard` ref cleared on unmount, and the Modal's `onRequestClose` reconciles **then closes** · the false *"Don't close the app"* line replaced by pure `pendingCopy()` · 1031 green (was 1017), export clean · ⚠️ **the two behavioural guards were verified to FAIL against the old `wasStuck` gate** · ⚠️ **scope correction recorded:** the spec named two mount sites but onboarding's paywall is **not** in a `Modal` and has no `onRequestClose`; its back press is a separate pre-existing gap · ✅ **SHIPPED by OTA 2026-09-07** (group `964e4fc2-709c-48b1-bba1-25c603722b1c`, runtime 1.0.9, manifest read back: `rcAndroidKey` non-empty and the serving update id matches the publish) · ⬜ **device acceptance is NOT "4c shows a Close button"** (Back still closes, by design) — it is: back out of a pending purchase and confirm the app asks the store |
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
3. ✅ **The two behavioural guards were verified to FAIL against the old `wasStuck` gate before being
   kept.** Worth doing on this surface specifically: jest runs `simService`, which fabricates every
   purchase outcome, so a test that passes both before and after proves nothing here.

**The state of the billing surface, honestly.** Five fixes are code-complete. **IMP-089 and IMP-090 are
proven on hardware.** **IMP-092 is half proven** — its online half passed, its `catch` branch has never
executed on a device and may be unreachable on any phone with network history. **IMP-091 has never been
observed at all.** **IMP-093 is unshipped.** None of that is a jest question.

**The exact next step.** ✅ **IMP-093 shipped by OTA 2026-09-07** — group
`964e4fc2-709c-48b1-bba1-25c603722b1c`, runtime 1.0.9, manifest read back (key non-empty, serving id
matches the publish). WALK-19's remaining steps need a **purchase attempt** (4b, 4d–4f, 5–10), so
the next billing sitting is the one where money moves. ✅ **Not blocked on any of that: WALK-07, WALK-03
step 4 and WALK-11**, which need the **local debug APK** — it cannot coexist with the Play build, so
**export a backup first (that export is WALK-03 step 1).** **Nothing is promoted `internal` →
`production`.**


_2026-09-07, afternoon (Opus — **WALK-19 re-ran on hardware. Two fixes proven, one half-proven, one
unobservable — and the reason it is unobservable is a new defect.**) — branch-only, NOT pushed._

**What ran.** WALK-19 steps 3, 4a and 4c on v1.0.9 / vc15 from Play `internal`, license tester, against
the 2026-09-07 OTA (group `424b5a88-c993-44d7-91d6-db586ad22c32`). **Bundle confirmed with no cable** —
the Plus banner button read **"See Plus"**, the string that did not exist before this OTA. **Full
paragraph → [`docs/walk-open.md`](docs/walk-open.md) → WALK-19 → RESULT; do not re-derive it here.**

**✅ IMP-090 proven (step 3).** Our button read **"Subscribe"**, Google's sheet read **"Starting today"** —
they agree, and no trial is promised to an account that cannot have one. ⚠️ **Worth keeping:** "Subscribe"
means the live offering exposes **no free phase at all**, so the old hardcoded *"Start 7-day free trial"*
was never backed by anything the app could reach — wrong in principle, not merely wrong for this buyer.

**✅ IMP-089 proven (step 4a).** "Nothing to restore." → "Try again" **repeated the restore**; Play's
purchase sheet did not open. That is the one that stopped the previous sitting. It also closes **IMP-092's
online half** — a genuine check that finds nothing must still say "Nothing to restore", and it does.

**⬜ IMP-091 NOT observed (step 4c) — inconclusive, not failed, and the distinction is the point.** Play's
no-connection page **has no dismiss control but Back**, and Back closes the **entire paywall**, unmounting
the overlay before the Close button can be seen. **Waiting 30 seconds does not help — Play's page does not
self-dismiss.** So the escape may be working perfectly and be unobservable on this path. **Do not let
"IMP-088 does not work" enter the record; it still has not been tested.**

**🆕 IMP-093 scoped, not fixed** — the paywall unmounts mid-purchase and **`onAbandon` never fires**, so
the app walks away from a purchase it started without asking the store.

**Three things worth carrying that are not obvious from the row:**

1. ✅ **Checked, not assumed: IMP-093 does not lose money.** `useLaunchEntitlementCheck`
   ([`entitlementSync.js:33`](src/billing/entitlementSync.js#L33)) runs on every launch where `plus` is
   false and grants Plus if the store has an entitlement. The cost is a delay and a confusing minute, not
   a stranded subscriber. **Scope IMP-093 accordingly — it is open because it blocks a 🚦 walk row, not
   because it is dangerous.**
2. ⚠️ **The intuitive fix for IMP-093 is wrong and the spec says so.** Making Back a no-op while a flow is
   pending would keep the card alive to be looked at — and re-create the exact IMP-088 trap for the first
   20 seconds, when no exit exists. Back is a *good* exit; the defect is that it exits without
   reconciling, and that the card tells the user not to use it.
3. ⚠️ **This corrects the IMP-088 record.** That was written as *"force-quit was the only way out."*
   **Back was always a way out.** The card's *"Don't close the app"* was talking the user out of the one
   thing that worked — which is arguably the larger share of what IMP-088 was really for, and is now step
   3 of IMP-093.

**Two gaps on step 3 that cannot be closed on this device**, recorded rather than papered over: the
**trial-eligible CTA branch** (needs an account that has not burned its trial — this one has, forever) and
the **onboarding paywall mount** (needs a data clear, which deletes the OTA).

**The exact next step.** ✅ **DONE — IMP-093 landed the same day** (commit `061b1ff`, 1031 green); see the
note above it. Either publish the OTA and re-walk, or take a walk sitting. ⚠️ **WALK-19's aeroplane-mode Restore check ran and was
INCONCLUSIVE** — the cached reply meant IMP-092's `catch` never executed; see the row. **WALK-07, WALK-03
step 4 and WALK-11 are all ready** but need the
**local debug APK**, which cannot coexist with the Play build — swapping means uninstall and a data wipe,
so **export a backup first (that export is WALK-03 step 1).** **Nothing is promoted `internal` →
`production`.**


