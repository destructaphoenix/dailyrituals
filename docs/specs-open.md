# Open IMP specs — the build queue

> **What this file is.** The full spec for every **open** `IMP-xxx` task. [`PROGRESS.md`](../PROGRESS.md) keeps the
> backlog table, the live blockers and the two newest session notes; it points here for the spec body.
> Finished specs move to [`docs/build-log.md`](build-log.md). Git is the full record.
>
> **How Sonnet uses this file — read ONE spec, not the file.** `PROGRESS.md`'s backlog table names the
> first unchecked task and links to its heading here. **Open that heading only.** Every other spec in this
> file is for a different chat and reading it is wasted context.
>
> **These specs are the design.** Opus decided every open question in them — file paths, function
> signatures, copy strings, the free/Plus line. Execute the Steps in order. **Do not redesign, do not
> re-litigate a "why", and do not improve the scope.** If a step turns out to be impossible or the code
> contradicts the spec, **STOP** and log it to `PROGRESS.md` → Open items rather than inventing a fix.
>
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **866 passed, 84 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane | From |
| --- | --- | --- | --- |
| 1 | [IMP-076 — the app moves to the New Architecture](#imp-076--the-app-moves-to-the-new-architecture) | **Build** | owner, 2026-08-17 |
| 2 | [IMP-077 — a motion vocabulary the whole app can speak](#imp-077--a-motion-vocabulary-the-whole-app-can-speak) | **Build** | owner, 2026-08-17 |
| 3 | [IMP-078 — a design system Claude Design can work from](#imp-078--a-design-system-claude-design-can-work-from) | Dev-only | owner, 2026-08-17 |

> ### 🔒 ALL THREE ARE BRANCH-ONLY — `feat/design-push`, never pushed
>
> Owner instruction, 2026-08-17: **none of this work reaches GitHub.** For every one of these specs:
> **never `git push`** (the branch is created with no upstream so a bare push fails — do not set one),
> **never add a `Release-Lane:` trailer**, and **do not merge to `main`.** Merging is a separate owner
> decision taken after the walks pass. This replaces the usual "commit with the exact message, no
> trailer = not shipped" ending: here, not-shipped also means not-pushed.

> **Design source of truth:** all three are scoped from
> [`docs/superpowers/specs/2026-08-16-motion-and-design-system-design.md`](superpowers/specs/2026-08-16-motion-and-design-system-design.md).
> **Read that document before starting any of them** — it carries the *why* (the expired IMP-027 hold,
> the dependency audit, the frozen-sun rule) that these Steps assume and do not repeat.

> **Take them in order, and IMP-077 has a hard gate.** IMP-077 must not start until **WALK-16 has
> passed** — Reanimated 4 cannot run on Legacy Architecture, so IMP-077 on an unproven IMP-076 is
> unverifiable. **IMP-078 depends on neither** and may be taken first, last, or concurrently; it
> touches no app code at all.

> **IMP-057 is still deliberately absent.** It is reserved for the historical `dayKey` migration IMP-056
> deferred, and it cannot be written until a real device's numbers come back from the dev-panel Inspector's
> "Data health" reporter IMP-056 added. **Do not reuse the number.**

> **Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
> runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
> the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
> build chat**, and do not read a missing walk as an unfinished spec. IMP-076 in particular is
> **code-complete at green tests plus a clean native build** — its correctness is settled by WALK-16, not
> by this chat.

---

### IMP-076 — the app moves to the New Architecture

**Lane:** Build · **Branch:** `feat/design-push`, never pushed · **Origin:** owner, 2026-08-17.

**Why now — the hold expired, it was never a rejection.** `newArchEnabled: false` is set in two places
with standing comments ([`app.config.js:36`](../app.config.js#L36),
[`android/gradle.properties:38`](../android/gradle.properties#L38)). IMP-027's stated reason was *"API 36
compliance needs no New Arch, and migrating both at once against the Aug-31 deadline is unnecessary
risk."* **That deadline was met on 2026-07-30** — `build-log.md` records v1.0.3 / versionCode 9 in
production on `targetSdkVersion 36`, "a month ahead of the 2026-08-31 deadline." The migration was
deferred because it was *coupled* to a deadline; the coupling is gone. SDK 55 removes Legacy
Architecture outright, so this is forced work either way — the only question is whose schedule it
happens on.

**Why it is tractable — the audit is already done.** `react-native-svg` (15.12.1), `async-storage`
(2.2.0) and `safe-area-context` (5.6.2) all ship `codegenConfig` and New Arch sourcesets; every `expo-*`
module is on SDK 54, where New Arch is the **default** and therefore the best-tested path. **The only
soft spot is RevenueCat** — `react-native-purchases` and `-ui` (10.5.0) are legacy bridge modules with no
`codegenConfig`, and `-ui` is a legacy *view* component, the fragile case, used at exactly one call site
([`RitualsApp.js:253`](../src/RitualsApp.js#L253)).

**And the soft spot is dormant, which is why the ordering is this way.**
[`PLUS_ENABLED = false`](../src/billing/config.js#L39) — the paywall does not mount and
`presentCustomerCenter()` is unreachable. The one dependency that could break this migration is switched
off in the build the migration has to prove. **Do not change `PLUS_ENABLED` in this spec or the next
two.** Re-enabling Plus means testing RevenueCat under New Arch, which is its own task on its own
evidence (and re-opens `WALK-11`).

**Steps**

1. **Flip both flags, and rewrite the comments to record why the hold ended.**
   [`app.config.js:36`](../app.config.js#L36) → `newArchEnabled: true`;
   [`android/gradle.properties:38`](../android/gradle.properties#L38) → `newArchEnabled=true`.
   The existing comments explain a decision that no longer applies — replace them, do not delete them.
   The new comment must name **the shipped API-36 build (v1.0.3 / vc9, 2026-07-30)** as the reason the
   IMP-027 hold ended, so the next reader sees a superseded decision rather than a silent reversal.
2. **Expect [`scripts/patch-permissions.js`](../scripts/patch-permissions.js) to fire, and do not
   soften it.** It rewrites `expo-modules-core/…/adapters/react/permissions/PermissionsService.kt` —
   the **legacy bridge adapter** path. If New Arch routes permissions elsewhere the patch finds no
   match and, by deliberate IMP-027 design, **exits non-zero rather than no-opping**, failing
   `npm install` loudly. That is correct behaviour. **Do not make the script tolerant.** If it fires:
   re-verify the upstream `requestedPermissions!!` bug against a **pristine `expo-modules-core` tarball**
   (not the installed copy — the installed copy is what the script rewrites, so it cannot answer the
   question) on the New Arch path, then re-target or retire the patch **on that evidence**, and record
   which in the session note.
3. **Full native Android build.** `npx expo export --platform android` is **not** sufficient proof for
   this spec — it exercises the JS bundle, not the native runtime that just changed. A real build must
   succeed.
4. `npm test` green, **≥ 867 passed, 84 suites** ([`PROGRESS.md:105`](../PROGRESS.md)), plus the zone
   suites. Run **`npm test`**, not bare `npx jest`, or the zone half is skipped.
5. **`npm run bump:native`** — native change, so `version` bumps (this is what scopes OTA to compatible
   builds; see the update-workflow rules in `build-log.md`).
6. **Runtime proof: [WALK-16](walk-open.md).** Do not run it from this chat. **This spec is
   code-complete at steps 3–5**; WALK-16 decides whether the migration survives.

**Rollback is one line each way.** Both flags back to `false`, rebuild. This spec deliberately changes
**no app code at all** — that is what keeps it revertible, and it is why it must land before any design
work stacks on top of it.

**Commit:** `build(arch): the app moves to the New Architecture (IMP-076)` — **no `Release-Lane` trailer,
and do not push.**

---

### IMP-077 — a motion vocabulary the whole app can speak

**Lane:** Build · **Branch:** `feat/design-push`, never pushed · **Origin:** owner, 2026-08-17.

**🚦 GATE: do not start this until [WALK-16](walk-open.md) has passed.** Reanimated 4 is New
Architecture-only. On an unproven IMP-076 this spec cannot be verified, and a green test run would be
actively misleading (see step 3).

**Why.** Outside `src/art.js` the app barely moves: `Animated` appears in only four files
([`ui.js`](../src/ui.js), [`art.js`](../src/art.js),
[`Celebration.js`](../src/screens/Celebration.js), [`Toast.js`](../src/screens/Toast.js)), and the tab
switch at [`RitualsApp.js:672`](../src/RitualsApp.js#L672) is an instant swap with no transition at all.
This spec does not add animations to screens — **it builds the vocabulary that later per-screen IMPs and
every Claude Design spec will be written in.** One named primitive set, one place.

**Steps**

1. **Install via `npx expo install`, not bare `npm install`** — `react-native-reanimated@~4.1.1` and
   `react-native-worklets@0.5.1`, both Expo SDK 54's own bundled recommendations
   (`node_modules/expo/bundledNativeModules.json`).
2. **Do not touch [`babel.config.js`](../babel.config.js).** `babel-preset-expo` auto-injects the
   worklets plugin when `react-native-worklets` is present, and prefers it over the Reanimated plugin
   (`node_modules/babel-preset-expo/build/index.js:286-289`). Adding either by hand risks
   double-application. The file stays exactly as it is.
3. **Jest** — add to [`jest.setup.js`](../jest.setup.js):
   `jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));`
   and add `react-native-reanimated` to the `transformIgnorePatterns` allowlist in
   [`package.json`](../package.json)'s jest block, beside the existing entries.
   ⚠️ **Write a comment there saying the mock no-ops every hook, so a green suite proves the screens
   still render and proves nothing whatsoever about the native side.** That is exactly the trap this
   spec's gate exists for.
4. **New `src/motion.js`** — pure presentation. **No imports from `persistence/`, `billing/`,
   `gamify.js` or `insights/`**, and it owns no state. Durations and curves are lifted from what already
   reads well: [`Celebration.js`](../src/screens/Celebration.js) — a spring pop into
   `Animated.stagger(150, …)` over scale and opacity — is the house feel. Generalize it; do not invent a
   new one. Exports:
   - `DUR` = `{ tap: 120, enter: 320, settle: 480, celebrate: 900 }`
   - `EASE` — named curves plus one spring config matching Celebration's
   - `riseIn(delay)` — fade + 12dp translateY. The default entrance for cards and rows.
   - `popIn(delay)` — scale 0.85→1 spring. Rewards, badges, orbs.
   - `fadeOut()` — plain opacity. Dismissals.
   - `stagger(i, step = 60)` — delay for list index `i`.
   - `usePressScale()` — shared press feedback.
   - `useCountUp(value)` — animates a number toward `value`.
   - `ScreenFade` — see step 6.
5. **`PrimaryButton` adopts `usePressScale()`**, replacing its local press spring
   ([`ui.js:83-85`](../src/ui.js#L83-L85)). **`ProgressBar`'s shimmer is not touched** — it works, it is
   native-driven, and the regression risk buys nothing.
6. **`ScreenFade` wraps the screen container** at [`RitualsApp.js:754`](../src/RitualsApp.js#L754) —
   cross-fade plus an 8dp translateY settle at `DUR.enter`, keyed on the active tab so a change remounts
   the animation. **No routing change, no state change, no navigation library.** The ~12
   `<Modal animationType="slide">` instances stay exactly as they are; OS modal presentation is correct
   for sheets.
7. **Coexistence is the rule, not a compromise.** [`src/art.js`](../src/art.js) is **frozen** (see step
   8). `Celebration.js` and `Toast.js` **stay on `Animated`** — rewriting working choreography buys
   nothing. New motion uses `motion.js`; old motion is left alone.
8. **🔒 `src/art.js` is read-only for this entire effort.** `RayFan`, `NightSky`, `NightRays`, `BigSun`,
   `BigMoon` are the app's signature and the owner's explicit constraint. Not ported to Reanimated, not
   restyled, not re-timed. **No exceptions.**
9. **Tests** — a `__tests__/motion.test.js` covering the pure surface: `DUR`/`EASE` shapes,
   `stagger(i, step)` arithmetic, and `motion.js` importing nothing from the four forbidden directories
   (a source assertion, in the style of IMP-074's).
10. `npm test` green, **≥ the count IMP-076 left**, plus the zone suites. `npx expo export --platform
    android` clean. **`npm run bump:native`** — native dep.
11. **Runtime proof: [WALK-18](walk-open.md).** Not from this chat.

**Commit:** `feat(motion): a motion vocabulary the whole app can speak (IMP-077)` — **no `Release-Lane`
trailer, and do not push.**

---

### IMP-078 — a design system Claude Design can work from

**Lane:** Dev-only (**no app code changes at all**) · **Branch:** `feat/design-push`, never pushed ·
**Origin:** owner, 2026-08-17.

**No gate — this depends on neither IMP-076 nor IMP-077** and may be taken first, last or concurrently.

**Why, and what the failure mode is.** Claude Design does **not** emit React Native; a design-system
project is HTML/CSS previews plus specs. Given only a description it produces a beautiful *different
app* — output that cannot be ported. Everything below exists to constrain it toward output portable in
an afternoon. **The two highest-value files are the frozen-sun card and the motion contract**, and both
must exist **before the first design request** — whatever is in the project at request time is what
constrains the output, and guardrails added afterward do not retroactively fix an already-generated
design.

**Steps**

1. **New `scripts/gen-design-system.js`** — imports `makeTheme()` from [`theme.js`](../src/theme.js) and
   generates `design-system/tokens/{color,type,shape,elevation}.html` across `mode: day | night` × the
   shipped accent sets. **Generated, never hand-written** — hand-copied hex drifts the first time the
   accent palette changes. **Render every swatch labelled with its token name (`c.accentSoft`), never a
   raw hex.** Claude Design will only return specs in token names if it never sees a hex.
2. **`design-system/frozen/celestial.html`** — `BigSun`, `RayFan`, `NightSky`, `NightRays`, `BigMoon` as
   static PNGs exported from the real components, captioned verbatim:
   > **FROZEN — reference only.** These are the app's signature. Compose around them. Never redraw,
   > restyle, recolor, or re-time them. Designs may position them, size them, and animate their
   > *container* (opacity, translate, scale) — nothing inside.

   **This is the single highest-value card in the project.** Without a *visual*, Claude Design redesigns
   the sun and every downstream screen spec inherits a sun that cannot ship.
3. **`design-system/motion/contract.html`** — the hard rules, verbatim from §6 of the design doc: only
   `opacity`/`translateX,Y`/`scale`/`rotate` animate; every motion names a `src/motion.js` primitive;
   numbers not vibes (ms, dp, named easing); durations from `DUR`; nothing loops except the existing
   `ProgressBar` shimmer; every entrance degrades to a cross-fade under reduced-motion.
   **`motion/primitives.html`** sits beside it as a runnable CSS approximation of each `motion.js`
   export, so the house feel can be *seen* rather than inferred. (Writable before IMP-077 lands — the
   primitive list is specified there and in the design doc.)
4. **`design-system/components/*.html`** — `card` (incl. the night-v2 `CARD_SHEEN` top strip),
   `buttons`, `progress`, `chips`, `nav`, `plus`. Mirror [`ui.js`](../src/ui.js),
   [`shopui.js`](../src/shopui.js) and the nav at [`RitualsApp.js:757`](../src/RitualsApp.js#L757).
5. **`design-system/screens/baseline-*.html`** — real screenshots in both themes, captured via the
   existing `npm run shots` path ([`scripts/shots.sh`](../scripts/shots.sh), Maestro + adb). Designing
   *from* the current screens rather than from prose is the biggest single lever on whether output reads
   as the next version of Daily Rituals or as a generic wellness app.
6. **Every preview's first line must be `<!-- @dsCard group="…" -->`.** That marker is what the Design
   System pane compiles into `_ds_manifest.json`. **A preview without it produces no card.** Do not
   hand-edit `_ds_manifest.json`.
7. **Push.** The owner's existing GitHub connection to this repo is a **regular project**; project type
   is immutable at creation, so it cannot become a design system (`list_projects`, filtered to writable
   design-system projects, returned empty on 2026-08-16). Use `DesignSync`: `create_project` →
   `finalize_plan` → `write_files`. **Push the frozen card and the motion contract first.**
   ⚠️ **`design-system/` is the only thing that goes to Claude Design. This does not push the repo to
   GitHub and does not change the branch discipline above.**
8. **Steady state, owner's call, not this chat's:** once `design-system/` is committed, the Design System
   pane's own GitHub connection can be pointed at that folder so it re-syncs when `theme.js` changes.
   **That requires publishing the branch, so it does not happen while the no-push instruction stands.**
   Note it in the session note as an option the owner can take later.
9. **No test gate** — this spec changes no app code, so `npm test` must simply be **unchanged**, not
   improved. If the count moves, something was touched that should not have been.

**Done when** the Design System pane shows every card above, the frozen card renders the real sun, and a
first design request returns a spec written in **token names and `motion.js` primitives**.

**First design request, once it is live:** **`PlusPerks`** — 44 lines carrying the entire "what you get"
pitch, against `YouScreen.js`'s 325. The surfaces that take money are the least designed in the product.
**One screen per request**; "redesign the app" produces mush. And this is a *design* request only —
`PLUS_ENABLED` stays `false`, `PLUS_PERKS` copy and everything under `src/billing/` are untouched.

**Commit:** `docs(design): a design system Claude Design can work from (IMP-078)` — **no `Release-Lane`
trailer, and do not push.**
