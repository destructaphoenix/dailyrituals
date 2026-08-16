# Design — New Architecture + motion substrate + Claude Design design system

**Date:** 2026-08-16
**Status:** Approved (owner) — ready for implementation plan
**Track:** Improvements backlog (next three `IMP-xxx`). Foundation for the animation/Plus design push.

> **Revision (2026-08-16, same session).** An earlier draft of this spec targeted Reanimated
> **3.19.5** on Legacy Architecture, to avoid colliding with IMP-027's `newArchEnabled: false`.
> That draft was wrong: **IMP-027's hold has expired** (§2.1). This revision migrates to New
> Architecture and targets Reanimated **4**, Expo SDK 54's recommended pairing.

---

## 0. Context: what this is for

The owner's read of the app: outside the sun and its rays, it is visually static. Too few
animations, no screen transitions, and the Plus surfaces are the least designed part of the
product. The fix is a design push driven by **Claude Design** (`claude.ai/design`).

Claude Design does **not** emit React Native. A design-system project is HTML/CSS component
previews plus specs. The loop is:

1. Push a design system that mirrors *this app's* vocabulary.
2. Claude Design designs new screens and motion **in that vocabulary**.
3. Port the spec to RN by hand.

That third step is where a weak design system costs us: given only a description, Claude Design
produces a beautiful *different app* — output we cannot ship. Everything in §4–§7 exists to
constrain it toward output we can port in an afternoon.

**Two owner constraints, both load-bearing:**

1. **The sun and the rays are untouchable.** `RayFan`, `NightSky`, `NightRays`, `BigSun`,
   `BigMoon` in `src/art.js` are frozen. Designs compose *around* them; they are never redrawn,
   restyled, or "improved."
2. **No backend rewiring.** Nothing in this spec changes `src/persistence/`, `src/billing/`,
   `src/gamify.js`, `src/insights/`, or any data shape. Phase A touches native build config, not
   app logic; Phases B and C are presentation and motion only.

---

## 1. Goal & scope

Three phases, three separate `IMP-xxx` tasks:

| Phase | IMP | What | Lane |
| --- | --- | --- | --- |
| **A** | IMP-076 | New Architecture migration | **BUILD** |
| **B** | IMP-077 | Motion substrate — Reanimated 4 + `src/motion.js` | **BUILD** |
| **C** | IMP-078 | Design system — `design-system/` → Claude Design | **none** (no app change) |

### 1.1 Branch and publication discipline — owner instruction, 2026-08-17

**All three phases live on `feat/design-push`. Nothing is pushed to GitHub.** This is an explicit
owner constraint on the whole effort, not a default, and it holds until the owner lifts it.

Three mechanical consequences, all of which must stay true:

- **Never `git push`** on this branch. It is created with **no upstream**, so a bare `git push`
  fails rather than publishing — do not "fix" that by setting one.
- **Never add a `Release-Lane:` trailer** to any commit here. `.github/workflows/release.yml`
  triggers on `push: branches: [main]` and ships on that trailer. Both guards must fail closed.
- **Do not merge to `main`** as part of any of these three IMPs. Merging is a separate, explicit
  owner decision taken after the walks pass.

**C does not depend on A or B.** It touches no app code — it reads `src/theme.js` and writes HTML.
The only coupling is §6's primitive list, and every primitive this spec names (`useSharedValue`,
`useAnimatedStyle`, `withTiming`, `withSpring`, `entering`/`exiting`/`Layout`) exists in both
Reanimated 3 and 4. The motion contract is written once and survives whatever Phase A concludes —
including a full rollback to bare `Animated`. So C may be taken **first, last, or concurrently**;
it is sequenced third only because A is the riskier work and deserves the fresher context.

**B is unverifiable without A.** Reanimated 4 will not run on Legacy Arch at all, so there is no
meaningful intermediate state — B starts only once A's walk (WALK-16) has passed.

**Out of scope — deliberately:**

- Any redesign of Home, Insights, Archive, or You. Those come *later*, as their own IMPs, from
  Claude Design's output. This spec builds the machine, not the screens.
- Anything inside `src/art.js`. Frozen (see §4).
- React Navigation. The hand-rolled `screen()` switch stays; §3.4 animates it in place.
- Re-enabling `PLUS_ENABLED`. It stays `false` through all three phases (§2.3).

---

## 2. Phase A — New Architecture

### 2.1 Why now: the hold has expired

`newArchEnabled: false` is set in two places with standing comments — `app.config.js:36` and
`android/gradle.properties:38`. The stated reason (IMP-027):

> API 36 compliance needs no New Arch, and migrating both at once against the Aug-31 deadline is
> unnecessary risk.

**That deadline was met on 2026-07-30.** `docs/build-log.md` records v1.0.3 / versionCode 9
submitted to production, with `targetSdkVersion 36` — "API-36 compliance is met a month ahead of
the 2026-08-31 deadline." The migration was never rejected on its merits; it was deferred because
it was *coupled* to a deadline. The coupling is gone, and the deferral quietly outlived its reason
by three weeks.

Two further facts make now the right moment rather than merely an acceptable one:

- **SDK 55 removes Legacy Architecture entirely.** This is forced work, not optional work. The
  only open question is whether it happens on our schedule or the SDK's.
- **The "safe" alternative was not verified-safe.** Reanimated 3.19.5's peer deps are wildcards
  (`react-native: *`), so nothing vouches for it on RN 0.81.5 — npm simply has no opinion. Pinning
  it would have traded a *known, forced* migration for an *unknown* compatibility bet, and thrown
  the resulting animation code away at SDK 55 regardless.

### 2.2 Dependency audit — done, and it is the reason this is tractable

Every native dep, as installed:

| Package | Version | New Arch | Evidence |
| --- | --- | --- | --- |
| `react-native-svg` | 15.12.1 | ✅ | `codegenConfig` present; `paper` + Fabric sourcesets |
| `@react-native-async-storage/async-storage` | 2.2.0 | ✅ | `codegenConfig` present; `oldarch` sourceset |
| `react-native-safe-area-context` | 5.6.2 | ✅ | `codegenConfig` present; `fabric` + `paper` sourcesets |
| all `expo-*` | SDK 54 | ✅ | New Arch is SDK 54's **default** — this is the well-trodden path |
| `react-native-purchases` | 10.5.0 | ⚠️ interop | No `codegenConfig`; `main` sourceset only |
| `react-native-purchases-ui` | 10.5.0 | ⚠️ interop | Legacy **view** component |

The three RN community libs are fully migrated. The Expo modules are on the configuration Expo
itself ships by default, which is the best-tested combination available.

**RevenueCat is the only soft spot.** Both packages are legacy bridge modules. Legacy *modules*
run on New Arch through the interop layer (default-on since RN 0.74) and are low-risk; legacy
*view managers* are the fragile case, and `react-native-purchases-ui` is one — used at exactly one
call site, `RitualsApp.js:253`, for `presentCustomerCenter()`.

### 2.3 Why the soft spot is currently harmless

`PLUS_ENABLED = false` (`src/billing/config.js:39`). The shipping build carries no payment
surface: the paywall does not mount, and `presentCustomerCenter()` is unreachable. **The one dep
that could break the migration is dormant in the build the migration has to prove.**

That is a genuinely fortunate ordering, and this spec exploits it deliberately: migrate while the
risky surface is switched off. **`PLUS_ENABLED` stays `false` for all three phases.** When Plus is
eventually re-enabled, RevenueCat under New Arch becomes a first-class test item on its own — it
does not ride in on this work.

### 2.4 The migration

1. `app.config.js:36` → `newArchEnabled: true`. Update the surrounding comment to record *why*
   the hold ended (the shipped API-36 build), not merely that it did.
2. `android/gradle.properties:38` → `newArchEnabled=true`.
3. Full native rebuild. This is not an `expo export` check — it is a real Android build.
4. `npm run bump:native`.

**Landmine — `scripts/patch-permissions.js`.** The postinstall patch rewrites
`expo-modules-core/android/src/main/java/expo/modules/adapters/react/permissions/PermissionsService.kt`.
That path is the **legacy bridge adapter**. If New Arch routes permissions elsewhere, the patch
finds no match — and by deliberate design (IMP-027) it then **exits non-zero rather than
no-opping**, so `npm install` fails loudly. That is the correct behaviour and it must not be
"fixed" by making the script tolerant. If it fires, re-verify the upstream bug against a pristine
`expo-modules-core` tarball on the New Arch path and re-target or retire the patch on the
evidence. The file's own header already says: *re-verify on every SDK bump.*

**Rollback.** Both flags back to `false`, rebuild. Phase A changes no app code, which is exactly
what makes it revertible — and why it is worth doing before any design work lands on top of it.

---

## 3. Phase B — the motion substrate

### 3.1 Install

```
react-native-reanimated  ~4.1.1
react-native-worklets     0.5.1
```

Both are Expo SDK 54's own bundled recommendations
(`node_modules/expo/bundledNativeModules.json`) — use `npx expo install`, not bare `npm install`.

**Do not touch `babel.config.js`.** `babel-preset-expo` auto-injects the worklets plugin when
`react-native-worklets` is installed, and prefers it over the Reanimated plugin
(`node_modules/babel-preset-expo/build/index.js:286-289`). Adding either by hand risks
double-application. The config stays exactly as it is.

Jest needs one line in `jest.setup.js`:

```js
// Reanimated ships its own Jest mock — every hook resolves to a no-op so screens
// using motion primitives still render in the jsdom environment.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
```

…and `react-native-reanimated` added to the `transformIgnorePatterns` allowlist in
`package.json`'s jest block, alongside the existing entries.

⚠️ **The mock no-ops every hook, so the suite passes whether or not the native side initialises.**
Green tests are not evidence here. See §8.

### 3.2 `src/motion.js` — the vocabulary

One new file. Pure presentation, no state, no imports from `persistence/`, `billing/`, or
`gamify.js`. It exports the **named** primitives that both the app and the design system use, so a
Claude Design spec reading "enter with `riseIn`, stagger 60ms" maps to one call.

Durations and curves are lifted from what already reads well: `src/screens/Celebration.js` is the
reference — a spring pop into `Animated.stagger(150, …)` over scale and opacity. That is the house
motion feel. `motion.js` generalizes it rather than inventing a new one.

| Export | Kind | Purpose |
| --- | --- | --- |
| `DUR` | tokens | `{ tap: 120, enter: 320, settle: 480, celebrate: 900 }` |
| `EASE` | tokens | Named curves; one spring config matching Celebration |
| `riseIn(delay)` | entering | Fade + 12dp translateY. Default entrance for cards and rows. |
| `popIn(delay)` | entering | Scale 0.85→1 spring. Rewards, badges, orbs. |
| `fadeOut()` | exiting | Plain opacity. Dismissals. |
| `stagger(i, step)` | helper | Delay for list index `i`. Default `step: 60`. |
| `usePressScale()` | hook | Shared press feedback; replaces the local copy in `ui.js`. |
| `useCountUp(value)` | hook | Animates a number toward `value`. Streaks, XP, "days remembered". |
| `ScreenFade` | component | See §3.4. |

`PrimaryButton` currently rolls its own press spring (`src/ui.js:83-85`); it moves to
`usePressScale()`. **`ProgressBar`'s shimmer stays exactly as it is** — it works, it is
native-driven, and it is not worth the regression risk.

### 3.3 Migration discipline

Reanimated 4 does **not** replace RN's `Animated` wholesale, and this phase does not attempt that.
`src/art.js` keeps its existing `Animated` code untouched (§4). `Celebration.js` and `Toast.js`
also stay on `Animated` — they work, and rewriting working choreography buys nothing. New motion
uses `motion.js`; old motion is left alone. The two coexist.

### 3.4 Screen transitions

Today the tab switch is an instant swap: `screen()` at `src/RitualsApp.js:672`, rendered into a
`<View>` at `:754`. There is no navigation library and this spec does not add one.

`ScreenFade` wraps that view and animates on tab change — cross-fade plus an 8dp translateY
settle, `DUR.enter`, keyed on the active tab so a change remounts the animation. Roughly 15 lines
at the call site. No routing change, no state change.

The ~12 `<Modal animationType="slide">` instances stay. OS modal presentation is correct for
sheets, and replacing it with a custom presenter is a far larger change than the result justifies.

---

## 4. The frozen zone

`src/art.js` is **read-only for this entire effort.** No exceptions, including Phase B — it is not
ported to Reanimated.

The design system carries a card, `frozen/celestial.html`, rendering `BigSun`, `RayFan`,
`NightSky`, `NightRays`, and `BigMoon` as static PNGs exported from the real components, captioned:

> **FROZEN — reference only.** These are the app's signature. Compose around them. Never redraw,
> restyle, recolor, or re-time them. Designs may position them, size them, and animate their
> *container* (opacity, translate, scale) — nothing inside.

This card is the highest-value item in the project. Without a *visual*, Claude Design will
helpfully redesign the sun, and every downstream screen spec inherits a sun we cannot ship.

---

## 5. Phase C — `design-system/` layout

Lives in the repo at `design-system/`, committed. It is a build artifact of `src/theme.js` plus
hand-written HTML previews. **Runs on `main`, in parallel with Phase A.**

```
design-system/
  _ds_manifest.json          generated by the self-check; do not hand-edit
  tokens/
    color.html               all three palettes x the shipped accent sets
    type.html                display/body ramp, real Google fonts
    shape.html               radius scale at roundness 0.6 / 1.0 / 1.4
    elevation.html           shadow() output, day + night
  motion/
    contract.html            §6 — the hard constraints
    primitives.html          live demos of every src/motion.js export
  components/
    card.html                Card, incl. the night-v2 CARD_SHEEN top strip
    buttons.html             PrimaryButton, GhostButton, IconBtn
    progress.html            ProgressBar with shimmer
    chips.html               mood chips, milestone pill, ember pill
    nav.html                 bottom nav, 4 tabs + centre FAB
    plus.html                PlusBanner, PalTag, SkyPreview
  frozen/
    celestial.html           §4 — the untouchable set
  screens/
    baseline-*.html          current screenshots, day + night
```

Every preview's **first line** must be `<!-- @dsCard group="…" -->` — that marker is what the
Design System pane compiles into `_ds_manifest.json`. A preview without it produces no card.

### 5.1 Tokens are generated, never hand-written

`scripts/gen-design-system.js` imports `makeTheme()` from `src/theme.js` and emits the four
`tokens/*.html` files. Hand-copied hex values drift the first time the accent palette changes;
generated ones cannot. The script runs `makeTheme` across `mode: day | night` × the shipped accent
sets and renders every resulting token as a labelled swatch **with its token name** —
`c.accentSoft`, not `#fef3c7`. Claude Design must return specs in token names, and it will only do
that if it never sees a raw hex.

### 5.2 Baselines are real screenshots

`npm run shots` (`scripts/shots.sh`, Maestro + adb) already produces the Play screenshot set.
Reuse that path to capture baselines in both themes and embed them in `screens/baseline-*.html`.
Designing *from* the current screens rather than from prose is the single biggest lever on whether
output reads as the next version of Daily Rituals or as a generic wellness app.

---

## 6. The motion contract (`motion/contract.html`)

The card that decides whether output is portable. Hard rules:

1. **Only these properties animate:** `opacity`, `translateX/Y`, `scale`, `rotate`. Anything
   else — `background-color`, `width`, `height`, `blur`, `box-shadow`, `background-position` — is
   **off-budget** and will be rejected. (Reanimated *can* interpolate color on the UI thread; it is
   still excluded, because the app's surfaces are token-driven and animated color fights the theme
   system.)
2. **Every motion must name a `src/motion.js` primitive.** A spec that invents a new curve must say
   so explicitly and justify it.
3. **Numbers, not vibes.** Duration in ms, delay in ms, offset in dp, easing named from `EASE`.
   "Gentle fade" is not a spec.
4. **Durations come from `DUR`.** Off-ladder values need justification.
5. **Nothing loops indefinitely** except the existing `ProgressBar` shimmer. This is a journalling
   app opened once a day; ambient perpetual motion reads as noise and costs battery.
6. **Respect reduced-motion.** Every entrance degrades to a plain cross-fade.

`motion/primitives.html` sits beside it as the live demo — each export as a runnable CSS
approximation, so Claude Design can *see* the house feel rather than infer it from a table.

---

## 7. Pushing to Claude Design

The owner has an existing GitHub connection to this repo, but it is a **regular project**. Project
type is immutable at creation, so it cannot become a design system, and `list_projects` (filtered
to writable design-system projects) confirms none exists yet.

**Bootstrap:** `create_project` → `finalize_plan` → `write_files` from `design-system/`.

**Steady state:** once `design-system/` is committed, switch on the Design System pane's own GitHub
connection pointed at that folder. It then re-syncs whenever `theme.js` changes, closing the drift
problem for good. Same files either way — the push is not wasted work.

**Order matters.** Push §4 (frozen) and §6 (motion contract) **before** the first design request.
Whatever is in the project at request time is what constrains the output; guardrails added
afterward do not retroactively fix an already-generated design.

---

## 8. Verification

**Phases A + B** — `npm test` green and **≥ 867 passed, 84 suites** (baseline, `PROGRESS.md:105`),
plus the zone suites. `npx expo export --platform android` clean. `npm run bump:native`.

**Tests are necessary and nowhere near sufficient.** Phase A changes the native runtime and Phase
B's Jest mock no-ops every Reanimated hook — the suite would stay green through a build that
redboxes on launch. The real gates are device walks. For `docs/walk-open.md`:

- **WALK-xx (device) — New Arch cold start.** App launches on New Arch, no redbox. Then exercise
  every native surface: notifications (`expo-notifications`), backup export/import
  (`expo-file-system` + `expo-sharing` + `expo-document-picker`), SVG rendering
  (`react-native-svg` — the sun and every icon), safe-area insets, and Android Auto Backup
  restore. **This is the Phase A gate.** If it fails, both flags revert to `false` and Phase B
  falls back to bare `Animated` — the design work is not blocked either way.
- **WALK-xx (device) — edge-to-edge, again.** Android 16 forces edge-to-edge and New Arch changes
  the layout path. Re-run the IMP-027 audit; do not assume it carries over.
- **WALK-xx (device) — motion.** Tab transitions and card entrances are smooth on a mid-range
  Android, and the sun and rays are visually unchanged in both themes.

**Phase C** — no app change, so no test gate. Done when the Design System pane shows every card in
§5, the frozen card renders the real sun, and a first request returns a spec written in token names
and `motion.js` primitives.

---

## 9. Where Plus fits

Not designed here — but this is why the foundation is worth building. The Plus surfaces are the
thinnest in the app:

| Screen | Lines | State |
| --- | --- | --- |
| `PlusPerks.js` | 44 | A bulleted list in one `Card`. This is the whole "what you get" pitch. |
| `GetEmbers.js` | 63 | Minimal. |
| `Paywall.js` | 117 | The purchase moment. |
| `PlusFlow.js` | 294 | Manage-subscription; functional. |

For contrast, `YouScreen.js` is 325 lines and `InsightsScreen.js` 315. **The surfaces that take
money are the least designed in the product.** Once §7 is live, Plus is the first design request —
one screen per request, `PlusPerks` first, because it has the most room to gain and the least to
break.

Every Plus redesign is presentation-only: `PLUS_PERKS` copy in `src/data.js`, the entitlement
state, and everything in `src/billing/` stay exactly as they are. Note the ordering constraint from
§2.3: **`PLUS_ENABLED` stays `false` through all three phases.** Designing the Plus screens does
not require enabling them, and re-enabling Plus means testing RevenueCat under New Arch — its own
task, on its own evidence.
