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

## The queue — one row, opened 2026-09-11 by WALK-08

| Row | What | Severity |
| --- | --- | --- |
| ⬜ **IMP-118** | A weekday with entries every single week draws as an **empty bar** whenever its top mood ties — and the card directly above it says the opposite. | 🔴 **the screen contradicts itself** |

---

## IMP-118 — a tied weekday is not an empty weekday

**Found by:** [WALK-08](walk-open.md), 2026-09-11, emulator, agent-run — at max font, but **this is not a
font bug and it reproduces at every font size.**

**What was seen.** On the Insights tab with a 460-entry journal, "Moods by weekday" drew bars on
**Saturday and Sunday only**. The "Weekly rhythm" card **immediately above it on the same screen** showed
**Monday–Friday** as the fullest days. One screen, two cards, opposite claims about the same journal.

**The cause, established by running the shipped function over the fixture rather than by eye:**

```
label  total  top       n          <- bar height is (n / weekdayMax) * 100%
M       66    null      0
T       66    null      0
W       66    null      0
T       66    null      0
F       66    null      0
S       65    Heavy     9
S       65    Hopeful   9
```

[`deeper.js`](../src/insights/deeper.js) `moodByWeekday` builds each bucket as
`{ l, top: null, n: 0, total: 0 }`, then assigns `top` and `n` **only when one mood wins outright**:

```js
const winners = ranked.filter(([, n]) => n === maxN);
if (winners.length === 1) { b.top = winners[0][0]; b.n = maxN; }
```

On a tie both stay at their initial values, so `n` is `0` — and
[`DeeperInsights.js:83`](../src/screens/DeeperInsights.js#L83) sizes the bar as
`` height: `${(d.n / weekdayMax) * 100}%` ``. **A weekday with 66 entries and a tied top mood renders
pixel-identical to a weekday the user has never written on.**

⚠️ **`top: null` on a tie is CORRECT and deliberate** — it is pinned by an existing test
(`__tests__/insights/deeper.test.js`, *"returns top: null on a tie"*). **Do not change that.** Refusing to
crown a winner that does not exist is the honest answer; drawing that refusal as *nothing* is the defect.

⚠️ **Ties are not a fixture artifact.** They are **most** likely on a young journal: two Mondays with two
different moods already tie. This gets worse the fewer entries a user has, which is exactly backwards.

**The fix, and why it is one line.** The renderer **already** has a branch for a bar with no winner:

```js
backgroundColor: d.top ? c.accent : c.accentSoft,
borderWidth: d.top ? 0 : 1,
borderColor: c.border,
```

That soft, outlined style exists for precisely this case and is **currently unreachable**, because a
null `top` always arrives with `n: 0` and therefore zero height. The data layer just never hands it a
height. So: give the bucket its height on a tie and leave `top` alone.

### Steps

1. In [`src/insights/deeper.js`](../src/insights/deeper.js), `moodByWeekday`: set `b.n = maxN`
   **unconditionally** whenever the weekday has any moods at all, and keep assigning `b.top` **only** when
   `winners.length === 1`. A weekday with no entries keeps `n: 0` and draws nothing, which is correct and
   is what makes the two states distinguishable.
2. Do **not** touch [`DeeperInsights.js`](../src/screens/DeeperInsights.js). Its soft/outlined branch
   becomes reachable on its own, and that is the whole visual fix: a tied weekday now draws a bar of the
   right height, outlined rather than filled, with no emoji under it.
3. Do **not** touch `moodByMonth` or `moodPairings`. Neither has this shape.

### Acceptance

- The existing *"returns top: null on a tie"* test still passes **unchanged** — prove it red-first by
  asserting the new `n` behaviour before writing step 1.
- New tests in `__tests__/insights/deeper.test.js`:
  - a tie returns `top: null` **and** `n === maxN` (the tied count), not `0`;
  - a weekday with **no** entries still returns `top: null` **and** `n === 0` — this is the assertion that
    keeps the two states distinguishable, and it is the point of the whole row;
  - a clear winner is unchanged.
- ⚠️ **jest renders a tree, not pixels.** The bar heights are not provable here; what is provable is that
  the two states now carry different numbers. The visual half re-runs in the walk below.

### The walk it owes

A new **WALK-21** row is NOT needed — fold it into WALK-08's re-run, which needs the same setup: technique
**T3**'s throwaway `twoYears` scenario (it was reverted after the 2026-09-11 sitting, so re-add it), OS
font scale anything, Insights tab. **What to see:** every weekday that the "Weekly rhythm" card shows as
busy now draws a bar in "Moods by weekday" too — outlined with no emoji where the moods tie, filled with an
emoji where one wins. **The two cards must stop contradicting each other.**

### Commit message (exact)

```
fix(insights): a tied weekday draws its bar instead of vanishing (IMP-118)
```

---



**IMP-117 (the last row, at max font the ember pill's `+` and the custom-mood emoji circles were
off-centre) is done and archived** in [`docs/build-log.md`](build-log.md#imp-117), commit `a59aea9`. The
lapse sitting that opened IMP-114 through IMP-117 is fully closed — all four are archived. **One open spec
remains: [IMP-118](#imp-118) above**, opened 2026-09-11 by WALK-08 — take that, not the parked phase ladder
(8 / 10b / 11, in `docs/playbook.md`), which still needs the owner before anyone opens it.

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

