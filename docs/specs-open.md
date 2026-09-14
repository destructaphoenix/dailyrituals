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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1257 passed, 118 suites** — verified 2026-09-14, after IMP-135), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue

**One open row: IMP-136.** IMP-128 is owner-gated. IMP-131 through IMP-135 are all done.

| Row | What | Lane | Take it? |
| --- | --- | --- | --- |
| IMP-136 | **Sunrise** — the hero's empty band is filled with light, not content (ports D-15's locked design) | OTA | ✅ **yes — this is the first open row** |
| IMP-128 | Apply the motion vocabulary — `riseIn` on cards and rows, `popIn` on badges, `useCountUp` on the streak | OTA | ⏸ **owner's yes first — do not start** |

**IMP-124 through IMP-135 are done** (archived to `docs/build-log.md`, commits `87771c4`, `d57dc2d`,
`0502790`, `402391b`, `0a2f595`, `111c3de`, `28654cb`, `bcaebb6`, `c9dc2dc`, `bbb2d20`).

---

### IMP-136 — Sunrise: the hero's empty band is filled with light, not content

**This ports a returned Claude Design, and the design is locked.** Source card:
[`design-system/proposals/hero-band-v3.html`](../design-system/proposals/hero-band-v3.html) — *"The empty
band"*, **direction A · Sunrise**, the card's own recommendation, chosen by the owner 2026-09-15. It closes
[D-15](design-queue.md#d-15--the-hero-cards-top-third-holds-nothing-). Severity 🎨. Lane **OTA** — no native
change, no `versionCode` bump.

**The one-sentence version.** The band at card-y 0 → 127 does not read empty because it has no content; it
reads empty because the rays are at their *faintest* exactly where there is most of them to see. Move the
**art's** focal up into the band, put a bloom behind the convergence, and the band becomes the brightest
part of the card **without a single new element**.

🔴 **Nothing moves. No content enters the card.** Not the greeting, not the date, not the ember pill, not a
caption. The page header above the card is untouched. `HERO_HEIGHT`, `HERO_BOX`, `HERO_FOCAL`, the numeral
block and its `marginTop`, the spacer, the meta row and `ProgressBar` are all untouched. **This is an
art-only change**, and that is *why* it was the direction chosen: the other two takes moved text, and text
cannot go in that band because a Plus user has footage running there.

🔴 **The video shells change NOTHING.** Sunrise is classic-ground only. `SkyHero`, `heroChrome`'s
over-video branch and the `videoSkyActive` shell are out of scope — do not touch them, and do not add a
`tone` field to `SHOP_SKIES`. **The owner ruled on this on 2026-09-15:** one treatment over footage (the
white ramp `heroChrome` already ships from IMP-124), theme tokens everywhere else. *"I want consistency in
the app… we will stick to the colour scheme of the app for light and dark mode."* A per-sky ink inversion
was proposed by the design card as a carried-over open item and is **declined** — do not re-open it.

---

#### 🔴 Read this before step 1 — four traps, all verified in source on 2026-09-15

**1. Five existing tests assert the thing this spec deliberately breaks.** `HERO_FOCAL` currently positions
**both** the numeral and the art, and
[`__tests__/screens/HomeScreenSkyHero.test.js`](../__tests__/screens/HomeScreenSkyHero.test.js) pins that
coupling in five places — the three `focalOf(...)` cases in the `IMP-131` describe (lines ~145, ~156, ~165)
and the two `renderedFocal(view, Art) === cardHeight / 2` cases in the `IMP-132` describe (lines ~213,
~219). **Sunrise decouples them on purpose.** These tests must be **corrected, not deleted and not worked
around** — this is the IMP-133 pattern exactly (that row's test count was flat because a case was
*inverted*, and its comment says so in the file). Rewrite them to assert the **new** invariant:

- the numeral's centre is still `HERO_FOCAL` (`box.paddingTop + block.marginTop + num.lineHeight / 2`),
- the art's focal is `HERO_ART_FOCAL`, read off the rendered component's props,
- and the two are **no longer equal**, which is the assertion that would have gone red before this row.

⚠️ **Do not type `96`, `168` or `336` on both sides of an assertion.** Those describes already read every
number off the render; keep that property.

**2. `RayFan`'s ray opacity is hardcoded on its wrapper, not a prop.** [`art.js:34`](../src/art.js#L34) —
`opacity: 0.5` sits in the outer `View`'s style. The streak ramp needs it to vary. **Add it as an optional
prop with the current value as the default** (`rayOpacity = 0.5`), exactly the way IMP-132 added `focal` and
IMP-133 added `reach`: the signature grows, every existing caller keeps today's render.
[`gen-design-system.js:365`](../scripts/gen-design-system.js#L365) calls it with `{ size, focal, reach }`
and must keep producing the same PNG.

**3. `NightRays` ALREADY HAS the bloom. Do not give night a second one.** [`art.js:95`](../src/art.js#L95)
draws a breathing amber pool (`nightRaysBloom`, `Circle r=80`, opacity 0.22→0.38 on a 4.2s loop) centred on
the focal. Moving the focal to 96 carries it into the band **for free** — that is most of Sunrise on night,
already built. **The new `Bloom` is DAY ONLY.** The design card draws a `.bloom` div under both phones, but
its HTML has no model of `NightRays`' built-in glow, so its "night bloom 20% → 7%" *is* that glow described
from the outside. Stacking a second radial under it would double the light on black. **This is a deliberate
deviation from the card and it is decided — do not "fix" it back.**

**4. The fade is a `<Mask>`, and `mask-image` is CSS that does not exist in React Native.** The card
expresses the radial fade as `-webkit-mask-image`. `react-native-svg` is **15.12.1** and does support
`<Mask>` + `<RadialGradient>` on both platforms — but nothing in this tree uses `Mask` yet, so it is
**unproven here**. Step 2 is therefore taken and tested **alone**, before a screen is touched. If `Mask`
does not render on Android, **STOP and log it to `PROGRESS.md` → Open items** rather than inventing a
substitute; the obvious fallback (overlaying a radial gradient in the card's own surface colour) is wrong
on night, where the card surface and the page ground are different colours.

---

**Steps.**

1. **`src/home/heroFrame.js` — decouple the art's focal from the numeral's, and re-derive the reach.**

   ```js
   // The NUMERAL's anchor. Unchanged — the centred numeral is the asset (IMP-131/132).
   export const HERO_FOCAL = HERO_HEIGHT / 2;

   // The ART's focal (IMP-136, "Sunrise"). Two names because they are now two
   // ideas: the rays are densest at the focal and sparsest at the tips, so with
   // one shared focal at the card's centre the dense half of the art sits BEHIND
   // the numeral and the band above it gets 24 near-parallel hairlines. Raising
   // only the art's focal puts the convergence IN the band. The numeral does not
   // move.
   export const HERO_ART_FOCAL = 96;
   ```

   `heroReach` re-derives from the **new** focal, because the farthest corner from a focal at y=96 is now
   the *bottom* one:

   ```js
   export const heroReach = (windowWidth) =>
     Math.ceil(Math.hypot((windowWidth - HERO_PAD * 2) / 2, HERO_HEIGHT - HERO_ART_FOCAL) * HERO_REACH_MARGIN);
   ```

   ⚠️ **`HERO_HEIGHT - HERO_ART_FOCAL`, not `HERO_HEIGHT / 2`.** At a 372dp window this is 316 against
   today's 256 — the tips must still finish outside the card **at every rotation**, which is IMP-133's
   invariant and the test that guards it still applies unchanged.
   ⚠️ **This file is imported by [`gen-design-system.js`](../scripts/gen-design-system.js) and by
   [`genDesignSystem.test.js`](../__tests__/scripts/genDesignSystem.test.js)** — expect the frozen card's
   reach to move and the generated PNG to change. That is correct (it is IMP-134's whole point: the card
   draws what the app draws). **Regenerate `design-system/` in step 6.**

2. **`src/art.js` — `RayFan` gains a radial fade and a ray-opacity prop. Take this step alone (trap 4).**
   Signature becomes `RayFan({ size = 300, focal = 80, reach = size / 2, rayOpacity = 0.5 })`. The
   hardcoded `opacity: 0.5` on the wrapper becomes `opacity: rayOpacity`.

   The fade goes **inside the existing `<Svg>`**, as a `<Mask>` over the ray group — *not* on the
   geometry, which is frozen:

   | Stop | Alpha |
   | --- | --- |
   | 0% → 26% of radius | 1.0 (opaque) |
   | 52% | 0.55 |
   | 78% | 0.12 |
   | 100% | 0 |

   A radial mask is rotation-invariant, so it may live inside the rotating `<Svg>` without fighting the
   60s spin. **This is what keeps a 632dp fan from greying the lower card** and is the one addition to the
   art component.

   🔴 **The frozen rule is not broken and must not be:** 24 spokes, `strokeWidth={2}`, `t.colors.accent`,
   round caps, one rotation per 60s — **all unchanged**. `focal`, `reach` and now `rayOpacity` are the
   ordinary props; the fade is a light layer over the same geometry.

   **Prove this step before moving on:** `npm test` green, and a new case asserting the mask is present and
   that `rayOpacity` defaults to `0.5` (so every existing caller is untouched).

3. **`src/art.js` — a new `Bloom`, exported, DAY ONLY (trap 3).** A radial gradient, **210dp radius**,
   centred on the focal it is given, `c.accent`:

   | Stop | Opacity |
   | --- | --- |
   | 0% | 0.26 |
   | 42% | 0.10 |
   | 72% → 100% | 0 |

   It renders **behind** the fan and is `pointerEvents="none"` like the rest of `art.js`. It takes
   `focal`, and a `strength` multiplier (default 1) for step 4. ⚠️ **`NightRays` does not get one** — see
   trap 3.

4. **The streak ramp — the band carries the state.** Three points are given by the design card; the
   in-between is linear and is specified here so it is not guessed:

   | Streak | `rayOpacity` | Bloom |
   | --- | --- | --- |
   | 0 | **0.18** | **not rendered at all** |
   | 1 | 0.34 | `strength` 0.5 |
   | 2 → 6 | `0.34 + 0.16 × (s − 1) / 6` | `strength` `0.5 + 0.5 × (s − 1) / 6` |
   | ≥ 7 | 0.5 (today's value) | `strength` 1 |

   ⚠️ **`HERO_ART_FOCAL` is a constant at every streak, 0 included.** Only the opacity and the bloom ramp.
   At streak 0 the convergence still sits in the band — the card is genuinely empty and **says so with
   light rather than with a sentence.** Put this ramp in a pure exported helper (`heroLight(streak)` in
   `src/home/heroFrame.js`) so it is unit-testable without rendering a screen; `HomeScreen` should not
   carry the arithmetic.

5. **`src/screens/HomeScreen.js` — wire it, and change nothing else.** The classic shell at
   [`HomeScreen.js:123`](../src/screens/HomeScreen.js#L123) passes `focal={HERO_ART_FOCAL}` (not
   `HERO_FOCAL`) and the ramped `rayOpacity`; day additionally renders `<Bloom focal={HERO_ART_FOCAL}
   strength={…} />` **before** the fan in source order so it sits behind it. The numeral block's
   `marginTop` still derives from `HERO_FOCAL` and **must not be touched**. The video branch is not edited.

6. **Regenerate the design system and the screen cards.** `node scripts/gen-design-system.js` and
   `node scripts/gen-screens.js`, and commit what they emit. The frozen PNGs and `home-day.html` /
   `home-night.html` all move, which is the correct outcome — IMP-134 exists so these cannot lie about
   what the app draws. ⚠️ **Do not hand-edit a generated file.**

7. **Tests.** Correct the five coupled cases (trap 1) rather than adding parallel ones. Then add:
   the `heroLight` ramp at streaks 0, 1, 4, 7 and 210 (pure, no render); `Bloom` is absent at streak 0 and
   present at streak 1; **`Bloom` never renders on the night shell or the video shell**; the art's focal is
   `HERO_ART_FOCAL` and the numeral's is `HERO_FOCAL` and they differ; and IMP-133's containment invariant
   (tips outside the card at any rotation) still holds at the new reach.

**Ship.** `npm test` green (must stay ≥ **1257 passed, 118 suites**), `npx expo export --platform android`
clean, then commit with **exactly**:

```
feat(home): the hero's empty band is filled with light, not content (IMP-136)
```

**No `Release-Lane` trailer** unless the owner asks to ship.

🔴 **A green suite proves very little here — this is a composition, and jest cannot see it.** Every one of
IMP-130 → IMP-133 passed its tests and still had to be looked at on a screen; three of those four rows
*exist* because the previous one's green suite hid what the card actually looked like. Its runtime proof is
**[WALK-26](walk-open.md)** — classic ground, both modes, streak 0 / 1 / 210, at max font — which this spec
does **not** run. File it and stop at code-complete.

---

### IMP-128 — apply the motion vocabulary

⏸ **OWNER-GATED. Do not build this without an explicit yes, and do not take it as "the first open row".**
The gate is the owner's own, recorded 2026-09-10: *"some time later when plus is complete I can work on the
motion."* **Plus is not complete** by that sentence's own definition — WALK-19 step 8 (the one real-money
purchase) and WALK-12 (R8, must be last) are both unwalked, and WALK-20 does not have a result. **This spec
exists so the decision has a body to read when the gate lifts, not so it can be taken early.** Severity 🎨.

**What it buys, and what it already cost.** IMP-077 added a motion vocabulary and the app never spent it.
**Six of eight exports have no consumer**: `riseIn`, `popIn`, `fadeOut`, `stagger`, `useCountUp` and
`ScreenFade` (IMP-111 deleted that one rather than fixing it). Only `usePressScale` is live, at a 0.99 press
scale deliberately built to be imperceptible. **That vocabulary was not free** — IMP-077 added
`react-native-reanimated` and `react-native-worklets` as **native** deps and forced the vc14 build. **This
row is the only thing that ever makes that cost worth paying.** WALK-18's owner verdict — *"the animations
are not there"* — is the defect, and it is correct.

**Scope: three surfaces, and no more.** This is deliberately not "apply motion everywhere". It is the
smallest set that makes the app visibly move on the screens a user opens first, and it is the set the
parked note already named.

⚠️ **`art.js`, `Celebration.js` and `Toast.js` stay on the RN `Animated` API. Do not port them** —
coexistence is the stated design ([`motion.js:16`](../src/motion.js#L16)), not a compromise. ⚠️ **`stagger`
is unused — do not be fooled by `Animated.stagger` in
[`Celebration.js:23`](../src/screens/Celebration.js#L23).** That is React Native's own `Animated` API, a
different function entirely; an audit on 2026-09-10 miscounted it as a consumer.

---

#### 🔴 Read this before step 1 — four traps, all verified in source on 2026-09-13

**1. `riseIn` and `popIn` are hooks wearing function names.** Both call `useSharedValue`, `useEffect` and
`useAnimatedStyle`. They are **not** `use`-prefixed, so React's lint rule will not flag them, and calling
`riseIn(stagger(i))` inside a `.map()` callback or behind a `showRecapCard &&` guard breaks the rules of
hooks **silently**. Home's card stack is conditional in three places
([`HomeScreen.js:117`, `:128`, `:140`](../src/screens/HomeScreen.js#L117)) and Keepsakes is a `.map()`
([`Achievements.js:40`](../src/screens/Achievements.js#L40)), so **every intended call site is one of these
two shapes.** This is why step 1 introduces wrapper components instead of sprinkling calls.

**2. `motion.test.js` asserts the module's top-level bindings are exactly `['DUR', 'EASE']`**
([`__tests__/motion.test.js`](../__tests__/motion.test.js), last test, a `^(?:export )?(?:const|let|var)`
regex). **Declare the new components as `export function Rise(...)`, never `export const Rise = ...`**, or
that test goes red for a reason that has nothing to do with motion.

**3. Under jest, a `riseIn` subtree renders at `opacity: 0`.** The mock's
`useAnimatedStyle` is `IMMEDIATE_CALLBACK_INVOCATION` and `useSharedValue` returns a plain proxy, so the
style is computed once at render with `p.value` still `0`; the `useEffect` then sets it to `1` and **nothing
re-renders**, because a shared value is not React state. React Native Testing Library queries by text and
does not care about opacity, so the existing suites should pass unchanged — **but if a Home or Keepsakes
test asserts on a style object or holds a snapshot, it will move.** Expect that, and do not "fix" it by
changing the initial value.

**4. `useReducedMotion` is NOT in the Reanimated jest mock.** `node_modules/react-native-reanimated/src/mock.ts`
line 84 reads `// useReducedMotion: ADD ME IF NEEDED`. Importing it makes every suite that renders Home
throw `useReducedMotion is not a function`. **If step 5 is taken, `jest.setup.js` must extend the mock
first** — this is the exact shape of the 085/099/100 mistake (a test written against an imagined SDK), so
read the mock, do not assume it.

---

**Steps.**

1. **`src/motion.js` — add two wrapper components, nothing else.** Both are `function` declarations (trap 2),
   both render `Animated.View` from Reanimated so the animated style actually binds, and both take
   `delay`, `style` and `children`:

   ```js
   export function Rise({ delay = 0, style, children, ...rest }) {
     const a = riseIn(delay);
     return <Animated.View {...rest} style={[style, a]}>{children}</Animated.View>;
   }
   export function Pop({ delay = 0, style, children, ...rest }) { /* popIn, same shape */ }
   ```

   ⚠️ **`motion.js` is currently a `.js` file with no JSX in it.** Confirm the Babel/Metro config compiles
   JSX there (it is `babel-preset-expo` over the whole tree, so it should) by running `npm test` after this
   step alone — **before** touching a screen. If it does not, **STOP and log it**; do not move the
   components into `ui.js` on your own initiative, because `ui.js` imports theme and would break
   `motion.test.js`'s purity assertion in the other direction.
2. **Keep `motion.js` pure.** The purity test forbids imports from `persistence`, `billing`, `gamify` and
   `insights`. `react` and `react-native-reanimated` are already imported and are fine. **Do not import
   `theme` or `ui`.**
3. **`HomeScreen.js` — wrap the card stack.** Each of the card wrappers under the hero becomes
   `<Rise delay={stagger(i)}>`, in the source order they already appear: the hero card, the freeze notice,
   On this day, the Annual Recap card, the quest/write card block, the week strip, the keepsakes rail.
   ⚠️ **The index must be a literal per call site, not a running counter over conditionals** — a card that
   is absent must not shift the delays of the cards after it, or the stack re-choreographs every time a
   notice appears. Assign fixed indices 0…6 in source order and accept the gaps.
   ⚠️ **Do not wrap the hero's *contents*** — `HERO_HEIGHT` is fixed at 336dp and the video sky sits behind
   it; wrap the `Card`, not the numeral.
4. **`Achievements.js` — stagger the keepsake rows.** The `.map()` at
   [`Achievements.js:40`](../src/screens/Achievements.js#L40) wraps each row in
   `<Rise delay={stagger(i, 40)}>`. **40ms, not the 60 default** — there are enough rows that 60 finishes
   after the user has read the list, which is what `stagger`'s own comment warns about. Use `<Pop>` on the
   **earned** badge circle only (`done === true`), so an earned keepsake lands and an unearned one merely
   arrives.
5. **`useCountUp` on the streak numeral.** [`HomeScreen.js:58`](../src/screens/HomeScreen.js#L58) renders
   `{streak}` at 76pt. It becomes `useCountUp(streak)` — the hook returns a plain number in React state, so
   the existing `<T>` and every shadow style stay exactly as they are.
   ⚠️ **It animates only on *change*** (`if (from.current === value) return`), so a cold launch shows the
   real number immediately and a completed entry counts up. **That is the intended behaviour; do not
   "fix" it into a launch animation.** Leave the XP line alone this round — it is inside the same 336dp
   box and two counters in one card compete.
6. **Reduced motion — the accessibility question, and it is a real one.** ⚠️ **See trap 4.** Either extend
   the Reanimated mock in `jest.setup.js` with `useReducedMotion: () => false` **and** honour it in `Rise`
   and `Pop` (return the plain `View` with no animated style), **or do not import it at all.** Both are
   acceptable; **what is not acceptable is importing it without extending the mock.** If you take the
   no-import path, say so in the session note so the debt is recorded rather than forgotten.
7. **Tests.** Extend [`__tests__/motion.test.js`](../__tests__/motion.test.js) rather than starting a new
   suite: `Rise` and `Pop` render their children; the top-level-binding assertion still passes (trap 2);
   the purity assertion still passes (step 2). Add one render test per touched screen asserting the
   content is still **present** — that is all a no-op mock can honestly assert.

**Ship.** `npm test` green (≥ **1230 passed, 116 suites**), `npx expo export --platform android` clean, then:

```
feat(motion): the app moves — riseIn on Home and Keepsakes, popIn on earned badges (IMP-128)
```

OTA, no native change, **no `versionCode` bump** — Reanimated is already in the binary since vc14. **Do not
add a `Release-Lane` trailer** unless the owner asks.

🔴 **A green suite proves nothing about the motion here, and this row is the clearest case of that in the
project.** `jest.setup.js` no-ops every Reanimated hook and worklet — it says so in its own comment. Green
means the screens still *render* with motion wired in. **Its runtime proof is a re-run of
[WALK-18](walk-open.md#walk-18--the-app-moves), whose steps 2 and 3 were struck precisely because `riseIn`
and `stagger` had no consumer.** When this lands, **un-strike them** — they become runnable for the first
time since they were written.

---

**IMP-127 is done** — archived in [`docs/build-log.md`](build-log.md#imp-127--the-shops-ember--promises-an-action-it-cannot-perform-2026-09-13), commit `402391b`.
**IMP-123 is done** — archived in [`docs/build-log.md`](build-log.md#imp-123--the-first-sky-carries-a-clip-on-its-own-update-channel-2026-09-13), commit `26e644b`.
**IMP-122 is done** — archived in [`docs/build-log.md`](build-log.md#imp-122--the-sky-catalogue-becomes-a-manifest-2026-09-12), commit `738a99e`.
**IMP-121 is done** — archived in [`docs/build-log.md`](build-log.md#imp-121--the-streak-hero-plays-a-video-sky-2026-09-12), commit `d0fe2cb`.
**IMP-120 is done** — archived in [`docs/build-log.md`](build-log.md#imp-120--the-consistency-grid-becomes-a-bounded-month-strip-2026-09-12), commit `72b0049`.
**IMP-119 is done** — archived in [`docs/build-log.md`](build-log.md#imp-119-the-ember-pills--lost-the-line-that-centred-it-2026-09-11), commit `1fc0664`.
**IMP-118 is done** — archived in [`docs/build-log.md`](build-log.md#imp-118-a-tied-weekday-no-longer-draws-as-an-empty-bar-2026-09-11), commit `dc22e32`.

---

**The owner asked for the Plus purchase surface to be investigated hard after IMP-099.** It was, by reading
the shipped SDK rather than our assumptions about it, and **the audit found a defect larger than IMP-099**.
**Three more rows came out of the WALK-19 re-run on 2026-09-08 (hardware, owner-run)**, and all three were
re-scoped the same day by reading source rather than trusting the field report. **Two of the three moved:
IMP-103 is not a defect at all, and IMP-104 no longer needs the device dump it asked for.** The
investigation also opened IMP-106, now code-complete and archived.

| Row | What | Severity |
| --- | --- | --- |
| IMP-100 | Every RevenueCat purchase error becomes `failed`. `e.code` is a **number**, our mapper matches **names**. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-101 | The `failed` card claims "you weren't charged" and never asks the store. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-102 | Completing a purchase grants **+3 freezes every time**, not once. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-103 | Step 4e failed on a bundle without IMP-100/101 — **neither was ever pushed or shipped**. | ✅ **done — shipped 2026-09-10, group `f961b427`; archived in `docs/build-log.md`** |
| IMP-104 | `tier: 'owned'` means free and `Shop.js` never reads it — and tapping such an item **wipes the ember balance to 0**. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-105 | 🚦 Reinstall + Restore said "Nothing to restore." **The test subscription had expired mid-walk; the app was innocent.** | ✅ **CLOSED 2026-09-10 by WALK-19a — not reproducible, walk-protocol defect. Archived in `docs/build-log.md`** |
| IMP-106 | A healthy build cannot say which JS bundle it is running — the gap that mis-scoped IMP-103. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-107 | A lapsed member kept Plus until they happened to background the app — no launch-time downgrade check. | ✅ **done — archived in `docs/build-log.md`** |

---

### ✅ Embers for money — DONE, IMP-113 is code-complete

Both gating questions were answered by the owner on 2026-09-10 (cash → embers → candles; auto-freeze stays
free) and the candle cap was set at 3, so the conversation became a spec — now built and archived in
[`docs/build-log.md`](build-log.md) → "IMP-113". **The economics, the streak-integrity argument and the
three findings that shaped it are preserved there too**, under "The embers-for-money conversation".
⚠️ **`EMBER_PACKS_ENABLED` still must not be flipped** — IMP-113 is built but not walked; it owes a new
`WALK-20` on hardware with the license tester before the flag can flip.

### Numbers that must not be reused

- **079** — used on 2026-09-05 for a baseline-capture path written, reviewed and deleted in the same
  session. Nothing landed under it, but the note naming `IMP-079` is still in the log, so reusing the
  number would make that note read as though it described a different spec.
- **057** — reserved for the historical `dayKey` migration IMP-056 deferred. It cannot be written until a
  real device's numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added.

### ✅ The branch rule is OVER — `main` is the lane now

Superseded 2026-09-08: `feat/design-push` fast-forwarded onto `main` and the owner pushed it (`cb3d60e`).
**Commit normally, push to `main`, and add a `Release-Lane:` trailer only when the owner asks to ship.**
CI (`release.yml`) then owns the test gate, the native-file backstop, the billing preflight and
`--environment production`. ⚠️ **Never run `eas update` by hand** — that is what the trailer is for.

### The rules the next spec inherits

**Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
build chat**, and do not read a missing walk as an unfinished spec. IMP-077 is the newest worked example:
it ended code-complete at 873 green tests, and **its green suite proves nothing about the motion** — the
Reanimated jest mock no-ops every hook. WALK-18 settles it.

---

### ⏸ Parked: apply the motion vocabulary — owner's (c), deferred 2026-09-10

➡️ **This is now written up as [IMP-128](#imp-128--apply-the-motion-vocabulary), and the gate is UNCHANGED.**
The owner asked on 2026-09-13 for every open suggestion in this file to be specced, and chose *"spec it,
gated"* over *"spec it, buildable"* — so a spec body now exists to read, and **a build chat still may not
take it.** The reasoning below is kept here because it is the argument for the row, not part of the row.

**Owner: *"some time later when plus is complete I can work on the motion."* Do not start it — Plus is not
complete** (WALK-19 step 8 and WALK-12 are both unwalked, and WALK-20 has no result).
[IMP-111](build-log.md) (removing `ScreenFade`) is done — archived in `docs/build-log.md`.

**Why it exists.** IMP-077 bought a motion vocabulary and the app never spent it. **Six exports have no
consumer**: `riseIn`, `popIn`, `fadeOut`, `stagger`, `useCountUp`, and `ScreenFade` (IMP-111 deleted it
rather than fixing it). Only `usePressScale` is live — a 0.99 press scale deliberately built to be
imperceptible. ⚠️ **That vocabulary was not free:** IMP-077 added `react-native-reanimated` and
`react-native-worklets` as **native** deps and forced the vc14 build. **This parked row is the only thing
that ever makes that cost worth paying.**

⚠️ **`stagger` is unused — do not be fooled by `Animated.stagger` in
[`Celebration.js:23`](../src/screens/Celebration.js#L23).** That is React Native's own `Animated` API, a
different function entirely. An audit on 2026-09-10 initially miscounted it as a consumer.

**Where to start when it unparks.** `riseIn` on cards and rows is the default entrance the module was
written around; `popIn` on rewards and badges is generalized from `Celebration.js`, which is the house
motion. ⚠️ **`art.js`, `Celebration.js` and `Toast.js` stay on the RN `Animated` API — coexistence is the
design, not a compromise. Do not port them** ([`motion.js:16`](../src/motion.js#L16)).

**The gate.** "Plus is complete" is the owner's phrase and the owner's call. At minimum that means the
open Plus rows (IMP-108, IMP-109, IMP-110) shipped and WALK-19 finished.
