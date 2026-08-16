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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **867 passed, 84 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane | From |
| --- | --- | --- | --- |
| 1 | [IMP-077 — a motion vocabulary the whole app can speak](#imp-077--a-motion-vocabulary-the-whole-app-can-speak) | **Build** | owner, 2026-08-17 |
| 2 | [IMP-078 — a design system Claude Design can work from](#imp-078--a-design-system-claude-design-can-work-from) | Dev-only | owner, 2026-08-17 |

> **IMP-076 is ✅ code-complete (2026-08-17)** — spec archived to
> [`build-log.md`](build-log.md). It left the tree on **v1.0.7 / vc13**, New Arch on, with a clean
> `assembleRelease` behind it. **Its correctness is not settled yet: [WALK-16](walk-open.md) is what
> decides that, and IMP-077 below is gated on it.**

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
> build chat**, and do not read a missing walk as an unfinished spec. IMP-076 is the worked example: it
> ended **code-complete at green tests plus a clean native build**, and its correctness is settled by
> WALK-16, not by the chat that built it.

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

1. **Install the two packages.**
   1. Use **`npx expo install`**, not bare `npm install` — `react-native-reanimated@~4.1.1` and
      `react-native-worklets@0.5.1`, both Expo SDK 54's own bundled recommendations
      (`node_modules/expo/bundledNativeModules.json`).
   2. **Do not touch [`babel.config.js`](../babel.config.js).** `babel-preset-expo` auto-injects the
      worklets plugin when `react-native-worklets` is present, and prefers it over the Reanimated plugin
      (`node_modules/babel-preset-expo/build/index.js:286-289`). Adding either by hand risks
      double-application. The file stays exactly as it is.

2. **Wire up Jest — and document why it lies.**
   1. Add to [`jest.setup.js`](../jest.setup.js):
      `jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));`
   2. Add `react-native-reanimated` to the `transformIgnorePatterns` allowlist in
      [`package.json`](../package.json)'s jest block, beside the existing entries.
   3. ⚠️ **Comment at the mock site that it no-ops every hook** — so a green suite proves the screens
      still render and proves *nothing whatsoever* about the native side. That is exactly the trap this
      spec's WALK-16 gate exists for, and the next reader must not have to rediscover it.

3. **New `src/motion.js` — the vocabulary.**
   1. **Purity rules:** no state of its own, and **no imports from `persistence/`, `billing/`,
      `gamify.js` or `insights/`**. This is the "no backend rewiring" constraint made mechanical.
   2. **Source the feel, don't invent it.** [`Celebration.js`](../src/screens/Celebration.js) — a spring
      pop into `Animated.stagger(150, …)` over scale and opacity — is the house motion. Generalize it.
   3. Export exactly:
      - `DUR` = `{ tap: 120, enter: 320, settle: 480, celebrate: 900 }`
      - `EASE` — named curves plus one spring config matching Celebration's
      - `riseIn(delay)` — fade + 12dp translateY. The default entrance for cards and rows.
      - `popIn(delay)` — scale 0.85→1 spring. Rewards, badges, orbs.
      - `fadeOut()` — plain opacity. Dismissals.
      - `stagger(i, step = 60)` — delay for list index `i`.
      - `usePressScale()` — shared press feedback.
      - `useCountUp(value)` — animates a number toward `value`.
      - `ScreenFade` — see step 5.

4. **Adopt it in exactly two places. No more.**
   1. **`PrimaryButton` takes `usePressScale()`**, replacing its local press spring
      ([`ui.js:83-85`](../src/ui.js#L83-L85)).
   2. **`ProgressBar`'s shimmer is not touched** — it works, it is native-driven, and the regression risk
      buys nothing.

5. **`ScreenFade` wraps the screen container** at [`RitualsApp.js:754`](../src/RitualsApp.js#L754).
   1. Cross-fade plus an 8dp translateY settle at `DUR.enter`, keyed on the active tab so a change
      remounts the animation.
   2. **No routing change, no state change, no navigation library.**
   3. The ~12 `<Modal animationType="slide">` instances stay exactly as they are — OS modal presentation
      is correct for sheets, and a custom presenter is far more change than the result justifies.

6. **🔒 Freeze `src/art.js`, and leave working choreography alone.**
   1. `RayFan`, `NightSky`, `NightRays`, `BigSun`, `BigMoon` are the app's signature and the owner's
      explicit constraint. **Not ported to Reanimated, not restyled, not re-timed. No exceptions.**
   2. `Celebration.js` and `Toast.js` **stay on `Animated`.** Rewriting working choreography buys
      nothing.
   3. **Coexistence is the design, not a compromise** — new motion uses `motion.js`, old motion is left
      alone, and the two run side by side.

7. **Tests — `__tests__/motion.test.js`**, covering the pure surface only:
   1. `DUR` and `EASE` shapes.
   2. `stagger(i, step)` arithmetic.
   3. A **source assertion** (in the style of IMP-074's) that `motion.js` imports nothing from the four
      forbidden directories.

8. **Green + bump.**
   1. `npm test` — **≥ the count IMP-076 left**, plus the zone suites.
   2. `npx expo export --platform android` clean.
   3. **`npm run bump:native`** — native dep.

9. **Runtime proof: [WALK-18](walk-open.md). Not from this chat.**

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

1. **Generate the tokens — `scripts/gen-design-system.js` (new).**
   1. Import `makeTheme()` from [`theme.js`](../src/theme.js) and emit
      `design-system/tokens/{color,type,shape,elevation}.html` across `mode: day | night` × the shipped
      accent sets.
   2. **Generated, never hand-written.** Hand-copied hex drifts the first time the accent palette
      changes; generated output cannot.
   3. **Label every swatch with its token name (`c.accentSoft`) and never show a raw hex.** Claude
      Design will only return specs in token names if it never sees a hex.

2. **`design-system/frozen/celestial.html` — the highest-value card in the project.**
   1. Render `BigSun`, `RayFan`, `NightSky`, `NightRays`, `BigMoon` as static PNGs exported from the
      **real components**, both themes.
   2. Caption verbatim:
      > **FROZEN — reference only.** These are the app's signature. Compose around them. Never redraw,
      > restyle, recolor, or re-time them. Designs may position them, size them, and animate their
      > *container* (opacity, translate, scale) — nothing inside.
   3. **Why it is first:** without a *visual*, Claude Design redesigns the sun, and every downstream
      screen spec silently inherits a sun that cannot ship.

3. **`design-system/motion/` — the portability contract.**
   1. `contract.html` — the hard rules, verbatim from §6 of the design doc: only
      `opacity`/`translateX,Y`/`scale`/`rotate` animate; every motion names a `src/motion.js` primitive;
      numbers not vibes (ms, dp, named easing); durations from `DUR`; nothing loops except the existing
      `ProgressBar` shimmer; every entrance degrades to a cross-fade under reduced-motion.
   2. `primitives.html` — a runnable CSS approximation of each `motion.js` export, so the house feel can
      be **seen** rather than inferred from a table.
   3. **Writable before IMP-077 lands** — the primitive list is fully specified in IMP-077 step 3 and in
      the design doc.

4. **`design-system/components/*.html`** — `card` (incl. the night-v2 `CARD_SHEEN` top strip),
   `buttons`, `progress`, `chips`, `nav`, `plus`. Mirror [`ui.js`](../src/ui.js),
   [`shopui.js`](../src/shopui.js), and the nav at [`RitualsApp.js:757`](../src/RitualsApp.js#L757).

5. **`design-system/screens/baseline-*.html`** — real screenshots, both themes, captured via the existing
   `npm run shots` path ([`scripts/shots.sh`](../scripts/shots.sh), Maestro + adb). Designing *from* the
   current screens rather than from prose is the biggest single lever on whether output reads as the next
   version of Daily Rituals or as a generic wellness app.

6. **Mark every card.** Each preview's **first line** must be `<!-- @dsCard group="…" -->` — that marker
   is what the Design System pane compiles into `_ds_manifest.json`. **A preview without it produces no
   card.** Do not hand-edit `_ds_manifest.json`.

7. **Push to Claude Design.**
   1. The owner's existing GitHub connection to this repo is a **regular project**; project type is
      immutable at creation, so it cannot become a design system (`list_projects`, filtered to writable
      design-system projects, returned empty 2026-08-16). A **new** design-system project is required.
   2. `DesignSync`: `create_project` → `finalize_plan` → `write_files`.
   3. **Push step 2 (frozen) and step 3 (motion contract) first** — whatever is in the project at request
      time is what constrains output, and guardrails added afterward do not retroactively fix an
      already-generated design.
   4. ⚠️ **`design-system/` is the only thing that goes to Claude Design.** This does not push the repo
      to GitHub and does not relax the branch discipline above.

8. **Steady state — note it, do not do it.** Once `design-system/` is committed, the Design System pane's
   own GitHub connection could be pointed at that folder so it re-syncs whenever `theme.js` changes.
   **That requires publishing the branch, so it does not happen while the no-push instruction stands.**
   Record it in the session note as an option the owner can take later.

9. **No test gate.** This spec changes no app code, so `npm test` must be **unchanged** — not improved.
   **If the count moves, something was touched that should not have been.**

**Done when** the Design System pane shows every card above, the frozen card renders the real sun, and a
first design request returns a spec written in **token names and `motion.js` primitives**.

**First design request, once it is live:** **`PlusPerks`** — 44 lines carrying the entire "what you get"
pitch, against `YouScreen.js`'s 325. The surfaces that take money are the least designed in the product.
**One screen per request**; "redesign the app" produces mush. And this is a *design* request only —
`PLUS_ENABLED` stays `false`, `PLUS_PERKS` copy and everything under `src/billing/` are untouched.

**Commit:** `docs(design): a design system Claude Design can work from (IMP-078)` — **no `Release-Lane`
trailer, and do not push.**
