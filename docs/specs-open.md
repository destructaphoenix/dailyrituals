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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1238 passed, 117 suites** — verified 2026-09-13), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue

**IMP-130 is the row to take.** It was specced 2026-09-14 and is **not gated** — a build chat opens
[its heading](#imp-130--the-hero-card-is-one-size-whichever-sky-is-on) and nothing else in this file.
**IMP-128 stays owner-gated** and is not a build chat's to take.

| Row | What | Lane | Take it? |
| --- | --- | --- | --- |
| IMP-130 | The hero card is one size, whichever sky is on — both shells render at `HERO_HEIGHT`, content centred | OTA | ✅ **yes — this is the first ⬜ row** |
| IMP-128 | Apply the motion vocabulary — `riseIn` on cards and rows, `popIn` on badges, `useCountUp` on the streak | OTA | ⏸ **owner's yes first — do not start** |

**IMP-124, IMP-125, IMP-126, IMP-127 and IMP-129 are done** (archived to `docs/build-log.md`, commits
`87771c4`, `d57dc2d`, `0502790`, `402391b`, `0a2f595`).

---

### IMP-130 — the hero card is one size, whichever sky is on

**Severity 🎨** — nothing is broken; the card is the wrong shape. **Lane: OTA** — pure JS layout, no native
change, no `versionCode` bump. Found live during
[WALK-22](walk-open.md#walk-22--the-day-mode-hero-re-check), 2026-09-14 (device, owner-run), and specced
2026-09-14 from source.

**The defect, stated as the rule the app broke.** A sky is a **cosmetic** choice. **A cosmetic choice must
not relayout the screen.** Applying Meteor Shower today makes the streak hero ~86dp taller and pushes every
card below it down the page; switching back to the default pulls them up again. That is what the owner saw
— not a hero that is wrong, but two heroes that are different, and a page that jumps between them.

**Where the ~86dp came from.** [`HomeScreen.js:99`](../src/screens/HomeScreen.js#L99) gives the video shell
`height: HERO_HEIGHT` (336, [line 34](../src/screens/HomeScreen.js#L34));
[`HomeScreen.js:107`](../src/screens/HomeScreen.js#L107) gives the classic shell **no height at all**, so it
sizes to `heroInner` plus its own 26/22 padding. The two agreed until 2026-09-13:
[IMP-125](build-log.md#imp-125--the-candle-count-sits-with-the-week-it-protects-2026-09-13) pulled
`<StreakFreeze>` out of `heroInner`, which is **shared by both shells**, so both lost the same ~73dp of
content — the classic card shrank by it and the video card, being fixed, did not. IMP-125's note recorded
`HERO_HEIGHT` as deliberately untouched and was right to leave it to a design session. **This is that
session.**

---

#### The ruling, part 1 — 336 stays, and the classic card grows to meet it

**336 is not a number someone picked. It is the contract the entire sky asset pipeline is derived from.**
[`design-queue.md` → "The frame — measured from the hero box, not guessed"](design-queue.md) measures the
hero box as **the card's full width × 336dp** and builds everything downstream on it:

- the box-aspect table — **0.83** (small phone) to **1.17** (large phone) — and its conclusion, *"the box is
  near-square"*;
- **"generate square"**: a 1:1 source survives **83–86%** of the `cover` crop, which is the whole reason the
  encode recipe is **1280 × 1280**;
- the crop safe zone — keep anything essential inside a **centred 83% × 86%** region;
- the scrim rule — *"the bottom **~28% (96 of 336dp)** sits under a scrim"*, so keep the centre quiet.

Shrinking `HERO_HEIGHT` to the classic card's content height takes the Pixel-class box from **371 × 336
(aspect 1.10)** to roughly **371 × 250 (aspect 1.48)** — off the bottom of that table entirely. A 1:1 source
would then survive about **68%** of the crop instead of 86%: a third of every sky frame generated, encoded
and downloaded, thrown away at draw time. Every figure quoted above becomes wrong for the clips **already
encoded against it** — IMP-121's fixture, `meteor`'s shipped loop (IMP-123), and the `Emberfield` /
`Starfall` heroes still in the art queue.

**The classic card's ~250dp is not a design decision. It is IMP-125's residue.** The pinned number wins.

⚠️ **This does not re-open IMP-125.** The candles stay in the week-strip footer where the owner put them.
This row only decides what the hero does with the space they left behind.

#### The ruling, part 2 — the freed space is distributed, not pooled at the bottom

Growing the classic card to 336 with its content still top-anchored would leave ~86dp of bare `surface`
under the XP bar, **and the classic art will not cover it**: [`art.js:34`](../src/art.js#L34) renders
`RayFan` at `position: 'absolute', top: -70` with `height: size` (300), so it reaches y≈230 of 336 and
**does not stretch with its parent**. An empty band under the fan reads as a bug, and it is precisely the
thing the owner would look at next.

So the shared content box gains **`justifyContent: 'center'`**. The numeral block moves down ~43dp into the
middle of the frame — where `design-queue.md`'s own art direction already assumes it sits (*"the streak
number sits mid-frame"*) — and the XP bar lands **inside** the bottom-28% scrim instead of on its edge,
which over footage is a small legibility gain, not a loss.

⚠️ **Do not retune `heroInner`'s internal margins** (`marginTop: 13`, `marginTop: 22`, `marginBottom: 7`) to
"rebalance" the card. Centring is the entire adjustment. Those margins are shared with the video shell,
which **WALK-22 passed on hardware four hours ago** — do not put that result back in play.

⚠️ **Do not touch `art.js`.** `RayFan` / `NightRays` are frozen art (`playbook.md` → Claude Design standing
rule #3). Scaling the fan to fill 336dp is a different and larger row, and it is not wanted here.

---

#### 🔴 Read this before step 1 — four traps, all verified in source on 2026-09-14

**1. "Just let the video card size to its content instead" is not available.**
[`skyHero.js`](../src/home/skyHero.js) returns `<View style={StyleSheet.absoluteFillObject}>` and renders
`children` **inside** it. An absolutely-positioned subtree contributes nothing to its parent's height, so
the video `Card` **can never** size to its content without restructuring `SkyHero`'s contract (flow children
beside absolute video/poster/scrim layers). **Do not attempt that here.** This is why `HERO_HEIGHT` exists
at all, and the symmetry it buys is what this row is protecting.

**2. ~250dp is an estimate, and nothing may be hardcoded to it.** It is
`26 + 13 + 82 + 2 + ~21 + 4 + ~17 + 22 + ~19 + 7 + 12 + 22` plus 2px of border — and three of those terms
are React Native's **default** line height for a `<T>` with no explicit `lineHeight`, which is font-metric
dependent and not computable from source. **This spec never needs that number**; both cards get 336. If a
step tempts you to introduce a second height constant, you have left the spec — **STOP and log it**.

**3. Fixed height + `overflow: 'hidden'` + font scale.** `MAX_FONT_SCALE` is **1.5**
([`ui/textScale.js`](../src/ui/textScale.js)) and both shells already carry `overflow: 'hidden'`. The
scalable text in `heroInner` is ~139dp of the box, so at the cap the content runs to roughly **270dp**
against **336 − 48 = 288dp** of usable box. It fits — but not by much. **Do not add a scale-reactive
height**; that is `PixelRatio` plumbing this row does not want, and it is a walk's question, not jest's.
The video shell has carried this exposure since IMP-121; this row extends it to the classic shell,
knowingly, and WALK-24 step 4 looks at it.

**4. The existing hero tests query by text, not by layout.**
[`HomeScreenSkyHero.test.js`](../__tests__/screens/HomeScreenSkyHero.test.js)'s seven cases flatten
`props.style` on **text nodes** and read `ProgressBar`'s props; **none of them asserts a height**, so none of
them should move. **If one does move, you changed something this spec did not ask for** — stop and log it
rather than updating the assertion.

---

**Steps.**

1. **`HomeScreen.js` — one shared content-box style, at module scope.** Directly under `HERO_HEIGHT`
   ([line 34](../src/screens/HomeScreen.js#L34)), add:

   ```js
   // Both hero shells are the same box — only the ground behind them differs.
   // The height is pinned to the sky-clip crop (design-queue.md → "The frame"),
   // so the classic card's content does not get to decide it (IMP-130).
   const HERO_BOX = { flex: 1, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 22, alignItems: 'center', justifyContent: 'center' };
   ```

2. **The video shell** ([`HomeScreen.js:99`](../src/screens/HomeScreen.js#L99)) keeps
   `<Card style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>` and gains `testID="streak-hero"`. Its inner
   `<View>` drops its inline style in favour of `style={HERO_BOX}` — which is **the same object it already
   had, plus `justifyContent: 'center'`**, and nothing else.

3. **The classic shell** ([`HomeScreen.js:107`](../src/screens/HomeScreen.js#L107)) becomes structurally
   identical to the video shell, so the two differ in **ground alone**:

   ```jsx
   <Card testID="streak-hero" style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
     {mode === 'night' ? <NightRays /> : <RayFan />}
     <View style={HERO_BOX}>{heroInner}</View>
   </Card>
   ```

   ⚠️ **`RayFan` / `NightRays` stay direct children of the `Card`, before the box.** They are
   `position: 'absolute'` and must keep the **card** as their containing block, not the padded box — moving
   them inside `HERO_BOX` shifts the fan by the padding and is a visible regression.

   ⚠️ `Card` spreads unknown props onto its `View` ([`ui.js:45`](../src/ui.js#L45)), so `testID` passes
   through with **no change to `ui.js`**.

4. **Tests — extend [`__tests__/screens/HomeScreenSkyHero.test.js`](../__tests__/screens/HomeScreenSkyHero.test.js),
   do not start a new suite.** It already mocks `activeSkyManifest` both ways, which is exactly the fixture
   this needs. Add one `describe` with three cases, in the file's existing idiom
   (`StyleSheet.flatten(view.getByTestId('streak-hero').props.style)`):
   - with a video sky active, the hero card's height is **336**;
   - with **no** video sky, the hero card's height is **336** too — **this is the case that is red before
     step 3**, and it is the row's regression guard;
   - the row's actual claim: render both grounds and assert the two heights are **equal**.

**Ship.** `npm test` green (≥ **1238 passed, 117 suites**; expect **1241 / 117** — +3 tests, no new suite),
`npx expo export --platform android` clean, then commit with **exactly**:

```
fix(home): the hero card is one size, whichever sky is on (IMP-130)
```

OTA — pure JS, **no `versionCode` bump**, and **no `Release-Lane:` trailer** unless the owner asks to ship.

**Its runtime proof is [WALK-24](walk-open.md#walk-24--one-card-two-grounds), a device row filed with this
spec.** 🔴 **A green suite proves the number, not the picture.** The assertion above proves both cards
measure 336dp; **it cannot see** whether the centred numeral sits right on the classic card, whether
`RayFan`'s 300dp disc now leaves a visible void in the lower third, or whether the footage still reads at
336 with the content sitting lower inside it. Those are WALK-24's questions, and they are why this row is
not finished at green.

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

