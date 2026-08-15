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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **772 passed, 78 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane | From |
| --- | --- | --- | --- |
| IMP-067 | [A stacked row wraps; Mood Mix bars start in one place](#imp-067--a-stacked-row-wraps-mood-mix-bars-start-in-one-place) | OTA | WALK-07 (b, c) |
| IMP-068 | [The Paywall footer stops covering the price](#imp-068--the-paywall-footer-stops-covering-the-price) | OTA | WALK-07 (a) |

> **All six came out of failed walks, not from feature ideas** — WALK-04, WALK-06 and WALK-07 each passed
> their mechanical assertions and each turned up UX defects on the way. All six are **🎨 lane: they do not
> gate the release build.** The 🚦 walks in [`walk-open.md`](walk-open.md) still gate it. If the owner wants
> the build to go out first, every one of these can land after it and ride an OTA — **but they must not be
> half-landed across the bump**, so a build chat takes them in the order above and finishes each one.
> **IMP-063, IMP-064, IMP-065 and IMP-066 have already landed** — this index now holds the remaining two.
>
> **The order is by user cost, not by walk number.** IMP-063/064 fixed a mechanic the user is *told* about but
> could not *see* (candles). IMP-065/066 fix the two screens every user touches daily. IMP-067 is visible at
> every font size. **IMP-068 is last on purpose** — the Paywall is unmountable while `PLUS_ENABLED = false`
> ([`src/billing/config.js:39`](../src/billing/config.js#L39)), so no user can hit it in the shipped build.
>
> **IMP-057 is still deliberately absent.** It is reserved for the historical `dayKey` migration IMP-056
> deferred, and it cannot be written until a real device's numbers come back from the dev-panel Inspector's
> "Data health" reporter IMP-056 added. **Do not reuse the number.**
>
> **Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
> runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
> the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
> build chat**, and do not read a missing walk as an unfinished spec.

---

## IMP-067 — a stacked row wraps; Mood Mix bars start in one place

**Lane: OTA.** No native change, no bump.
**Runtime proof: WALK-07**, re-run whole — not this chat.

**Why.** WALK-07 findings (b) and (c), 2026-08-15. Both are layout defects found while proving the
font-scale cap; the cap itself passed (`PixelRatio.getFontScale()` read 2.0 against the 1.5/1.2 caps in
[`src/ui/textScale.js`](../src/ui/textScale.js) with nothing broken on the four passed screens).

**(b) `Row` truncates its value even when it has a whole line to itself.** `Row.js` hardcodes
`numberOfLines={1}` on the value in **both** layouts — the stacked one ([`:36`](../src/ui/Row.js#L36)) and
the inline one ([`:45`](../src/ui/Row.js#L45)). `shouldStackRow` ([`rowFit.js:7-13`](../src/ui/rowFit.js#L7))
correctly decides to stack at 2.0x font, and then the value it moved onto its own full-width line still
ellipsizes at one line. The instance the owner hit is the You tab's Annual Recap teaser,
`value="Unlocks after your first full year"` ([`YouScreen.js:169-170`](../src/screens/YouScreen.js#L169)).

**(c) Mood Mix bars start at a different x on every row, at every font size.**
[`InsightsScreen.js:134`](../src/screens/InsightsScreen.js#L134) gives the label column `minWidth: 84` with
`flexShrink: 1`, so the column is as wide as its content — a long mood name pushes that row's bar right and
a short one pulls it left. The bars are the comparison; they have to share an origin.

### Decided design — do not re-litigate

1. **The stacked value gets 3 lines; the inline value keeps 1.** Inline, the value shares the row with the
   label and there is no room to wrap into — stacking is exactly the escape hatch `shouldStackRow` exists to
   trigger, and once stacked the value owns the full width.
2. **Three lines is not enough on its own for the Annual Recap teaser, so the string shrinks too.** At 2.0x
   in the stacked column, 33 characters still overflow three lines. The owner's read was that this
   description is not load-bearing. It becomes **`After your first year`** (21 chars) — same meaning, fits.
   This is a copy change to one string, not a move into a detail sheet; a sheet for a row that says
   "not yet" would be worse than the truncation.
3. **The Mood Mix label column becomes a fixed width that grows with the OS font scale, capped at 1.5x.**
   Fixed alone would make names illegible at 2.0x; uncapped would leave the bar nothing. 96dp at 1x → 144dp
   at 1.5x and above. Every row uses the same number, which is the whole fix.
4. **The width is a pure module** so the cap is tested rather than eyeballed.
5. **Out of scope:** `shouldStackRow`'s calibration constants (IMP-030 pinned them against real
   measurements — do not retune them), the Weekly-rhythm chart below Mood Mix, and every other `Row` caller.

### Steps

**1 — `src/ui/Row.js`: the stacked value wraps.** Line 36 only:

```jsx
<T w={700} color={c.muted} numberOfLines={3} style={{ fontSize: 14, marginTop: 3 }}>{value}</T>
```

Line 45's inline value keeps `numberOfLines={1}`. Add a one-line comment above the stacked block saying the
value has the full row width here, which is why it may wrap and the inline one may not.

**2 — `src/screens/YouScreen.js`: the teaser string.** Line 170's
`value="Unlocks after your first full year"` becomes `value="After your first year"`. Nothing else in that
`Row` changes.

**3 — new `src/insights/moodMixLayout.js`:**

```js
// insights/moodMixLayout.js — the Mood Mix label column's width (IMP-067).
// It must be the SAME on every row or the bars start at different x and stop
// being comparable, which is the whole point of the chart. Fixed at 96dp,
// growing with the OS font scale so long names stay readable, capped at 1.5x —
// past that the bar itself has nothing left.
export const MOOD_LABEL_BASE_DP = 96;

export function moodLabelWidth(fontScale = 1) {
  const s = Number(fontScale);
  const safe = Number.isFinite(s) && s > 1 ? Math.min(s, 1.5) : 1;
  return Math.round(MOOD_LABEL_BASE_DP * safe);
}
```

**4 — `src/screens/InsightsScreen.js`: use it.** Add `useWindowDimensions` to the `react-native` import and
`moodLabelWidth` from `'../insights/moodMixLayout'`. **Both lines go immediately after `const c = t.colors;`
([`:18`](../src/screens/InsightsScreen.js#L18)) — above `deriveInsights` and above the
`if (data.empty)` early return** ([`:22`](../src/screens/InsightsScreen.js#L22)). Putting them with the
other derived values at line 52 would place a hook *after* a conditional return, which breaks the rules of
hooks and crashes the empty state:

```js
const { fontScale } = useWindowDimensions();
const labelW = moodLabelWidth(fontScale);
```

Then the label column ([`:134`](../src/screens/InsightsScreen.js#L134)) becomes:

```jsx
<View style={{ width: labelW, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
```

`minWidth` and the column's `flexShrink: 1` are both gone. The name `T` inside it
([`:136`](../src/screens/InsightsScreen.js#L136)) keeps `numberOfLines={1}` and `flexShrink: 1` so a long
name ellipsizes **inside** the fixed column instead of widening it.

### Tests (+7)

**New `__tests__/insights/moodMixLayout.test.js`** (+5) — `1` → `96` · `1.5` → `144` · `2.0` → `144`
(capped) · `0.85` → `96` (never shrinks below the base) · `undefined`, `NaN` and `'abc'` → `96`.

**`__tests__/ui/Row.test.js`** (+2) — a stacked row (long value, no `right`) renders its value `T` with
`numberOfLines === 3` · an inline row renders its value `T` with `numberOfLines === 1`. Find the value node
by its text, not by index. The existing `assertNoUnboundedFlexText` guard must stay green in all three
existing cases.

### Done

`npm test` green at **the prior count + 7** (772 → **779** if this is the first of the six; otherwise that
chat's number + 7), **+1 suite file**. `npx expo export --platform android` clean.
**Commit:** `fix(ui): a stacked row's value wraps, and Mood Mix bars start in one place (IMP-067)`.
No `Release-Lane` trailer. Then tick the backlog row, write the session note, move this spec into
`docs/build-log.md`, and leave **WALK-07** for a walk chat — **do not walk it here.**

---

## IMP-068 — the Paywall footer stops covering the price

**Lane: OTA.** No native change, no bump.
**Runtime proof: WALK-07**, re-run whole — not this chat.
**Take this one LAST.** `PLUS_ENABLED = false` ([`src/billing/config.js:39`](../src/billing/config.js#L39))
makes the Paywall unmountable in the shipped build — the owner reached it by flipping T1 during the walk and
reverting after. It is a real defect on a screen no user can currently open, so it ranks below the five
above and above nothing.

**Why.** WALK-07 finding (a), 2026-08-15. The Paywall's fixed footer overlaps its own content **at normal
font size**, before max-font is a factor: the owner saw the plan amount and the last one or two perk bullets
covered by the footer.

**The mechanism, exactly.** [`Paywall.js:94-99`](../src/screens/Paywall.js#L94) renders the "Start 7-day free
trial" button and `LegalFooter` as a plain sibling `View` **after** the `ScrollView`
([`:43`](../src/screens/Paywall.js#L43)), inside a `flex: 1` column. That `ScrollView` is passed **only**
`contentContainerStyle` — it has no `style` prop, so nothing ever constrains its height, and it lays out at
its full content height instead of at "whatever is left above the footer". The footer is then drawn over the
tail of it. The perk bullets (`PLUS_PERKS.map`, [`:54-63`](../src/screens/Paywall.js#L54), sourced from
[`src/data.js:163-170`](../src/data.js#L163)) and the plan amount (`pl.price`,
[`:86`](../src/screens/Paywall.js#L86)) are the last things in that content, so they are what gets covered.

**This is the only screen with the defect, and here is how that was established** — do not go on a
refactoring tour. Every other full-screen modal that pairs a `ScrollView` with a fixed footer sibling
already constrains it: `Achievements`, `GetEmbers`, `PlusPerks`, `PlusFlow`, `MoodManager`, `ReadingSheet`,
`TrashSheet` and `AnnualRecap` all pass `style={{ flex: 1 }}`, and `WriteFlow`'s two
([`:98`](../src/screens/WriteFlow.js#L98), [`:121`](../src/screens/WriteFlow.js#L121)) pass
`flexGrow: 1` inside `contentContainerStyle`, which is the other half of the same pattern and is why its
`Foot` has always sat where it should. **`Paywall` is the only one with neither.**

### Decided design — do not re-litigate

1. **The fix is `style={{ flex: 1 }}` on the `ScrollView`.** Not a `paddingBottom` big enough to clear the
   footer (that guesses at the footer's height, which changes with `insets.bottom`, the font scale and the
   legal text), not moving the footer inside the scroll (it is a fixed CTA on purpose).
2. **`contentContainerStyle` is not touched.** Adding `flexGrow: 1` alongside would change how short content
   is positioned on a tall screen — this content is never short.
3. **`WriteFlow` is not touched.** It has the other half of the pattern, WALK-04 and WALK-05 both walked it,
   and a passed walk is not a place to go looking for work.
4. **Out of scope:** the perk list's contents, the plan selector, `LegalFooter`, and the `PLUS_ENABLED`
   flag — flipping T1 belongs to a walk chat, never to a commit.

### Steps

**1 — `src/screens/Paywall.js`, line 43.** The `ScrollView` gains a `style` prop and keeps everything else:

```jsx
{/* style={{ flex: 1 }} is load-bearing (IMP-068): without it this ScrollView
    lays out at full content height inside the flex column and the fixed footer
    below is drawn over the plan price and the last perks. */}
<ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 26, paddingBottom: 18, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
```

That is the entire code change.

### Tests (+3, new suite)

**New `__tests__/screens/Paywall.test.js`.** `Paywall` renders with no billing service —
`useLivePrices(undefined)` returns the `PLUS_PRICES` fallback and `usePurchaseFlow` touches `service` only
inside `buy`/`restore`, so `render(<Paywall insets={{ top: 0, bottom: 0 }} platform="android" service={null}
onClose={() => {}} onSubscribe={() => {}} onLink={() => {}} />)` is safe. Three cases:

- **The structural guard:** the outer `ScrollView` (`UNSAFE_getAllByType(ScrollView)[0]`) has
  `StyleSheet.flatten(node.props.style).flex === 1`. This is the regression that would silently return.
- The **last** `PLUS_PERKS` entry renders (`getByText(PLUS_PERKS[PLUS_PERKS.length - 1])`) — the content the
  footer was covering.
- The annual price from `PLUS_PRICES` and the `Start 7-day free trial` label both render, i.e. the change
  did not cost anything.

### Done

`npm test` green at **the prior count + 3** (772 → **775** if this is the first of the six; otherwise that
chat's number + 3), **+1 suite file**. `npx expo export --platform android` clean.
**Commit:** `fix(plus): the Paywall footer stops covering the price and the last perks (IMP-068)`.
No `Release-Lane` trailer. Then tick the backlog row, write the session note, move this spec into
`docs/build-log.md`, and leave **WALK-07** for a walk chat — **do not walk it here.**
