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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1271 passed, 119 suites** — verified 2026-09-15, after IMP-136), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue

**Two takeable rows, written 2026-09-16 from the owner's first sitting with four real skies on the phone.**
Take IMP-137 first — it is smaller and IMP-138 renumbers test fixtures it touches.

| Row | What | Lane | Take it? |
| --- | --- | --- | --- |
| IMP-137 | The streak numeral stops borrowing the palette over footage — it goes white on the ramp IMP-124 already built | OTA | ✅ **take this first** |
| IMP-138 | Delete the three placeholder skies (`crescent`, `harvest`, `meteor`) and point Sakura Fuji at the day clip; the catalogue becomes Golden Sun + four clips | OTA | ✅ **take second — fully unblocked.** The free tier owning one sky is the owner's ruling, not an open question |
| IMP-128 | Apply the motion vocabulary — `riseIn` on cards and rows, `popIn` on badges, `useCountUp` on the streak | OTA | ⏸ **owner's yes first — do not start** |

✅ **Both of IMP-138's blockers cleared 2026-09-16.** The owner ruled the **free tier owns one sky**, and
uploaded the Sakura Fuji day clip — so the day-clip swap is now **IMP-138 step 5**, with nothing outstanding.

**IMP-124 through IMP-136 are done** (archived to `docs/build-log.md`, commits `87771c4`, `d57dc2d`,
`0502790`, `402391b`, `0a2f595`, `111c3de`, `28654cb`, `bcaebb6`, `c9dc2dc`, `bbb2d20`, `2c2ab5a`).

---

---

### IMP-137 — the streak numeral stops borrowing the palette over footage

**Severity 🎨, lane OTA.** Found by the owner 2026-09-16, on the phone, with four real skies live:
*"the streak number is limited to the colour palette in the app, which means the animated hero skies are
not looking the best."*

**The bug is one prop, and IMP-124 already wrote the rule it breaks.**
[`heroChrome.js`](../src/home/heroChrome.js) says it in its own header: *over footage the answer is a fixed
white ramp that owes nothing to the palette, because the clip owes nothing to it either.* IMP-124 moved the
title, the subtitle, the meta row and the XP figure onto that ramp. **It did not move the numeral.**
[`HomeScreen.js:69`](../src/screens/HomeScreen.js#L69) still paints the biggest element on the screen with
`color={c.accentDeep}` — Golden Hour's `#d97706` — in both grounds. So a 76px amber glyph sits on Aurora's
green, on Starfall's violet and on Sakura's pink, and the user's only lever is to buy a different palette
and re-theme the *whole app* to fix *one number*.

### The decision — lock it, and author the exception ourselves

The owner asked three questions. Answered in order, and the answers are final:

**1. "Do we lock it?" — Yes.** Over footage the numeral goes to the same white ramp as every other glyph in
the card. This is not a new idea; it is finishing IMP-124. **Off footage nothing changes** — the classic
sun/moon grounds keep `c.accentDeep`, because there the ground *is* the palette and the accent is correct.

**2. "Do we add more colours?" — No, and it would not work.** More palette entries is still a palette
entry: any fixed hue is wrong over some clip, and the failure mode is unchanged. It also makes the problem
worse by adding surfaces to get wrong.

**3. "Do we make it customisable for Plus?" — No.** Three reasons, and the third is the real one:
- **It sells a legibility bug.** A user free-picking a hex over moving mid-tone footage will pick an
  unreadable one, and the streak number is the one glyph in this app that must never be unreadable.
- **It undercuts what is already sold.** `SHOP_PALETTES` is a paid surface — eight palettes, two of them
  ember-priced at 420. A free-form colour picker for Plus makes the ember palettes worthless.
- **The palette already IS the customisation,** and it stays in charge of the entire rest of the app. The
  hero over footage is the single surface that is deliberately not the theme. Do not re-open that.

⚠️ **What is NOT this row: per-sky accent on the numeral.** Every video sky already declares an `accent`
(`#6EE7B7`, `#D98A3D`, `#D9578A`, `#C084E8`) and `ProgressBar` already spends it. Putting it on the numeral
was considered and **rejected**: Emberfield's `#D98A3D` is amber over amber embers, which is the exact
contrast failure this row exists to end, and it would make every future sky's ship-readiness depend on a
hand-checked glyph contrast. **The accent stays where it is — one thin bar at the bottom of the card, over
the scrim.** The numeral is white. If a future sky genuinely needs an override, add the field *then*, with
the clip in front of you.

### Steps

1. **[`src/home/heroChrome.js`](../src/home/heroChrome.js)** — the `overVideo` branch gains `numeral:
   '#ffffff'`; the non-video branch gains `numeral: colors.accentDeep`. Extend the existing header comment
   with one line: the numeral was the one glyph IMP-124 left on the palette, and IMP-137 finished it.
2. **[`src/screens/HomeScreen.js`](../src/screens/HomeScreen.js)** — in `heroInner`, the numeral's
   `color={c.accentDeep}` becomes `color={hero.numeral}`. Nothing else in that block moves: not the font
   size, not `NUMERAL_LINE`, not `numeralShadow`, not the `marginTop` maths.
3. **[`__tests__/home/heroChrome.test.js`](../__tests__/home/heroChrome.test.js)** — two cases:
   `overVideo` returns `numeral === '#ffffff'`, and the default branch returns `numeral ===
   colors.accentDeep` for a stub palette. **And one case that is the point of the row:** assert
   `heroChrome(c, { overVideo: true }).numeral` is not equal to any value in the stub palette — the
   regression being guarded is "a palette colour reached the footage", not a literal.
4. `npm test` green (≥ 1271 / 119), `npx expo export --platform android` clean.
5. Commit: `fix(hero): the streak numeral leaves the palette when a sky plays behind it`

**Not in this row.** `ProgressBar`'s accent, `numeralShadow`, the classic grounds, `SHOP_PALETTES`, and any
new user-facing setting. **Walk owed** — [WALK-27](walk-open.md#walk-27--four-skies-and-a-white-numeral).

---

### IMP-138 — the sky catalogue stops shipping placeholders

**Severity 🐛, lane OTA (data + tests only).** Found by the owner 2026-09-16 on the phone, same sitting as
IMP-137. Three of the six rows in `SHOP_SKIES` are not real products:

| Row | What it is now | Ruling |
| --- | --- | --- |
| `crescent` — Crescent Moon | Frozen `NightRays` art, free, in every user's `ownedSkies` by default | **Delete** |
| `harvest` — Harvest Moon | A gradient + a moon glyph, ember-priced at 300, no clip, no design | **Delete** |
| `meteor` — Meteor Shower | A Pexels **ocean** clip in a slot named for meteors | **Delete** |

**Why `meteor` goes rather than gets renamed.** Its own build-log entry already called it temporary:
*"the footage is ocean water in a slot named Meteor Shower. Deliberate and temporary: `meteor` is the only
`tier: 'plus'` slot reachable on a Play build with no dev panel to fake ownership"*
([IMP-123](build-log.md#imp-123--the-first-sky-carries-a-clip-on-its-own-update-channel-2026-09-13)). That
reason is spent — there are now four real Plus skies to test ownership against. A rename would keep a piece
of stock B-roll in a catalogue whose other four clips are generated, owned, and chosen; it would also
*permanently* pin a sky's id to the wrong noun. It goes.

✅ **The free tier owns exactly one sky. The owner ruled on it 2026-09-16, asked directly:** *"Yes the
free tier should have only one sky. We will think about adding free stuff later."* So `crescent` goes with
the other two, `ownedSkies` defaults to `['classic']`, and the Shop's sky list is **one owned row plus four
Plus rows** — Plus becomes the only route to a second sky. **This is decided; do not re-open it, do not
soften it by leaving one of the three placeholders in as a free row, and do not invent a replacement free
sky.** Adding free content later is a separate, deliberate decision the owner has reserved for themselves.

**Nobody loses anything they paid for.** `entitledId(activeSky, ownedSkies, SHOP_SKIES, plus, 'classic')`
already falls back to `'classic'` for an active sky that is no longer in the manifest
([`RitualsApp.js:405`](../src/RitualsApp.js#L405)), and `harvest` is the only deletable row that was ever
purchasable — for embers, never cash. A stale `'harvest'` in a restored `ownedSkies` array is inert: it
matches no manifest row and renders nothing. **No migration is needed and none should be written.**

### Steps

1. **[`src/data.js`](../src/data.js)** — delete the `crescent`, `harvest` and `meteor` entries from
   `SHOP_SKIES`. The list becomes `classic` + the four clip skies. Update the block comment above it: the
   `crescent`-is-frozen-art sentence goes with the row, and the 2026-09-15 provenance paragraph is now
   history — say that the catalogue is Golden Sun plus four cleared clips, and that `Fernlight`,
   `Local Line` and `Tideline` are still permanently blocked.
2. **[`src/RitualsApp.js`](../src/RitualsApp.js)** — `ownedSkies` default `['classic', 'crescent']` →
   `['classic']`. Same edit in [`src/dev/buildState.js:66`](../src/dev/buildState.js#L66).
3. **[`src/shopui.js`](../src/shopui.js)** — `SkyPreview`'s `SKY_BG` loses `moon`, `harvest` and `meteor`;
   the `kind === 'moon' || 'harvest' || 'meteor'` Moon-glyph line goes. The four clip skies all have a
   `poster` and return before any of this; leave the `sun` and `aurora` branches and the star dots alone.
4. **Tests.** These reference deleted ids and must be re-pointed, not deleted — each one is guarding a real
   rule and the rule survives:
   - [`cosmeticEntitlement.test.js`](../__tests__/home/cosmeticEntitlement.test.js) — `harvest` was the
     "an ember-priced sky" fixture. **There is no longer an ember-priced sky in `SHOP_SKIES`**, so point
     these at a `tier: 'plus'` sky (`aurora`) and keep an ember-priced *palette* case for the price path.
   - [`buildState.test.js`](../__tests__/dev/buildState.test.js), [`inspect.test.js`](../__tests__/dev/inspect.test.js) — `sky: 'harvest'` → `sky: 'aurora'`.
   - [`state.test.js`](../__tests__/persistence/state.test.js), [`Shop.test.js`](../src/screens/Shop.test.js) — `['classic', 'crescent']` → `['classic']`.
   - [`skyManifest.test.js`](../__tests__/data/skyManifest.test.js) — the `meteor` case becomes an
     `aurora` case, and gains a **catalogue invariant**: every entry in `SHOP_SKIES` either has a `clip`
     (or a `clipDay`+`clipNight` pair) with a non-empty `credit`, or is `classic`. That one test is what
     stops a placeholder row ever shipping again.
   - [`HomeScreenSkyHero.test.js`](../__tests__/screens/HomeScreenSkyHero.test.js) — its `VIDEO_SKY` stub
     is a hand-written `{ id: 'harvest', ... }` literal that no longer resembles anything; rename its id
     to `aurora` and give it a real `${SKY_BASE}` poster URL.
   - [`gen-screens.js:197-200`](../scripts/gen-screens.js#L197) — the design-system card's video hero is
     `activeSky 'meteor'`; point it at `aurora` and fix the caption string.
5. **Sakura Fuji points at the day clip.** ✅ **Unblocked — the owner uploaded both files 2026-09-16 and
   they are verified live on R2** (`sakurafuji-day.mp4`, 200, 3,336,296 bytes, byte-identical to
   `sky-build/`). In [`src/data.js`](../src/data.js), `sakurafuji`'s `clip` and `poster` swap `-night` for
   `-day`, and its `credit` swaps `sakura blossom night.mp4` for `sakura blossoms.mp4`. **Change nothing
   else on that row** — the `accent`, the `kind` and the `tier` all stand. It stays a **one-clip** sky; see
   the note below for why the two-clip question is deliberately still open.
6. `npm test` green (≥ 1271 / 119 after IMP-137), `npx expo export --platform android` clean.
7. Commit: `fix(skies): drop the three placeholder skies and point Sakura Fuji at the day clip`

**Not in this row.** Pricing, free-tier replacements, and `src/billing/`. **Walk owed** — [WALK-27](walk-open.md#walk-27--four-skies-and-a-white-numeral).

---

### ✅ Sakura Fuji was pointing at the night clip — RESOLVED, folded into IMP-138 step 5

The owner, 2026-09-16: *"Sakura Fuji: I think I messed up. I uploaded the night mode one by mistake."*
**What it actually was — not a mix-up in the data, but a missing object on R2** (the reading that led here,
kept because the diagnosis is the reusable part):

```
aurora.mp4            206  ✅ live
emberfield.mp4        206  ✅ live
sakurafuji-night.mp4  206  ✅ live   <- what src/data.js points at
sakurafuji-day.mp4    404  ❌ never uploaded
starfall.mp4          206  ✅ live
```

`sky-build/sakurafuji-day.mp4` **and** `sky-build/sakurafuji-day-poster.jpg` already exist locally, encoded
2026-09-15 in the same run as the night clip — 1280×1280, 240 frames, 24fps. Nothing needs re-encoding.

✅ **The owner uploaded both files 2026-09-16 and the block is lifted.** Verified from here, not taken on
trust: `sakurafuji-day.mp4` returns **200, 3,336,296 bytes**, and its SHA matches `sky-build/` byte for
byte; the poster is live too. **The data edit is now IMP-138 step 5** and carries no upload dependency.

⚠️ **The rule that produced this block still stands for the next sky:** never point a manifest row at an
object you have not fetched. A missing clip is silent — the poster covers the cold frame forever and
nothing logs an error.

💡 **The two-clip option stays open and is still cheap.** Both clips are encoded and both would then be on
R2, so `clip` → `clipDay` + `clipNight` is a data edit `skyVideoSource` already handles. `skies-route.md`'s
loop-rule table files Sakura Fuji under *daylight-defined → keep both modes*, and the only reason it shipped
as one clip was the 2026-09-15 recommendation that a one-clip sky is a safer object. **Look at the day clip
on the phone first; decide after.**

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
