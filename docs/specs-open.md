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
| 1 | [IMP-080 — the Paywall footer stops fighting the layout](#imp-080--the-paywall-footer-stops-fighting-the-layout) | **Build** | WALK-07, 2026-08-16 |
| 2 | [IMP-077 — a motion vocabulary the whole app can speak](#imp-077--a-motion-vocabulary-the-whole-app-can-speak) | **Build** | owner, 2026-08-17 |

> **IMP-080 is takeable right now — it is the only unblocked row in this file.** It has no gate, no
> device dependency and no walk to wait on. IMP-077 below is still hard-blocked on WALK-16.
>
> **The number 079 is deliberately skipped.** It was used on 2026-09-05 for a baseline-capture path that
> was written, reviewed and deleted in the same session (see `PROGRESS.md` session notes). Nothing
> landed under it, but the note naming `IMP-079` is still in the log, so reusing the number would make
> that note read as though it described this spec. **Do not reuse 079.**

> **IMP-076 and IMP-078 are both ✅ code-complete (2026-08-17)** — specs archived to
> [`build-log.md`](build-log.md). IMP-076 left the tree on **v1.0.7 / vc13**, New Arch on, with a clean
> `assembleRelease` behind it; **its correctness is not settled yet — [WALK-16](walk-open.md) decides that.**
> IMP-078 pushed `design-system/` live to a new Claude Design project — **15 cards, both themes**.
>
> **IMP-077 is BLOCKED on WALK-16 passing.** It is no longer the only spec here, though: **IMP-080 was
> added 2026-09-05 and is unblocked**, so a build chat arriving before WALK-16 has run takes that one.

> ### 🔒 EVERYTHING HERE IS BRANCH-ONLY — `feat/design-push`, never pushed
>
> Owner instruction, 2026-08-17, and it covers IMP-080 too: **none of this work reaches GitHub.** For
> every one of these specs:
> **never `git push`** (the branch is created with no upstream so a bare push fails — do not set one),
> **never add a `Release-Lane:` trailer**, and **do not merge to `main`.** Merging is a separate owner
> decision taken after the walks pass. This replaces the usual "commit with the exact message, no
> trailer = not shipped" ending: here, not-shipped also means not-pushed.

> **Design source of truth — IMP-076/077/078 only; IMP-080 came out of a walk, not the design doc.**
> Those three are scoped from
> [`docs/superpowers/specs/2026-08-16-motion-and-design-system-design.md`](superpowers/specs/2026-08-16-motion-and-design-system-design.md).
> **Read that document before starting any of them** — it carries the *why* (the expired IMP-027 hold,
> the dependency audit, the frozen-sun rule) that these Steps assume and do not repeat.

> **Take them in order, and IMP-077 has a hard gate.** IMP-077 must not start until **WALK-16 has
> passed** — Reanimated 4 cannot run on Legacy Architecture, so IMP-077 on an unproven IMP-076 is
> unverifiable. **IMP-080 has no gate at all** and does not touch anything IMP-077 touches, so the two
> cannot collide. (IMP-078 depended on neither and is already done.)

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

### IMP-080 — the Paywall footer stops fighting the layout

**Lane:** Build · **Branch:** `feat/design-push`, never pushed · **Origin:** the 🔴 WALK-07 finding,
2026-08-16. **No gate — this is takeable immediately.**

**Why — read this before you touch anything, because two people have already fixed this screen.**

`Paywall.js` has a fixed footer sitting as the last child of a flex column, above a `flex: 1`
`ScrollView`. On Android the screen is inside a `Modal`, which is a Dialog whose window size is not
known on the first measure pass, so the column resolves against nothing and the footer lands on top of
the plan selector and the "Your journal lives on your device" disclaimer.

**Two fixes have already been aimed at that measure pass, and both are still in the file, unchanged and
correct:**

- **IMP-068** put `style={{ flex: 1 }}` on the `ScrollView` ([`Paywall.js:56`](../src/screens/Paywall.js#L56)).
- **IMP-074** put `maxHeight: winH` on the root `View` ([`Paywall.js:40`](../src/screens/Paywall.js#L40)),
  fed by `useWindowDimensions()` so it tracks rotation.

WALK-07's re-run on 2026-08-16 confirmed **both halves present in code** and the overlap **still
happening from the very first frame** — not the delayed-then-correcting pass IMP-074's writeup
described. Every other screen in that walk passed, both nav modes, max font scale.

**So the decision is: stop tuning the measurement, and remove the race.** A third patch to the same
flex column is the wrong bet. The footer's position must stop depending on the column measuring
correctly at all. *(Owner's decision, 2026-09-05, choosing between this and folding the footer into the
scroll content: the CTA stays pinned, because this is the screen that takes money.)*

⚠️ **The alternative floated during the walk — "don't render the footer until a plan is picked" — does
not work and must not be implemented.** `plan` is initialised to `'annual'`
([`Paywall.js:29`](../src/screens/Paywall.js#L29)), so a plan is *always* picked and the footer would
render on the first frame regardless. Recorded here so it is not rediscovered and retried.

**Steps**

1. **Root view: a fixed height, not a capped flex.**
   [`Paywall.js:40`](../src/screens/Paywall.js#L40) becomes `height: winH` in place of
   `flex: 1, maxHeight: winH`. `winH` still comes from `useWindowDimensions()` — **do not** switch to
   `Dimensions.get()`, there is a source assertion guarding that. `paddingTop: insets.top`,
   `backgroundColor: c.cream` and `testID="paywallRoot"` all stay exactly as they are.
   **Why this and not the cap:** step 3 pins the footer with `bottom: 0`, which is only meaningful
   against a root that is the viewport. Under `flex: 1 + maxHeight`, a *short* page sizes the root to
   its content and `bottom: 0` would float the footer up the middle of the screen. An exact height is
   what makes the pin correct in both directions.

2. **Track the footer's height in state.** `const [footerH, setFooterH] = useState(96);`
   **Seed it at 96, do not seed it at 0.** The footer is a `PrimaryButton` plus `LegalFooter` and its
   real height is close to this; a 0 seed makes the first frame's bottom padding short. It self-corrects
   on the first `onLayout` either way, but there is no reason to ship a wrong first frame.

3. **The footer leaves the flex column.** The footer `View`
   ([`Paywall.js:107-112`](../src/screens/Paywall.js#L107-L112)) gains
   `position: 'absolute', left: 0, right: 0, bottom: 0` and
   `onLayout={(e) => setFooterH(e.nativeEvent.layout.height)}`. Every existing style on it —
   `paddingHorizontal: 26`, `paddingTop: 14`, `paddingBottom: 14 + insets.bottom`, `borderTopWidth: 1`,
   `borderTopColor: c.border`, `backgroundColor: c.surface` — **stays**. `backgroundColor` is
   load-bearing now: the content scrolls *underneath* this view, so a transparent footer would show it
   through.

4. **The ScrollView reserves that height.** Its `contentContainerStyle.paddingBottom` goes from `18` to
   `18 + footerH`. Its `style={{ flex: 1 }}` **stays** — IMP-068's comment stays too, it is still true.

5. **Rewrite the two comments, do not delete them.** The IMP-074 block at
   [`Paywall.js:18-27`](../src/screens/Paywall.js#L18-L27) currently explains a cap that no longer
   exists. Replace it with why the footer is absolutely positioned and why the root is a fixed height,
   **naming IMP-068 and IMP-074 as superseded rather than wrong** — both were correct reasoning about a
   race that this spec removes instead of tuning. The next reader must not read this as a silent
   reversal. Same discipline IMP-076 used on the New Arch flags.

6. **`flow.overlay` stays the last child**, after the footer, so the purchase overlay still draws above
   everything. Do not move it.

7. **Tests — [`__tests__/screens/Paywall.test.js`](../__tests__/screens/Paywall.test.js).**
   1. The **IMP-068 block stays untouched and must still pass** — `flex: 1` on the ScrollView is not
      changed by this spec.
   2. The **IMP-074 block is rewritten, not deleted.** Rename the describe to
      `Paywall — IMP-080 (supersedes IMP-074)`. The first test asserted `maxHeight` + `flex` on the
      root; it now asserts `flat.height === Dimensions.get('window').height` and that `maxHeight` is
      gone.
   3. **Keep the `useWindowDimensions` source assertion exactly as it is.** It is the reason the cap
      tracked rotation and it is the reason the height will.
   4. **Add:** the footer view is absolutely positioned — find it by its `borderTopWidth: 1` +
      `position: 'absolute'` style and assert `bottom === 0`, `left === 0`, `right === 0`.
   5. **Add:** the ScrollView's `contentContainerStyle.paddingBottom` is `> 18`, i.e. it reserves the
      seeded footer height rather than the bare original padding.
   6. **Add a regression test naming the real defect:** with `insets={{ top: 0, bottom: 0 }}`, the
      last perk, the disclaimer text and the annual price all render **and** the footer is not a
      sibling that precedes them in the flex flow. A rendered-tree test cannot see pixels, so assert the
      structural property that made the overlap possible: the footer carries `position: 'absolute'`.
      **Comment this test with the fact that jest cannot see the overlap** — WALK-07 is the only thing
      that can, exactly as the motion spec's mock comment does.

8. **Green.**
   1. `npm test` — **≥ 867 passed, 84 suites**, plus the zone suites.
   2. `npx expo export --platform android` clean.
   3. **No `bump:native`** — this is pure JS, no native dependency changes.

9. **Do NOT flip `PLUS_ENABLED`.** It stays `false` in the commit. Technique **T1** in
   [`walk-open.md`](walk-open.md) is how the walk chat reaches this screen; a build chat does not need
   to render it to satisfy the steps above, and a flipped flag committed by accident is a shipping
   incident.

10. **Runtime proof: the Paywall half of [WALK-07](walk-open.md). Not from this chat.**

**Commit:** `fix(paywall): the footer leaves the flex column (IMP-080)` — **no `Release-Lane` trailer,
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

