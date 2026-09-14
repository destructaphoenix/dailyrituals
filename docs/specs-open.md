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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1252 passed, 117 suites** — verified 2026-09-14, after IMP-134), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue

**One row is open.** IMP-131, IMP-132, IMP-133 (the sunburst regressions) and IMP-134 (the frozen card) are
all done; IMP-128 stays owner-gated.

| Row | What | Lane | Take it? |
| --- | --- | --- | --- |
| **IMP-135** | **Screen cards that render from the shipped code** — `react-native-web` instead of a screenshot, so a design surface can never go stale again | **tooling** (ships nothing) | ✅ **TAKE THIS ONE** |
| IMP-128 | Apply the motion vocabulary — `riseIn` on cards and rows, `popIn` on badges, `useCountUp` on the streak | OTA | ⏸ **owner's yes first — do not start** |

**IMP-124 through IMP-134 are done** (archived to `docs/build-log.md`, commits `87771c4`, `d57dc2d`,
`0502790`, `402391b`, `0a2f595`, `111c3de`, `28654cb`, `bcaebb6`, `c9dc2dc`).

---

### IMP-135 — screen cards that render from the shipped code

**Severity 🎨 · Lane: tooling — ships nothing to a user.** No app behaviour changes, no OTA. ⚠️ **One file
under `src/` moves and nothing else in the app is touched** (Step 3), and even that is a pure extraction.

**Why this exists, in the owner's words:** *"I want to know if Claude Design has all the updated screenshots
so it can build on top of those, or does it have the code to build it directly."* **Today it has neither.**
The 14 baselines were deleted 2026-09-14 because the app had outrun them, and a design project holds HTML
cards, never `src/`. The only current, screen-level truth reaches Claude Design **inside a request**, pasted.

**What this row changes.** A screen card becomes **generated from the shipped code**, like `tokens/` and
`frozen/` already are. It cannot go stale, because there is nothing to re-capture — regenerate and it is
current. And because the output is HTML in the project, **Claude Design can read and edit the real screen**
rather than imagining it from a paste. This is the permanent end of the class of problem that cost a day.

⚠️ **A generated card is not a photograph, and the card must say so.** `react-native-web` is a faithful
*layout*, not a device: shadows, real font metrics and the video hero all differ. **Device captures remain
the ground truth for the Play listing** — that is [WALK-25](walk-open.md#walk-25--recapture-the-shot-set),
and the two coexist on purpose. `baselinePages()` stays exactly as it is for that.

#### What was verified before this spec was written — do not re-derive it

| Question | Answer, checked 2026-09-14 |
| --- | --- |
| Is `react-native-web` available? | ✅ `^0.21.0`, already a dependency, with `react-dom` 19.1.0. |
| Can it server-render outside a bundler? | ✅ `require('react-native-web/dist/cjs/exports/AppRegistry').default.getApplication` resolves and is a function in plain node. |
| Does `react-native-svg` have a web build? | ✅ `lib/commonjs/ReactNativeSVG.web.js` + `elements.web.js`. |
| How big is the native surface to stub? | **Small.** Across every screen, `src/home/` and `src/ui.js`, the only non-relative imports are `react-native`, `react-native-svg`, `react-native-reanimated` (2 files), `expo-linear-gradient` (2), `react-native-safe-area-context` (1) and `expo-video` (1). |
| Where does a fixture come from? | ✅ `buildScenario(key, today)` / `buildState(knobs, today)` in [`src/dev/`](../src/dev/buildState.js) are **pure functions**, and `storeShots` is the same fixture the Play screenshots use: 128 streak, 210 entries, "Sam", 2,400 embers, owns everything. |

#### Step 1 — a new script, because the existing stub must not change

Write **`scripts/gen-screens.js`**. Do **not** extend `gen-design-system.js`: its require hook maps every RN
`View` to an SVG `<g>` and **deliberately drops position and size**, which is correct for rasterising
artwork and fatal for rendering a screen. The two mappings cannot coexist in one process. Two scripts, two
hooks, one output directory.

Reuse the babel require hook from `gen-design-system.js:36` verbatim (ESM + JSX for anything under `src/`).
Then map:

| Request | Maps to |
| --- | --- |
| `react-native` | `react-native-web/dist/cjs` |
| `react-native-svg` | `react-native-svg/lib/commonjs/ReactNativeSVG.web.js` |
| `expo-video` | a stub: `useVideoPlayer()` returns `{ status: 'idle', loop: false, muted: true, play(){}, addListener: () => ({ remove(){} }) }`; `VideoView` renders nothing. **This is deliberate and it is the right picture** — [`SkyHero`](../src/home/skyHero.js) holds its poster over any frame that is not `readyToPlay`, so the card shows the **poster**, which is exactly what a still of a video sky should be. |
| `expo-linear-gradient` | a `View` whose style carries the equivalent CSS `linear-gradient`. |
| `react-native-safe-area-context` | `SafeAreaProvider` passthrough; `useSafeAreaInsets()` → zeros. |
| `react-native-reanimated` | no-op identity stub. Six of eight `motion.js` exports have no consumer and the live one (`usePressScale`) is a 0.99 press scale, so **there is nothing here worth rendering** — see IMP-128. |

Render with `AppRegistry.registerComponent` + `getApplication(...)`, which returns `{ element, getStyleElement() }`;
emit `renderToStaticMarkup(element)` plus that style element. **Take the app's fonts from
`componentFonts()` in the existing generator** rather than inventing a second embed path.

#### Step 2 — Home, and only Home

**Scope is one screen on purpose.** Home is the hardest one in the app — frozen SVG art, the video shell, a
gradient scrim, a fixed-height card and two grounds. **If Home renders, the rest are prop-mapping.** The
remaining six are a follow-up row and must not be smuggled into this one.

Emit **`design-system/screens/home-day.html`** and **`home-night.html`**, each carrying a first-line
`<!-- @dsCard group="Screens" ... -->` marker (that is how the pane indexes a card — see any existing file),
inside a 360dp-wide phone frame. Each card shows **both grounds**: the classic `RayFan`/`NightRays` hero and
the video hero on its poster, because [D-15](../docs/design-queue.md) turns on the difference between them.

The card's copy must state, in its own words: **this is a layout render, not a device capture**; what
differs (shadow rendering, font metrics, no video playback); and that the fixture is `storeShots`.

#### Step 3 — the prop mapping, and the guard that keeps it honest

`HomeScreen` takes ~25 props, wired in [`RitualsApp.js:959`](../src/RitualsApp.js#L959). **Copying that
wiring into a script creates a second source of truth that will drift** — that is the one real risk in this
row, so it gets a test rather than a comment.

Put the mapping in **one exported function**, `homePropsFromState(state)`, in `scripts/screenFixtures.js`,
fed by `buildScenario('storeShots', <a fixed date>)`. **Pin the date** — a fixture built from `new Date()`
makes every regeneration a diff. Callbacks map to no-ops.

**The guard test** (new file, `__tests__/scripts/genScreens.test.js`): parse `HomeScreen.js`'s default
export with `@babel/core` (already a dependency), read the **destructured prop names** from its signature,
and assert `homePropsFromState` supplies every one of them. **A prop added to or renamed on `HomeScreen`
then fails this test** instead of quietly rendering a screen with a hole in it. Verify it red by adding a
throwaway prop to the screen's signature before you trust it.

Add one rendering assertion too: the generated `home-day.html` contains the hero at `HERO_HEIGHT` from
[`heroFrame.js`](../src/home/heroFrame.js) — **imported, never typed** — so IMP-134's rule holds here too.

#### Step 4 — the docs the next chat reads

- `docs/design-queue.md` → "What the design system actually has": the Now/Soon/Never-again table gains the
  generated cards, and D-15's row notes that its screen is now **in** the project rather than pasted.
- `docs/playbook.md` → standing rule 1 currently says *"there are no baselines — paste source"*. It becomes:
  paste source for a screen with no generated card; **for one that has a card, point at the card.**

#### Done means

`npm test` green and **≥ 1252 passed, 117 suites** (IMP-134's count), `node scripts/gen-screens.js` clean,
both cards committed, and `npx expo export --platform android` clean — **that last one is not ceremony:** it
is what proves Step 3's `src/dev/` import stayed in `scripts/` and never reached the app bundle.

**Commit message, exactly:**

```
feat(design-system): screens render from the code, not from a screenshot (IMP-135)
```

**No `Release-Lane:` trailer** — the app bundle is byte-identical.

⚠️ **Not in this row:** the other six screens (follow-up), pushing to the live project (`DesignSync`, a
separate act — and it needs **no** `/design-login`, that claim was wrong), and anything that touches how the
app itself renders. **If a screen will not render without changing app code, STOP and log it** — the app
does not bend for the tooling.

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
