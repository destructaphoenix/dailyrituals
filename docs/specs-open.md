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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1164 passed, 104 suites** — verified 2026-09-10), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue — one row open

| Row | What | Severity |
| --- | --- | --- |
| ⬜ **IMP-119** | IMP-117 deleted the one line that optically centred the ember pill's `+`. It is now off-centre at **every** font size, including default — and a test pins the regression in place. | 🟠 **shipped cosmetic regression** |

**IMP-118 is done** — archived in [`docs/build-log.md`](build-log.md#imp-118-a-tied-weekday-no-longer-draws-as-an-empty-bar-2026-09-11), commit `dc22e32`.

---

## IMP-119 — the ember pill's `+` lost the line that centred it

**Found by:** the device sitting plan, **Sitting 1, 2026-09-11, owner-run, real hardware.** This is a
**regression introduced by [IMP-117](build-log.md#imp-117)** (`a59aea9`), not a survival of the bug IMP-117
was opened to fix.

**What was seen.** The `+` in the ember balance pill is off-centre in its circle **at max font AND at
default font**. The owner's words: *"off center in max font AND even in the default font. Something
clearly went wrong here."* The **custom-mood emoji circles — the other half of IMP-117 — are correct at
both font sizes**, confirmed in the same sitting. So IMP-117 half-worked: it fixed the emoji circles and
broke the pill.

⚠️ **[WALK-08](walk-open.md#walk-08--font-scale) closed on 2026-09-11 claiming the exact opposite** —
*"the ember pill's `+` sits centred in a circle that grew with the glyph."* That was an **emulator**
judgement, by eye, on a 17dp circle. The device overrules it. See the corrected row in `walk-open.md`.

### The cause — one deleted declaration

IMP-117 made **two** changes to [`shopui.js`](../src/shopui.js) `EmberPill`. Keep the first, undo the second.

1. ✅ **RIGHT, and it stays.** The circle now scales with the font:
   `const plusSize = 17 * Math.min(PixelRatio.getFontScale(), CHROME_FONT_SCALE)`. That was the genuine
   max-font fix and it is doing its job.
2. 🔴 **THE REGRESSION.** `lineHeight: 15` was **deleted** from the `+` glyph's `<T>`, leaving a bare
   `fontSize: 13`.

```diff
-<T … style={{ fontSize: 13, lineHeight: 15 }}>+</T>
+<T … style={{ fontSize: 13 }}>+</T>
```

**That `lineHeight` was load-bearing, not decoration.** A `+` does not sit at the centre of its own line
box: it is drawn above the baseline, and a line box taken from the font's natural metrics reserves
descender space *below* the baseline that a `+` never occupies. `justifyContent: 'center'` centres the
**line box**, not the ink — so once the box regained its natural descender slack, the visible glyph rode
high. `lineHeight: 15` against `fontSize: 13` had tightened that box and pulled the glyph back to optical
centre. Deleting it restored the asymmetry at **every** scale, which is exactly the owner's report.

**This is also why the emoji circles are fine and the `+` is not** — an emoji fills its em box, so centring
its line box centres the glyph. A punctuation glyph does not. The two halves of IMP-117 were never the
same problem, and applying one remedy to both is what broke this one.

### The fix

Restore a `lineHeight`, but **derive it from the same scale factor the circle already uses**, so it can
neither clip at max font (IMP-117's original complaint) nor decentre at default (this row):

```js
const fontScale = Math.min(PixelRatio.getFontScale(), CHROME_FONT_SCALE);
const plusSize  = 17 * fontScale;
…
<T d w={800} color={c.onAccent} maxFontSizeMultiplier={CHROME_FONT_SCALE} numberOfLines={1}
   style={{ fontSize: 13, lineHeight: 15 * fontScale }}>+</T>
```

The 13/15 ratio is the proportion that shipped correctly for the whole life of the pill before `a59aea9`.
Scaling both by one factor preserves it at every font size.

⚠️ **Do NOT centre it with `marginTop` / `paddingBottom`.** A fixed dp nudge does not scale with the font,
which is the precise shape of the bug IMP-117 existed to remove. Whoever reaches for a margin here is
reintroducing IMP-117 to fix IMP-119.

### ⚠️ A test currently pins the regression in place

[`__tests__/ui/EmberPill.test.js`](../__tests__/ui/EmberPill.test.js) asserts the deletion:

```js
test('the "+" text carries no literal lineHeight', () => {
  expect(SRC).not.toMatch(/fontSize: 13, lineHeight: 15/);
});
```

**That test was written to lock in the defect and it must be rewritten**, not worked around — require a
*scaled* lineHeight rather than the absence of one. A change that leaves this assertion standing has not
fixed the row. The sibling assertion (`plusSize` derives from the capped font scale) is correct — keep it.

### Tests

- Rewrite the assertion above to demand `lineHeight: 15 * fontScale` (or whatever the final expression is).
- Keep the `plusSize` assertion unchanged.
- ⚠️ **jest renders a tree, not pixels.** These stay source assertions; they cannot prove centring. The real
  acceptance is the walk — **and this row has now been called wrong once from an emulator, so the walk is
  `device`, not `emulator`.**

### The walk it owes

Fold into the **Sitting 1 optional add-on**, which already has the owner in the Shop at two font sizes.
**What to see:** the `+` sits optically centred in its circle at default font *and* at max font, and the
emoji circles stay correct.

### Commit message (exact)

```
fix(a11y): the ember plus keeps a lineHeight that scales with it (IMP-119)
```

---



**IMP-117 is archived** in [`docs/build-log.md`](build-log.md#imp-117), commit `a59aea9` — but **half of it
regressed and is reopened as [IMP-119](#imp-119) above**; read that row before touching `EmberPill`. The
lapse sitting that opened IMP-114 through IMP-117 is otherwise closed. **IMP-118 is done** (commit
`dc22e32`, archived in `docs/build-log.md`). **One open spec remains: [IMP-119](#imp-119)** — take that,
not the parked phase ladder (8 / 10b / 11, in `docs/playbook.md`), which still needs the owner before anyone
opens it.

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

**Owner: *"some time later when plus is complete I can work on the motion."* NOT A ROW YET. Do not open a
number for it and do not start it — Plus is not complete.** [IMP-111](build-log.md) (removing `ScreenFade`)
is done — archived in `docs/build-log.md`.

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

