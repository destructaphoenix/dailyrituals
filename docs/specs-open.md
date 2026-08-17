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

> **IMP-076 and IMP-078 are both ✅ code-complete (2026-08-17)** — specs archived to
> [`build-log.md`](build-log.md). IMP-076 left the tree on **v1.0.7 / vc13**, New Arch on, with a clean
> `assembleRelease` behind it; **its correctness is not settled yet — [WALK-16](walk-open.md) decides that.**
> IMP-078 pushed `design-system/` live to a new Claude Design project — **15 cards, both themes**.
>
> **IMP-077 is the only spec left here, and it is BLOCKED on WALK-16 passing.** If you are a build chat and
> WALK-16 has not passed, there is nothing in this queue for you.

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
   1. `RayFan` and `NightRays` are the app's signature and the owner's explicit constraint (2026-08-17:
      the signature is **these two and nothing else** — `BigSun` and `BigMoon` still ship but are ordinary
      artwork, replaceable by a design). **Not ported to Reanimated, not restyled, not re-timed. No
      exceptions.**
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

