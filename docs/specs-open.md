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
| IMP-068 | [The Paywall footer stops covering the price](#imp-068--the-paywall-footer-stops-covering-the-price) | OTA | WALK-07 (a) |

> **All six came out of failed walks, not from feature ideas** — WALK-04, WALK-06 and WALK-07 each passed
> their mechanical assertions and each turned up UX defects on the way. All six are **🎨 lane: they do not
> gate the release build.** The 🚦 walks in [`walk-open.md`](walk-open.md) still gate it. If the owner wants
> the build to go out first, every one of these can land after it and ride an OTA — **but they must not be
> half-landed across the bump**, so a build chat takes them in the order above and finishes each one.
> **IMP-063, IMP-064, IMP-065, IMP-066 and IMP-067 have already landed** — this index now holds the last one.
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
