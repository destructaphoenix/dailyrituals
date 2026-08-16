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
> | a **runtime walk** | **[WALK-16](docs/walk-open.md)** — device, owner-run. The single highest-value thing open. It is the *only* evidence IMP-076 has. Then WALK-17 in the same sitting. |
> | a **design request** | The Claude Design project is **live** — see "Claude Design is set up" below. |
> | a **build task** | **Nothing is takeable.** IMP-077 unblocks the moment WALK-16 passes. If the owner wants build work sooner, the open scoping debt is the 🔴 WALK-07 Paywall finding, which needs Opus to write a spec first. |
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
> - **WALK-09 (lifetime heatmap) is unblocked and never re-run** — IMP-073 landed; a walk chat can take it.
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
| 001–075 | **Every free-track task, all ✅ except the two rows below.** Search, custody + 30-day trash, multi-moods, Annual Recap, deeper insights, heatmaps, local `dayKey`, prompt packs, a11y labels, the IMP-063…075 polish run, R8, dev harness, backup/restore, reminders. | mixed | ✅ — **full detail per task in [`docs/build-log.md`](docs/build-log.md)**; git is the record. Do not re-derive from this table. |
| 022 | Save as PDF + About sheet (the two dead You-tab buttons) | Build | ⏸ **deferred (owner)** — spec in build-log → "Deferred specs"; **perk #6 gate** |
| 044 | R8 on release builds (dev client was shipping to the public) | Build | 🟢 **code-complete, UNWALKED — rides v1.0.6 / vc12** (bumped 2026-08-16); walk = WALK-12, on hardware, before `internal` → `production` |
| 076 | The app moves to the New Architecture | Build | ✅ code-complete 2026-08-17 · **branch-only, never pushed** (`feat/design-push`) · `assembleRelease` clean, **v1.0.7 / vc13** · walk = WALK-16 + WALK-17 |
| 077 | A motion vocabulary the whole app can speak | Build | ⬜ **blocked on WALK-16** · branch-only, never pushed · walk = WALK-18 |
| 078 | A design system Claude Design can work from | Dev-only | ✅ code-complete 2026-08-17 · **branch-only, never pushed** · 14 cards live in Claude Design project `Daily Rituals Design System` · ⚠️ **night screen baselines NOT captured** (see build-log) |

---

## 🎨 Claude Design is set up — how to use it (IMP-078, 2026-08-17)

**Project: `Daily Rituals Design System`** · id `7bf44d09-f93a-42d2-a8b6-d412d671cf60` · type
`PROJECT_TYPE_DESIGN_SYSTEM`, writable. **26 files / 14 cards are already live**: Tokens (color, type,
shape, elevation) · Frozen (the celestial set) · Motion (contract, primitives) · Components (card, buttons,
progress, chips, nav, plus) · Screens (baseline-day).

**To make a design request, open the Design System pane in Claude Design and ask for ONE screen.**
"Redesign the app" produces mush. The four rules that make output portable:

1. **One screen per request.** First one should be **`PlusPerks`** — 44 lines carrying the entire "what you
   get" pitch, against `YouScreen.js`'s 325. The surfaces that take money are the least designed.
2. **Insist the spec comes back in token names and `motion.js` primitives** — `c.accentSoft`, `t.radius.card`,
   `riseIn`, `DUR.enter`. Not hex, not "gentle fade". The cards are built so it never sees a raw hex.
3. **The sun and rays are frozen.** The Frozen card says so in the project. If a returned design redraws
   them, reject it — that design cannot ship.
4. **It is a *design* request, not an enablement.** `PLUS_ENABLED` stays `false`; `PLUS_PERKS` copy and
   everything under `src/billing/` are untouched by design work.

**Porting the result is a normal build task**: a new `IMP-xxx` scoped by Opus, then a build chat. Claude
Design does not emit React Native — it returns HTML/CSS previews plus a spec.

**To regenerate the cards after a theme change:** `node scripts/gen-design-system.js`, then re-push. The
token/component/frozen cards are generated from `src/theme.js`, `src/data.js` and `src/art.js`, so they
cannot drift — but they do not update themselves.

**Two known gaps, both deliberate and neither blocking:**
- **No night screen baselines.** The app's day/night mode is its own setting (`App.js:40`, header toggle),
  not the OS's, so `cmd uimode night` does nothing — capturing night needs the in-app toggle driven from
  inside `.maestro/store-shots.yaml`. Until then, **night colour lives on the Tokens → Color card**, which is
  complete and generated.
- **No auto-sync.** Pointing the Design System pane's own GitHub connection at `design-system/` would
  re-sync on every `theme.js` change, but that **requires publishing the branch**, which the no-push
  instruction forbids. Owner's call, later.

---

## Open items / blockers

> Only what is **live**. Resolved findings and closed walk debts are in
> [`docs/build-log.md`](docs/build-log.md) → "Resolved findings"; monetization strategy, the subscription
> track and Phase 10b are in [`docs/playbook.md`](docs/playbook.md) → "Monetization strategy".

### ▶️ Owner decisions still open

- **🚦 The `internal` → `production` promotion is still open, and three device walks gate it.**
  v1.0.6 / vc12 (~40 IMP tasks, and the app's first R8 build) reached `internal` on 2026-08-16 — that half is
  **done**; full account in `build-log.md` → Session notes. **REMAINING: install vc12 on hardware →
  WALK-13 → WALK-03 → WALK-12 (R8 last) → promote by hand** (full review, ~7d). vc12 is a *candidate*, not
  the release: if WALK-12 finds R8 stripping something, that is another bump and another build.
  ⚠️ **The repo has since moved to v1.0.7 / vc13** (IMP-076's `bump:native`), so the repo no longer matches
  any built track — a vc13 build is its own decision, separate from promoting vc12.
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

_2026-08-17 (IMP-078 — a design system Claude Design can work from; **branch-only, committed, NOT pushed**)
— **code-complete. `design-system/` is committed and 26 files are live in a new Claude Design project.**
`scripts/gen-design-system.js` (new) emits **14 preview cards** — tokens (color/type/shape/elevation), the
frozen celestial set, six component cards and the day screen baseline — plus 12 PNGs. No app code changed.
**The generator loads the real source rather than mirroring it:** a babel require-hook (JSX +
modules-commonjs, scoped to `src/`) plus stubs that map `react-native-svg` to DOM SVG tags and
`View`/`Animated.View` to `<g>`, so a real component tree renders via `react-dom/server` and rasterises with
`@resvg/resvg-js`. `Animated.Value.interpolate()` returns its first output value — the frame at t=0, which is
what "frozen" means. **The five celestial PNGs are therefore the shipped components, not redraws** (visually
verified: gradient sun disc, cheese-hole moon with haze and stars, 24-spoke fan with amber bloom).
`tokens/color.html` covers **all 8 `SHOP_PALETTES` × both modes**, and **no raw hex is readable anywhere** —
values reach the browser only as CSS custom properties, so every visible label is a token name. Only the two
`motion/` cards are hand-written (they encode rules, not values).
**Pushed — new project `Daily Rituals Design System` (`7bf44d09-f93a-42d2-a8b6-d412d671cf60`)**, created
because `list_projects` returned empty exactly as the spec predicted. Verified
`type: PROJECT_TYPE_DESIGN_SYSTEM`, `canEdit: true`. **Two plans, guardrails first** — frozen + motion
contract (8 files), then the rest (18) — because whatever is in the project at request time is what
constrains output. All 14 previews carry `<!-- @dsCard -->` as line 1.
**⚠️ ONE STEP IS HALF DONE AND IT MATTERS: night screen baselines were NOT captured.** The seven `day-*`
shots are genuine (`npm run shots`, Maestro + adb, `storeShots` scenario). **The app's day/night mode is its
own setting, not the OS's** — `App.js:40` holds `mode`, `App.js:97` loads it from settings, the header toggle
drives it — so `cmd uimode night yes` changes nothing, and the first attempt silently produced a **second set
of day screenshots** (four byte-identical to their day twins). Those were deleted, not shipped. Capturing
night means driving the in-app toggle from inside `.maestro/store-shots.yaml`, which the Play-asset pipeline
also depends on — left for whoever takes it. The baseline card states the gap and points at Tokens → Color,
which does carry every night value.
**Proof:** `npm test` → **867 passed, 84 suites** + 3 zone tests × 2 zones, exit 0 — **unchanged**, which is
exactly what step 9 demands of a spec touching no app code. `npm run shots` also recomposed three committed
`store/play/*.png` listing assets as a side effect; **reverted** — a dev-only spec should not edit shipped
store assets. **Steady state noted, deliberately not done:** pointing the Design System pane's own GitHub
connection at `design-system/` needs the branch published, so it waits on the owner.
**NEXT: the queue is empty for a build chat.** IMP-077 is the only open spec and is **blocked on WALK-16**.
The useful next moves are **[WALK-16](docs/walk-open.md) on a device**, or the owner's **first design request
— `PlusPerks`** (one screen per request; `PLUS_ENABLED` stays `false`)._

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
