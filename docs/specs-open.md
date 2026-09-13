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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1241 passed, 117 suites** — verified 2026-09-14, after IMP-130), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue

**IMP-131 is the row to take.** It is a **regression from IMP-130, already shipped to the owner's phone**
(OTA `433eb53`): centring the hero content moved the numeral ~46dp off the fixed focal point of art that
cannot move with it. IMP-128 stays owner-gated.

| Row | What | Lane | Take it? |
| --- | --- | --- | --- |
| IMP-131 | The sunburst lost the numeral — `HERO_BOX` drops `justifyContent: 'center'`, the freed space becomes one spacer that anchors the level/XP row | OTA | ✅ **take it — first and only open row** |
| IMP-128 | Apply the motion vocabulary — `riseIn` on cards and rows, `popIn` on badges, `useCountUp` on the streak | OTA | ⏸ **owner's yes first — do not start** |

**IMP-124, IMP-125, IMP-126, IMP-127, IMP-129 and IMP-130 are done** (archived to `docs/build-log.md`,
commits `87771c4`, `d57dc2d`, `0502790`, `402391b`, `0a2f595`, `111c3de`) — **IMP-130's ruling stands; only
its distribution of the freed space is corrected by IMP-131.**

---

### IMP-131 — the sunburst lost the numeral

🔴 **TAKE THIS ONE.** Severity 🎨 — nothing is broken, the hero's focal point is. **Regression from
[IMP-130](build-log.md#imp-130--the-hero-card-is-one-size-whichever-sky-is-on-2026-09-14) (`111c3de`), already live on
the owner's phone** via the 2026-09-14 OTA (`433eb53`, runtime `1.0.10`, vc17 `internal`).

**What the owner saw** (hardware, night mode, streak 1, 2026-09-14): the rays and the night bloom converge in
a pool of light **above** the numeral, the numeral sits on plain black under it, and the level row and XP bar
sit below where the art ends. IMP-130's own ruling is fine and is **not** reopened — the card does measure
336 on both grounds and the page below it no longer jumps.

**What IMP-130 missed, in one sentence.** The art does not move. `RayFan` and `NightRays` are
`position: 'absolute', top: -70, height: 300` inside the `Card` ([`art.js:34`](../src/art.js#L34),
[`art.js:81`](../src/art.js#L81)), so their focal point is **fixed at card-y 80** whatever the card contains —
and `art.js` says so in its own words: *"Focal point y≈80 from card top (consistent with day hero,
IMP-003)."* The numeral used to land on it **by construction**: flush to `paddingTop: 26`, then
`marginTop: 13`, then half of `lineHeight: 82` → `26 + 13 + 41 = 80`, exactly. IMP-130's
`justifyContent: 'center'` moved the content and left the art behind.

**The arithmetic, both ends.** Inner box `336 − 26 − 22 = 288`. Content
`13 + 82 + 2 + ~20 + 4 + ~16 + 22 + ~17 + 7 + 12 ≈ 195`. Slack ≈ 93, half of it above the content → the
numeral's optical centre lands at ≈ **126**, about **46dp below the light**. The other end of the same sum:
the ray disc stops at `−70 + 300 = 230`, and centring pushed the XP bar's bottom from **221** (inside the
disc) to ≈ **268** (outside it). ⚠️ **So the build-log's line for IMP-130 — *"the numeral sits mid-frame on
both grounds and `RayFan`'s 300dp disc doesn't leave a bare band"* — is inverted on both counts.** This spec
is the correction; do not treat that sentence as a constraint.

**This was visible from the source IMP-130 already quoted.** Its trap 4 wrote down *"`RayFan`/`NightRays` are
absolute at `top:-70`, `height:300` and do not stretch"*, and [WALK-24](walk-open.md#walk-24--one-card-two-grounds)
step 3 wrote down *"the big number sits ~43dp lower in the frame than it did yesterday"* — the two facts were
one subtraction apart and the subtraction was never done. **The rule to carry forward: art that is absolutely
positioned inside a card is a fixed point, so any change to how that card lays out its content is a change to
the relationship between them, and the relationship is the thing to assert.**

---

#### The ruling — and what is NOT reopened

`HERO_HEIGHT` **336 stays**. Both shells stay the same box. **`art.js` stays frozen** — do not nudge the art
down, do not grow the disc, do not restore the old content-sized classic card, and do not re-litigate 336
([`design-queue.md`](design-queue.md) → "The frame"). Two things change, and nothing else:

1. **`justifyContent: 'center'` comes out of `HERO_BOX`.** The numeral block goes back flush to `paddingTop`,
   which puts its optical centre back on 80 by the same construction that put it there in the first place.
2. **The freed space becomes one flex spacer between the numeral block and the level/XP row**, so the meta row
   anchors to the **bottom padding edge** instead of pooling directly under the bar. That is not a consolation
   prize for the space: on the video ground `SkyHero`'s scrim is the **bottom 28%**
   ([`skyHero.js:45`](../src/home/skyHero.js#L45)) — card-y 242→336 — and the meta row is the thing that scrim
   exists to keep legible. Top-aligned as IMP-121 shipped it, the row sat at ~208–221, **above its own scrim**.
   Anchored, it is in it.

---

#### 🔴 Four traps, all read out of source on 2026-09-14

**1. The spacer must be able to collapse to nothing.** Fixed box + `overflow: 'hidden'` + `MAX_FONT_SCALE`
1.5 leaves ~270dp of content in 288dp of box (IMP-130's trap 3 — still true, still tight). `flex: 1` on a
child of a `flex: 1` column collapses to 0 when there is no slack, which is the behaviour this needs. **Give
the spacer `{ flex: 1 }` and nothing else** — no `height`, no `minHeight`. Keep the level block's existing
`marginTop: 22`: at max font scale that margin is the only floor left between the two blocks.

**2. Nothing may be hardcoded to 195, 126, 46 or 268.** Three terms in that sum are React Native's **default**
line heights for `fontSize` 16/13/14 — platform- and font-scale-dependent. They are here to explain the
defect, not to be typed into source or asserted on. Same rule that IMP-130's trap 2 put on ~250.

**3. `art.js` is frozen, so 80 is read, never typed.** Do not export a focal-point constant from `art.js`, do
not copy `-70`/`300` into `HomeScreen.js`, and do not assert `80` as a literal. The test below reads
`top + height / 2` off the **rendered** art wrapper, so the assertion breaks if either side ever moves.

**4. Both shells render `heroInner`, but only one mounts per render.** `getByTestId` is correct and
`getAllByTestId` is not — if a `testID` ever returns two nodes, something has gone wrong with the shell
branch and that is a stop-and-log, not a query to loosen.

---

#### Steps

1. **[`src/screens/HomeScreen.js`](../src/screens/HomeScreen.js), `HERO_BOX`** — delete
   `justifyContent: 'center'`. Nothing else in that object moves. Leave the key off entirely; do **not**
   write `justifyContent: 'flex-start'`.
2. **Same file, `heroInner`** — add `testID="hero-numeral-block"` to the first `View` (the one with
   `marginTop: 13`), and insert a spacer **between** the two blocks:
   `<View testID="hero-spacer" style={{ flex: 1 }} />`.
3. **Same file, both shells** — add `testID="hero-box"` to the `View` that carries `HERO_BOX` (the video
   shell's inner `View` inside `<SkyHero>`, and the classic shell's wrapper around `heroInner`).
4. **Nothing else.** No new file. `art.js`, `skyHero.js`, `heroChrome.js`, `ui.js` and `HERO_HEIGHT` are all
   untouched.

---

#### The proof

A fourth `describe` in [`__tests__/screens/HomeScreenSkyHero.test.js`](../__tests__/screens/HomeScreenSkyHero.test.js)
(it already mocks `activeSkyManifest` both ways and already imports `RayFan`; add `NightRays`). Read the
focal point off the art itself:

```js
const focalOf = (Art) => {
  const { top, height } = StyleSheet.flatten(wrap(<Art />).toJSON().props.style);
  return top + height / 2;                    // -70 + 300/2 = 80 — read, not typed
};
```

Five cases:

1. **`the classic hero's numeral sits on the ray fan's focal point`** — no video sky, `mode="day"`:
   ```js
   const box   = StyleSheet.flatten(view.getByTestId('hero-box').props.style);
   const block = StyleSheet.flatten(view.getByTestId('hero-numeral-block').props.style);
   const num   = StyleSheet.flatten(view.getByText('5').props.style);
   expect(box.justifyContent).not.toBe('center');
   expect(box.paddingTop + block.marginTop + num.lineHeight / 2).toBe(focalOf(RayFan));
   ```
   🔴 **This is the red-before case** — today `justifyContent` is `'center'`.
2. **`night is the same construction`** — `mode="night"`, same assertion against `focalOf(NightRays)`.
3. **`the video shell shares the box`** — video sky active: `hero-box` carries no `justifyContent: 'center'`
   and the same three numbers still sum to `focalOf(RayFan)` (the box is shared; the art is not mounted, which
   is the point — the box must not depend on the ground).
4. **`the spacer can collapse`** — `expect(StyleSheet.flatten(view.getByTestId('hero-spacer').props.style))
   .toEqual({ flex: 1 })`, on both grounds. This is trap 1 made into an assertion.
5. **IMP-130's three height cases stay exactly as they are.** If any of them goes red, stop — the fix has
   moved something it was told not to move.

**Expect 1245 passed, 117 suites** (was 1241/117, +4 tests, no new suite). If the count lands anywhere else,
**stop and log it to `PROGRESS.md` → Open items** rather than adjusting the test.

🔴 **Green proves the arithmetic, not the picture.** Jest has no layout engine — all of the above is a sum of
declared style numbers matched against a declared art offset. Whether the card now reads as a composition is
[WALK-24](walk-open.md#walk-24--one-card-two-grounds), on a device, re-scoped by this spec.

---

#### The commit

```
fix(home): the sunburst converges on the numeral again (IMP-131)

IMP-130 centred the hero's content in a 336dp box, but RayFan and NightRays
are absolute at top:-70 with a focal point fixed at card-y 80, so the rays
and the night bloom ended up ~46dp above the numeral and the meta row ended
up below the art entirely.

The content goes back flush to paddingTop, which puts the numeral's optical
centre back on 80 by construction (26 + 13 + 82/2), and the freed space
becomes one flex spacer that anchors the level/XP row to the bottom padding
edge -- where SkyHero's bottom-28% scrim already is.

HERO_HEIGHT (336) and art.js are untouched: IMP-130's ruling stands, only
its distribution of the freed space changes.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

**No `Release-Lane:` trailer** unless the owner asks in that chat. ⚠️ **It will want one soon** — the
regression is live on the owner's phone, and this fix is pure JS on runtime `1.0.10`, so it is OTA-able the
moment it is green. That call is the owner's.

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

