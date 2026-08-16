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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **860 passed, 84 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane | From |
| --- | --- | --- | --- |
| IMP-074 | [The Paywall footer survives the first measure pass](#imp-074--the-paywall-footer-survives-the-first-measure-pass) | OTA | WALK-07 (a), reopened |

> **IMP-073 landed 2026-08-16** (`67d0736`) and is archived in `docs/build-log.md`. **IMP-074 came out of a
> walk, not a feature idea** — the WALK-07 re-run, 2026-08-16. **🎨 lane: it does not gate the release
> build.** The 🚦 walks in [`walk-open.md`](walk-open.md) still gate it. It can land after the build and ride
> an OTA instead — **but it may not be half-landed across the bump.**
>
> **IMP-057 is still deliberately absent.** It is reserved for the historical `dayKey` migration IMP-056
> deferred, and it cannot be written until a real device's numbers come back from the dev-panel Inspector's
> "Data health" reporter IMP-056 added. **Do not reuse the number.**
>
> **This spec is code-complete at green tests. It does not end in a walk.** A build chat and a
> runtime walk are **two different tasks for two different chats** — where a fix needs runtime proof, the
> spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
> build chat**, and do not read a missing walk as an unfinished spec.

---

## IMP-074 — the Paywall footer survives the first measure pass

**Lane: OTA.** No native change, no bump.
**Runtime proof: WALK-07**, re-run whole — not this chat. The walk was paused mid-run when this surfaced, so
its other five screens and the IMP-067 spot-check are outstanding too; that is the walk chat's problem, not
this one's.

**Why.** WALK-07 re-run, 2026-08-16. **IMP-068's fix is real but only half the mechanism**, and this is the
second design pass on the same six lines — worth knowing before you touch them.

IMP-068 added `style={{ flex: 1 }}` to Paywall's `ScrollView`
([`Paywall.js:46`](../src/screens/Paywall.js#L46)), which fixes the *static* case: a `ScrollView` with only a
`contentContainerStyle` lays out at full content height and the fixed footer sibling draws over its tail.
That reasoning was correct and the line stays.

What it missed is that **`flex: 1` only bounds a child if the parent is itself bounded**, and on Android
`Modal` is a `Dialog` whose window size is not known on the first measure pass. Paywall is mounted inside
exactly such a modal ([`RitualsApp.js:902-907`](../src/RitualsApp.js#L902)). So on that first pass the outer
`View`'s `flex: 1` resolves against nothing, the column sizes to its content, and `flex: 1` on the
`ScrollView` divides an unbounded height.

**Observed live, and the two symptoms are the same bug at two moments:** open the Paywall → **the footer is
missing entirely** (pushed off-screen below the unbounded scroll area). Select a plan — any re-render — → a
correcting layout pass fires, the footer returns, and it **overlaps the price and the last perks exactly as
it did before IMP-068**. IMP-068 fixed the frame after the correction; nothing fixed the frame before it.

`Shop.js` already hit this trap, documented it in nine lines of comment, and works around it
([`Shop.js:23-29`](../src/screens/Shop.js#L23) and [`:52`](../src/screens/Shop.js#L52)). Paywall is the same
shape — direct child of a `ThemeContext.Provider` inside an `overFullScreen` `Modal` — and never got the
same guard.

### Decided design — do not re-litigate

**1 · Both guards, not one. `flex: 1` on the `ScrollView` stays.** They are not alternatives and neither is
redundant: `maxHeight: winH` bounds the column from the very first pass, and `flex: 1` is what then hands the
leftover space to the `ScrollView` instead of to the footer. `Shop.js` carries both (`:52` and `:68`) and it
is the screen that works. **Removing IMP-068's line while adding this one would reintroduce the original
overlap** — there is a test guarding it, and that test is correct.

**2 · `useWindowDimensions()`, not `Dimensions.get('window')`.** A one-shot read freezes the cap at whatever
the window was when the component first rendered; the hook re-renders on rotation and on any window change.
This matters more on the Paywall than most screens because it is a modal that can be opened in either
orientation. A test asserts the hook and forbids the one-shot call.

**3 · The comment gets written, in substance, not omitted.** This trap has now cost two screens and two
design passes on this one file. Copy the shape of `Shop.js:23-29` and say plainly that IMP-068's `flex: 1`
below is the other half of the same fix, so the next person does not delete one of them.

**4 · Out of scope — do not touch.** `contentContainerStyle` · the footer `View` and its
`paddingBottom: 14 + insets.bottom` · `LegalFooter` / `usePurchaseFlow` in `PlusFlow.js` · `useLivePrices` ·
the plan selector · **every other modal screen** — WALK-07 already passed Achievements, Shop, Reading sheet,
Get Embers and Manage Subscription in both nav modes at 2.0x font scale, and they each carry a guard already.

### Steps

**1 — `src/screens/Paywall.js`: import the hook.** Line [`:7`](../src/screens/Paywall.js#L7) becomes:

```js
import { View, ScrollView, Pressable, useWindowDimensions } from 'react-native';
```

**2 — same file: read the window.** Immediately after `const c = t.colors;`
([`:18`](../src/screens/Paywall.js#L18)), add:

```js
  // Android's Modal is a Dialog whose window size isn't known on the first measure
  // pass, so `flex: 1` on this View resolves against nothing and the column sizes
  // to its content: the ScrollView below goes unbounded and the fixed footer is
  // pushed clean off-screen. A later re-render fires a correcting pass and the
  // footer comes back — still overlapping the price and the last perks, which is
  // the pre-IMP-068 bug returning. maxHeight caps us at the viewport from the very
  // first pass, so the correction is optional rather than load-bearing. Same trap
  // and same fix as Shop.js:23-29. (IMP-074 — and the `flex: 1` on the ScrollView
  // below is the OTHER half of this fix, not a duplicate of it. Keep both.)
  const { height: winH } = useWindowDimensions();
```

**3 — same file: cap the outer `View`.** Line [`:30`](../src/screens/Paywall.js#L30) becomes:

```jsx
    <View testID="paywallRoot" style={{ flex: 1, maxHeight: winH, backgroundColor: c.cream, paddingTop: insets.top }}>
```

The `testID` is there so the test can reach the root node by name rather than by tree position (the existing
IMP-068 test reaches its `ScrollView` with `UNSAFE_getAllByType(...)[0]`, which is exactly the brittleness
worth avoiding on a second guard). `testID` is already an established idiom in this tree — `WriteFlow.js:216`
and `MoodManager.js:139` both carry one.

**4 — leave [`:43-46`](../src/screens/Paywall.js#L43) exactly as they are.** IMP-068's `style={{ flex: 1 }}`
and its comment are load-bearing, per decision 1. This step is here to be explicit that "add the second
guard" does not mean "replace the first".

### Tests (+2, no new suite files)

**`__tests__/screens/Paywall.test.js`** (+2, in a new `describe('Paywall — IMP-074')` appended to the file).
The existing `describe('Paywall — IMP-068')` block stays green **untouched** — its `flex === 1` assertion is
the guard from decision 1:

```js
import fs from 'fs';
import path from 'path';
import { Dimensions } from 'react-native';

describe('Paywall — IMP-074', () => {
  test('the root view is capped at the window height, so the first measure pass is bounded', () => {
    const view = renderPaywall();
    const flat = StyleSheet.flatten(view.getByTestId('paywallRoot').props.style) || {};
    expect(flat.maxHeight).toBe(Dimensions.get('window').height);
    expect(flat.flex).toBe(1);
  });

  // A source assertion on purpose: "the cap must track the window" is a decision
  // about which API is used, and a single rendered frame cannot show that a
  // one-shot read would have gone stale on rotation.
  test('the cap comes from useWindowDimensions, not a one-shot Dimensions.get', () => {
    const src = fs.readFileSync(path.join(__dirname, '../../src/screens/Paywall.js'), 'utf8');
    expect(src).toMatch(/useWindowDimensions\(\)/);
    expect(src).not.toMatch(/Dimensions\.get\(/);
  });
});
```

`Dimensions` and `StyleSheet` come from `react-native`; the file already imports `StyleSheet` and
`ScrollView` at the top — add `Dimensions` to that same import rather than writing a second one.

### Done

`npm test` green at **the prior count + 2** (852 → **854**, or 860 → **862** if IMP-073 landed first),
**suite files unchanged**. `npx expo export --platform android` clean.
**Commit:** `fix(plus): the Paywall footer survives the first measure pass (IMP-074)`.
No `Release-Lane` trailer. Then tick the backlog row, write the session note, move this spec into
`docs/build-log.md`, close the reopened "WALK-07 finding" note in `PROGRESS.md` → Open items, and leave
**WALK-07** for a walk chat — **do not walk it here.**
