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
| IMP-065 | [Clear the search; the moods you picked come to the front](#imp-065--clear-the-search-the-moods-you-picked-come-to-the-front) | OTA | WALK-04 (a, b, c) |
| IMP-066 | [The mood step stops fighting you](#imp-066--the-mood-step-stops-fighting-you) | OTA | WALK-04 (d, e) |
| IMP-067 | [A stacked row wraps; Mood Mix bars start in one place](#imp-067--a-stacked-row-wraps-mood-mix-bars-start-in-one-place) | OTA | WALK-07 (b, c) |
| IMP-068 | [The Paywall footer stops covering the price](#imp-068--the-paywall-footer-stops-covering-the-price) | OTA | WALK-07 (a) |

> **All six came out of failed walks, not from feature ideas** — WALK-04, WALK-06 and WALK-07 each passed
> their mechanical assertions and each turned up UX defects on the way. All six are **🎨 lane: they do not
> gate the release build.** The 🚦 walks in [`walk-open.md`](walk-open.md) still gate it. If the owner wants
> the build to go out first, every one of these can land after it and ride an OTA — **but they must not be
> half-landed across the bump**, so a build chat takes them in the order above and finishes each one.
> **IMP-063 and IMP-064 have already landed** — this index now holds the remaining four.
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

## IMP-065 — clear the search; the moods you picked come to the front

**Lane: OTA.** No native change, no bump.
**Runtime proof: WALK-04**, re-run whole — not this chat.

**Why.** WALK-04 findings (b), (c) and (a), 2026-08-15. The search itself passed — case-insensitive,
accent-folding, correct zero-results copy, heatmap correctly not reacting to filters. Getting *out* of a
search is what failed.

**(b) There is no way to clear the search text.** `ArchiveFilters.js`'s `TextInput`
([`:109-120`](../src/screens/ArchiveFilters.js#L109)) has no clear affordance at all — the only way back to
the full list is holding backspace.

**(c) A selected mood chip never moves.** `toggleMood` ([`:88-91`](../src/screens/ArchiveFilters.js#L88))
recolours the chip; the list ([`:122-139`](../src/screens/ArchiveFilters.js#L122)) is always
`[...MOODS, ...customMoods]` in fixed order. Pick a chip from deep in the horizontal scroll and turning it
back off means hunting for it again instead of tapping the front of the row.

**(a) The search snippet labels one field and not the other.** `ArchiveScreen.js:134` prints `wished · `
only when `snip.field === 'wished'` ([`snippet.js:57-80`](../src/insights/snippet.js#L57)). A `did` match
gets no counterpart label. That matches IMP-053's spec as written, and the owner flagged the asymmetry as a
design call worth revisiting rather than a bug — **this spec makes the call: label both.**

### Decided design — do not re-litigate

1. **The label goes on both fields, not neither.** Removing it is the other symmetric option and it is
   worse: a `wished` match would then read as though it came from the `did` line, which is precisely the
   confusion IMP-053 existed to remove. `did` and `wished` are the app's own two halves of a day, and the
   string is generated from `snip.field` so the two can never drift apart again.
2. **The clear button appears only when there is text, but the field's padding does not change.** A
   `paddingRight` that toggles would reflow the user's text under their cursor as they type the first
   character.
3. **Selected chips move to the front, keeping their relative order — and the row scrolls back to the
   start when you select one.** Without the scroll, picking a chip from deep in the row makes it appear to
   *vanish* (it jumped to an off-screen front), which is a worse bug than the one being fixed. Deselecting
   does **not** scroll — the row is already where the user is looking.
4. **The ordering is a pure module.** Same reason as everywhere else in this repo: the component gets a
   render test, the semantics get a real one.
5. **Out of scope:** the mood chips in `WriteFlow` (that is IMP-066's file, and its chip row wraps rather
   than scrolls, so it has no ordering problem), the date-bound pickers, and any "Clear all filters"
   affordance.

### Steps

**1 — new `src/entries/moodChipOrder.js`:**

```js
// entries/moodChipOrder.js — selected mood chips sort to the front of the
// filter row (IMP-065). A chip picked from deep in the horizontal scroll used
// to stay where it was, so turning it back off meant hunting for it.

// Selected first, then the rest — relative order preserved inside both groups.
// Returns the input array by reference when nothing is selected.
export function orderMoodChips(all, selected) {
  const list = Array.isArray(all) ? all : [];
  const sel = new Set(Array.isArray(selected) ? selected : []);
  const picked = list.filter((m) => sel.has(m));
  if (!picked.length) return list;
  return [...picked, ...list.filter((m) => !sel.has(m))];
}
```

**2 — `src/screens/ArchiveFilters.js`: the clear button.** Add `useRef` to the React import and `Close` to
the icon import (`import { Close } from '../icons';`). Wrap the `TextInput`
([`:109-120`](../src/screens/ArchiveFilters.js#L109)) — its style gains **`paddingRight: 44`** and is
otherwise unchanged:

```jsx
<View style={{ justifyContent: 'center' }}>
  <TextInput
    style={{
      paddingVertical: 12, paddingLeft: 16, paddingRight: 44,
      borderRadius: t.radius.btn, borderWidth: 1.5,
      borderColor: c.border, backgroundColor: c.cream,
      fontFamily: t.body(400), fontSize: 15, color: c.ink,
    }}
    placeholder="Search your journal"
    placeholderTextColor={c.placeholder}
    value={text}
    onChangeText={(v) => onChange({ text: v, moods, from, to })}
  />
  {text ? (
    <Pressable
      onPress={() => onChange({ text: '', moods, from, to })}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Clear search"
      style={({ pressed }) => ({ position: 'absolute', right: 14, opacity: pressed ? 0.5 : 1 })}
    >
      <Close size={16} color={c.muted} />
    </Pressable>
  ) : null}
</View>
```

Note `paddingHorizontal: 16` is replaced by the explicit `paddingLeft`/`paddingRight` pair — the button sits
in that right-hand gutter, and the gutter is constant whether or not the button is drawn.

**3 — `src/screens/ArchiveFilters.js`: chip ordering + the scroll-back.** Import `orderMoodChips` from
`'../entries/moodChipOrder'`. Add the ref and rewrite `toggleMood`:

```js
const chipScroll = useRef(null);

const toggleMood = (m) => {
  const selecting = !moods.includes(m);
  const next = selecting ? [...moods, m] : moods.filter((x) => x !== m);
  onChange({ text, moods: next, from, to });
  // The chip just jumped to the front of the row. If it was picked from deep in
  // the scroll, not following it there reads as the chip disappearing.
  if (selecting) chipScroll.current?.scrollTo({ x: 0, animated: true });
};
```

Put `ref={chipScroll}` on the horizontal `ScrollView` ([`:122`](../src/screens/ArchiveFilters.js#L122)) and
map over the ordered list instead of the raw one:

```jsx
{orderMoodChips([...MOODS, ...customMoods], moods).map((m) => {
```

Each chip `Pressable` ([`:126`](../src/screens/ArchiveFilters.js#L126)) also gains three props, which is
what the order test reads and what TalkBack has been missing:
`accessibilityRole="button"`, `accessibilityLabel={m}`, `accessibilityState={{ selected: sel }}`.

**4 — `src/screens/ArchiveScreen.js`: label both fields.** In `ResultLine`, line 134 becomes:

```jsx
<T w={800} color={c.muted} style={{ fontSize: 12 }}>{`${snip.field} · `}</T>
```

— unconditional, since it only renders when `snip` exists at all, and `entrySnippet` returns exactly `did`
or `wished`. Update the comment above `ResultLine` ([`:116-120`](../src/screens/ArchiveScreen.js#L116)) to
say the label names whichever half of the day matched. **Nothing else in that function changes** — the
`!snip` browsing path still renders bare `entry.did` with no label.

### Tests (+13, and 3 existing assertions updated)

**New `__tests__/entries/moodChipOrder.test.js`** (+6) — nothing selected returns the **same array
reference** · one selected moves to index 0 · two selected keep their order relative to each other · the
unselected tail keeps its original order · a selected name not present in `all` is ignored (no crash, no
insert) · non-array inputs (`undefined`, `null`) return `[]` / are treated as nothing selected.

**New `__tests__/screens/ArchiveFilters.test.js`** (+5) — render with `text=""`: `queryByLabelText('Clear
search')` is `null` · with `text="rain"` it exists · pressing it calls `onChange` with
`{ text: '', moods, from, to }` and the other three values untouched · with `moods={[]}` the first chip is
`MOODS[0]` · with `moods={['Light']}` (the **last** built-in) the first chip is `Light`.

For the chip-order assertions, read the labels in render order and keep `text=""` so the clear button is not
in the tree:

```js
const chipLabels = (view) => view.getAllByRole('button').map((n) => n.props.accessibilityLabel);
```

**`__tests__/screens/ArchiveResults.test.js`** (+2, 3 updated) — the two cases that assert
`queryByText('wished · ')` is `null` for a `did` match now assert `getByText('did · ')` instead; the
`wished` case is unchanged; the two no-query cases now assert **both** labels are absent. New: a `did` match
renders `did · ` exactly once · the label text is generated from the field, so a `wished` match never
renders `did · `.

### Done

`npm test` green at **the prior count + 13** (772 → **785** if this is the first of the six; otherwise that
chat's number + 13), **+2 suite files**. `npx expo export --platform android` clean.
**Commit:** `feat(archive): clear the search, and the moods you picked come to the front (IMP-065)`.
No `Release-Lane` trailer. Then tick the backlog row, write the session note, move this spec into
`docs/build-log.md`, and leave **WALK-04** for a walk chat — **do not walk it here.**

---

## IMP-066 — the mood step stops fighting you

**Lane: OTA.** No native change, no bump.
**Runtime proof: WALK-04**, re-run whole — not this chat.

**Why.** WALK-04 findings (d) and (e), 2026-08-15.

**(d) The owner could not deselect a mood chip, and the code says they should have been able to.** The
finding recorded that contradiction honestly and asked a build chat to re-confirm before assuming the logic
was at fault. **It is not the logic.** `toggleMood` ([`WriteFlow.js:43`](../src/screens/WriteFlow.js#L43)) is
a correct symmetric toggle and it is wired correctly at line 131. The defect is one line above the chips:
the mood step's `ScrollView` ([`:121`](../src/screens/WriteFlow.js#L121)) **has no
`keyboardShouldPersistTaps`**, while the `did`/`wished` step's `ScrollView`
([`:98`](../src/screens/WriteFlow.js#L98)) has `"handled"`. The default is `"never"`, which means: **while
the keyboard is open, the first tap anywhere inside that ScrollView is swallowed to dismiss the keyboard and
never reaches the child.** The mood step is the one step with two text fields on it, so the keyboard is open
exactly when the owner was tapping — the tap that "did nothing" was spent closing the keyboard. It looks
like a broken toggle and it is a swallowed tap.

**(e) The custom-mood block is three unlabelled rows that do not read as one task**
([`:146-202`](../src/screens/WriteFlow.js#L146)): a horizontal emoji palette, then a lone 90dp text field
saying *"or type one…"* ("or type one" *what*, and instead of what?), then a name field with an Add button.
Nothing says these three belong together or in what order they are meant to be used. Confirmed in the same
pass: the mood-**name** field ([`:180-191`](../src/screens/WriteFlow.js#L180)) accepts emoji and has no
length limit, unlike the emoji field sitting directly above it, which is `isEmojiish`-gated.

### Decided design — do not re-litigate

1. **The fix for (d) is `keyboardShouldPersistTaps="handled"`, and `toggleMood` is not touched.** Do not
   "improve" the toggle, add a hit-slop, or change the chip styling to chase this. The same prop goes on the
   nested horizontal palette `ScrollView` for the same reason.
2. **The custom-mood block becomes one bordered, headed group with two numbered steps** — face, then name.
   The heading is what makes the "or type one…" field legible: it is an alternative to the palette above it,
   and now it sits inside the same labelled step.
3. **The name field strips emoji rather than rejecting the input.** Rejecting mid-type loses characters the
   user already typed; stripping is silent and always leaves a usable name. It also gets `maxLength={24}`,
   matching `moodNameError`'s existing limit ([`src/entries/renameMood.js`](../src/entries/renameMood.js)).
4. **Stripping is by emoji block, NOT by "code point above ASCII".** `isEmojiish` uses `>= 0x00a0`, which is
   right for *validating an emoji* and catastrophic for *filtering a name*: it would delete every accented
   Latin letter and every Devanagari character. A mood named `थका` or `Café` must survive byte-for-byte.
5. **No validation beyond that.** `addCustomMood` keeps its current duplicate guard; collision checking
   against existing custom moods and `moodNameError` wiring are **not** in scope — `MoodManager` (IMP-055)
   owns correcting a name after the fact.
6. **Out of scope:** the mood chip row's wrap layout, the built-in `MOODS` list, `MOOD_PALETTE`'s contents,
   and the Foot/keyboard handling (IMP-051 settled that and WALK-04 passed it).

### Steps

**1 — `src/entries/emojiInput.js`: add `stripEmoji`.** Below `isEmojiish`, unchanged:

```js
// Removes emoji from a *name* the user typed (IMP-066). Deliberately NOT
// isEmojiish's ">= 0x00a0" rule: that would delete "Café" and every Devanagari
// character in a Hindi mood name. Only pictographic blocks and the joiners that
// glue them together go.
const EMOJI_RANGES = [
  [0x1f000, 0x1faff], // faces, hands, objects, flags, supplemental pictographs
  [0x2190, 0x21ff],   // arrows
  [0x2300, 0x23ff],   // misc technical (⌚ ⏰)
  [0x2460, 0x24ff],   // enclosed alphanumerics
  [0x25a0, 0x27bf],   // geometric shapes, misc symbols (☀ ❤ ✨), dingbats
  [0x2b00, 0x2bff],   // extra arrows and stars (⭐)
  [0xfe00, 0xfe0f],   // variation selectors — the ️ half of "❤️"
];
const EMOJI_SINGLES = new Set([0x200d, 0x20e3, 0x203c, 0x2049, 0x3030, 0x303d]);

export function stripEmoji(s) {
  return [...String(s ?? '')]
    .filter((ch) => {
      const cp = ch.codePointAt(0);
      if (EMOJI_SINGLES.has(cp)) return false;
      return !EMOJI_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
    })
    .join('');
}
```

**2 — `src/screens/WriteFlow.js`: the swallowed tap.** Add `keyboardShouldPersistTaps="handled"` to the
mood-step `ScrollView` ([`:121`](../src/screens/WriteFlow.js#L121)) **and** to the horizontal palette
`ScrollView` ([`:146`](../src/screens/WriteFlow.js#L146)). Nothing else on those two lines changes.

**3 — `src/screens/WriteFlow.js`: the chips get their accessibility props.** On the mood chip `Pressable`
([`:129`](../src/screens/WriteFlow.js#L129)) add `accessibilityRole="button"`, `accessibilityLabel={m}` and
`accessibilityState={{ selected: sel }}`. `toggleMood` and the chip styles are **unchanged**.

**4 — `src/screens/WriteFlow.js`: the custom-mood block.** Import `stripEmoji` alongside `isEmojiish`.
Replace everything from line 146 (the palette `ScrollView`) through line 202 (the closing `</View>` of the
name row) with the block below. The palette `Pressable` body and both `TextInput` styles are carried over
**verbatim** — only their grouping, labels and the two new name-field props are new:

```jsx
{/* Name your own — one headed group with two numbered steps (IMP-066). It was
    three unlabelled rows before, and "or type one…" had nothing to be an
    alternative *to*. */}
<View style={{ marginTop: 26, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }}>
  <T d w={700} color={c.ink} style={{ fontSize: 16 }}>Name your own</T>
  <T w={600} color={c.muted} style={{ fontSize: 13, marginTop: 2, lineHeight: 18 }}>
    Give it a face, then a name.
  </T>

  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 }}>
    <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase' }}>1 · Its face</T>
    <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: c.accent, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 18 }}>{emojiPick}</Text>
    </View>
  </View>

  <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, marginTop: 10, paddingRight: 8 }}>
    {/* …the existing MOOD_PALETTE.map, unchanged… */}
  </ScrollView>

  <TextInput
    value={emojiTyped}
    onChangeText={onEmojiTyped}
    placeholder="or type one…"
    placeholderTextColor={c.placeholder}
    autoCorrect={false}
    maxLength={12}
    style={{
      marginTop: 10, width: 90, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999,
      borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface,
      fontFamily: t.body(600), fontSize: 14, color: c.ink,
    }}
  />

  <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 18 }}>2 · Its name</T>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
    <TextInput
      value={customInput}
      onChangeText={(v) => setCustomInput(stripEmoji(v))}
      placeholder="Name your own…"
      placeholderTextColor={c.placeholder}
      maxLength={24}
      onSubmitEditing={addCustomMood}
      style={{
        flex: 1, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 999,
        borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface,
        fontFamily: t.body(600), fontSize: 14, color: c.ink,
      }}
    />
    {/* …the existing Add Pressable, unchanged… */}
  </View>
</View>
```

The 90dp emoji field's wrapping `<View flexDirection: 'row'>` ([`:164`](../src/screens/WriteFlow.js#L164))
is gone — it wrapped a single child and its `marginTop` moves onto the input's own style. The `1 · Its face`
row's preview circle shows the current `emojiPick`, which is the thing the palette and the typed field were
both silently writing to.

### Tests (+11)

**`__tests__/entries/emojiInput.test.js`** (+7) — `MOOD_PALETTE.every((e) => stripEmoji(e) === '')` (one
assertion covering all 40 glyphs, including the `❤️`/`☀️` variation-selector pairs) · `'Café'` survives
byte-for-byte · the Devanagari `'थका'` survives byte-for-byte · `'Sleepy😴'` → `'Sleepy'` · a ZWJ sequence
(`'👨‍👩‍👧'`) strips to `''` with no joiner left behind · `null` and `undefined` → `''` · digits, spaces,
hyphens and apostrophes survive (`"Half-awake 2'o clock"`).

**`__tests__/screens/WriteFlowMood.test.js`** (+4) — **the (d) regression:** tapping a selected chip
deselects it (press `'Grateful'`, press it again, press `Finish`, assert `onComplete` was **not** called) ·
**the swallowed-tap guard:** every `ScrollView` rendered on the mood step carries
`keyboardShouldPersistTaps === 'handled'`, asserted with `view.UNSAFE_getAllByType(ScrollView)` (the same
structural-guard idiom as `__tests__/ui/Row.test.js`) · typing `'😴Sleepy'` into `Name your own…` and
pressing `Add` fires `onAddCustomMood` with `'Sleepy'` · the name field's `maxLength` prop is `24`.

The existing 7 cases in that file must all stay green untouched — if the block rewrite breaks
`getByPlaceholderText('or type one…')` or `getByText('Add')`, the rewrite is wrong, not the test.

### Done

`npm test` green at **the prior count + 11** (772 → **783** if this is the first of the six; otherwise that
chat's number + 11). **No new suite files.** `npx expo export --platform android` clean.
**Commit:** `fix(entries): the mood step answers every tap, and naming a feeling is one clear block (IMP-066)`.
No `Release-Lane` trailer. Then tick the backlog row, write the session note, move this spec into
`docs/build-log.md`, and leave **WALK-04** for a walk chat — **do not walk it here.**

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
