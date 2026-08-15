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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **826 passed, 83 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane | From |
| --- | --- | --- | --- |
| IMP-070 | [One emoji, and the block says what it makes](#imp-070--one-emoji-and-the-block-says-what-it-makes) | OTA | WALK-04 (f) |
| IMP-071 | [The filter row stops jumping under your thumb](#imp-071--the-filter-row-stops-jumping-under-your-thumb) | OTA | WALK-04 (g) |

> **All three came out of WALK-04's second pass (2026-08-15), not from feature ideas.** They are **🎨 lane:
> they do not gate the release build.** The 🚦 walks in [`walk-open.md`](walk-open.md) still gate it. All
> three can land after the build and ride an OTA instead — **but they must not be half-landed across the
> bump**, so a build chat takes them in the order above and finishes each one.
>
> **The order is by user cost.** IMP-069 (landed 2026-08-16) was a user stuck with a mood they mis-tapped, on
> the one screen every entry passes through. IMP-070 is a field that accepts nonsense and never says what it
> is for — take it next. IMP-071 reverses one landed line and is the smallest of the three.
>
> **IMP-070 touches `src/screens/WriteFlow.js`, and IMP-070 and IMP-071 both touch a file IMP-069 edited.**
> They are sequential by design: each chat commits before the next begins. Do not take two in one chat.
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

## IMP-070 — one emoji, and the block says what it makes

**Lane: OTA.** No native change, no bump.
**Runtime proof: WALK-04**, re-run whole — not this chat.

**Why.** WALK-04 finding (f), 2026-08-15. IMP-066 rebuilt the custom-mood block into "1 · Its face" /
"2 · Its name" and sanitized the **name** field, but the **face** field was carried over verbatim and still
has both of its original defects:

- **It accepts any number of emoji.** `onEmojiTyped` ([`WriteFlow.js:45-48`](../src/screens/WriteFlow.js#L45))
  stores whatever was typed and promotes it to the chosen face whenever `isEmojiish` says yes — and
  `isEmojiish` ([`emojiInput.js:5-8`](../src/entries/emojiInput.js#L5)) allows **up to 8 code points**, so
  `🌵🌵🌵` is a perfectly valid "face". A mood's face is then a string of glyphs that has to fit a 34dp
  circle, a 13pt chip and a heatmap cell.
- **Nothing says what the block is for.** The only copy is "Name your own" / "Give it a face, then a name.",
  which never states that this makes a **feeling of your own, represented by a single emoji**. The owner
  also flags the placeholder `"or type one…"` as wrong for a field whose entire content model is an
  emoji — "type" describes text.

The identical field exists a second time in the mood editor,
[`MoodManager.js:119-131`](../src/screens/MoodManager.js#L119), with the same `onEmojiTyped`
([`:33-36`](../src/screens/MoodManager.js#L33)) and the same placeholder. **Both are in scope** — fixing one
and not the other is how this defect survives into a fourth walk.

### Decided design — do not re-litigate

1. **The field holds exactly one emoji, enforced as the user types** — the same sanitize-on-change idiom
   IMP-066 used for the name field, not a rejection message. Extra emoji are dropped as they arrive; typed
   text simply does not appear.
2. **"One emoji" means one *rendered* emoji, not one code point.** `❤️` is two code points, `👍🏽` is two,
   `👨‍👩‍👧` is five, and a flag is a regional-indicator pair. Truncating by code point would cut `❤️` in
   half. The clustering is done by hand: **Hermes does not ship `Intl.Segmenter`**, and this repo already
   refuses to bet input validation on Hermes Unicode support
   ([`emojiInput.js:1-3`](../src/entries/emojiInput.js#L1)).
3. **Tag sequences (subdivision flags like 🏴󠁧󠁢󠁳󠁣󠁴󠁿) are deliberately not handled** — the base flag survives and
   the tags are dropped. `MOOD_PALETTE` is capped at Emoji 11 for Android 7 coverage
   ([`data.js:57-61`](../src/data.js#L57)); a subdivision flag would be tofu on the oldest supported device
   anyway.
4. **`isEmojiish` keeps its ≤ 8 code-point rule and stays where it is.** It is the *storage* validator —
   `sanitizeCustomMoodEmoji` ([`sanitizeSettings.js:27-35`](../src/persistence/sanitizeSettings.js#L27))
   uses it to decide which stored faces survive a restore. Tightening it would silently delete faces users
   already have. The new rule is an **input** rule; old multi-glyph faces keep rendering until their owner
   edits them, at which point they get truncated like anything else.
5. **The explanatory copy goes in the block's subtitle,** where "Give it a face, then a name." already sits,
   rather than as a new line — the block is already four rows tall on a small screen.
6. **Out of scope:** the palette itself, `MOOD_PALETTE`'s contents, the chip row (**IMP-069**), and any
   change to how faces are stored or restored.

### Steps

**1 — `src/entries/emojiInput.js`: add `firstEmoji`.** Leave `isEmojiish` and `stripEmoji` exactly as they
are and append:

```js
// The first complete emoji in `s`, or '' when it doesn't start with one
// (IMP-070). Grapheme clustering by hand, because Hermes ships no
// Intl.Segmenter: take one base code point, swallow the modifiers that belong
// to it (variation selectors, skin tones, the combining keycap), and after a
// ZWJ take the next base and its modifiers too. A regional-indicator pair (a
// flag) is one cluster. Tag sequences are not handled — a subdivision flag
// truncates to its base flag, which is deliberate: those are tofu on Android 7.
const isEmojiMod = (cp) =>
  (cp >= 0xfe00 && cp <= 0xfe0f) ||    // variation selectors — the ️ half of "❤️"
  (cp >= 0x1f3fb && cp <= 0x1f3ff) ||  // skin-tone modifiers
  cp === 0x20e3;                       // combining enclosing keycap
const isRegional = (cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff;

export function firstEmoji(s) {
  const cps = [...String(s ?? '').trim()];
  if (!cps.length || cps[0].codePointAt(0) < 0x00a0) return '';
  let i = 0;
  const takeBase = () => {
    if (isRegional(cps[i].codePointAt(0)) && cps[i + 1] && isRegional(cps[i + 1].codePointAt(0))) {
      i += 2;
      return;
    }
    i += 1;
    while (cps[i] && isEmojiMod(cps[i].codePointAt(0))) i += 1;
  };
  takeBase();
  while (cps[i] && cps[i].codePointAt(0) === 0x200d && cps[i + 1]) {
    i += 1;
    takeBase();
  }
  return cps.slice(0, i).join('');
}
```

**2 — `src/screens/WriteFlow.js`: the face field takes one.** Add `firstEmoji` to the `emojiInput` import.
`onEmojiTyped` ([`:45-48`](../src/screens/WriteFlow.js#L45)) becomes:

```js
// One emoji, kept as it is typed (IMP-070) — a face has to fit a 34dp circle,
// a chip and a heatmap cell. Anything that isn't an emoji leaves the field empty.
const onEmojiTyped = (v) => {
  const one = firstEmoji(v);
  setEmojiTyped(one);
  if (one) setEmojiPick(one);
};
```

**3 — `src/screens/WriteFlow.js`: the copy.** Two strings and one width:

- The subtitle ([`:154-156`](../src/screens/WriteFlow.js#L154)) becomes
  **`Make a feeling of your own: one emoji for its face, then what you call it.`**
- The face `TextInput`'s placeholder ([`:187`](../src/screens/WriteFlow.js#L187)) becomes
  **`or any emoji…`**, and its style's `width: 90` becomes `width: 110` so the new placeholder is not
  clipped (this matches `MoodManager`'s copy of the same field). `maxLength={12}` and everything else stay.

**4 — `src/screens/MoodManager.js`: the same two changes.** Add `firstEmoji` to the `emojiInput` import;
`onEmojiTyped` ([`:33-36`](../src/screens/MoodManager.js#L33)) gets the same three-line body as step 2; the
placeholder ([`:122`](../src/screens/MoodManager.js#L122)) becomes **`or any emoji…`** (its `width: 110` is
already right).

**5 — `src/screens/MoodManager.js`: the name field matches WriteFlow's.** Add `stripEmoji` to the same
import and change the name `TextInput` ([`:86-96`](../src/screens/MoodManager.js#L86)) from
`onChangeText={setNameInput}` to `onChangeText={(v) => setNameInput(stripEmoji(v))}`. IMP-066 did this to
the create path and left the edit path behind; a name carrying its own emoji is exactly what "1 · Its face"
exists to prevent.

### Tests (+10, and 2 existing assertions updated, no new suite files)

**`__tests__/entries/emojiInput.test.js`** (+7, in a new `describe('firstEmoji')`) — every `MOOD_PALETTE`
glyph round-trips to itself (one loop assertion, which covers the `❤️`/`☀️`/`⛈️` variation-selector pairs) ·
`'🌵🌵🌵'` → `'🌵'` · `'❤️🔥'` → `'❤️'` (the selector stays with its base, the second emoji is dropped) ·
`'👍🏽'` → `'👍🏽'` (skin tone kept) · a ZWJ sequence `'👨‍👩‍👧'` returns the whole string with no joiner left
dangling · `'abc'`, `''`, `null`, `undefined` → `''` · `'🙂abc'` → `'🙂'`.

**`__tests__/screens/WriteFlowMood.test.js`** (+2, **2 updated**) — the two existing cases at
[`:46`](../__tests__/screens/WriteFlowMood.test.js#L46) and [`:55`](../__tests__/screens/WriteFlowMood.test.js#L55)
look the field up by its old placeholder and must be repointed to `'or any emoji…'`; their assertions are
unchanged and must stay green. New: typing `'🌵🌵🌵'` leaves `'🌵'` in the field (`props.value`) and **Add**
fires with `'🌵'` · the block's subtitle
`'Make a feeling of your own: one emoji for its face, then what you call it.'` renders.

**`__tests__/screens/MoodManager.test.js`** (+1) — enter the edit sheet for a custom mood
(`fireEvent.press(view.getByLabelText('Edit Anxios'))`, the file's existing idiom), type `'😬😬'` into
`or any emoji…`, and the field holds `'😬'`.

### Done

`npm test` green at **the prior count + 10** (838 → **848** if IMP-069 landed first), **83 suite files,
unchanged**. `npx expo export --platform android` clean.
**Commit:** `fix(entries): a custom feeling gets one face, and the block says what it makes (IMP-070)`.
No `Release-Lane` trailer. Then tick the backlog row, write the session note, move this spec into
`docs/build-log.md`, and leave **WALK-04** for a walk chat — **do not walk it here.**

---

## IMP-071 — the filter row stops jumping under your thumb

**Lane: OTA.** No native change, no bump.
**Runtime proof: WALK-04**, re-run whole — not this chat.

**Why.** WALK-04 finding (g), 2026-08-15. **This reverses one line IMP-065 deliberately added** — it is a
design decision the owner made after living with it, not a defect in the implementation.

IMP-065 gave the Archive's mood filter row two behaviours at once: the selected chip sorts to the front, and
the row scrolls back to `x: 0` so the user can see where it went
([`ArchiveFilters.js:91-98`](../src/screens/ArchiveFilters.js#L91)). Walked live, the scroll is the problem:
picking a filter throws the whole row back to the start, so choosing a second and third mood means scrolling
right again each time to get back to where you were reading.

**The owner's call: the chip still moves to the front, the view does not move.** The consequence is
accepted knowingly — the chip you just tapped leaves the viewport, because it jumped to a front you are not
looking at. That is the trade IMP-065's comment argued against, and the owner has now made it the other way:
"selected moods live at the front of the row" is a rule you learn once and can then rely on, while losing
your scroll position is a cost you pay on every single tap.

### Decided design — do not re-litigate

1. **`orderMoodChips` stays exactly as it is** and keeps being used. Front-sorting is what answers WALK-04's
   first-pass finding (c) — a chip picked from deep in the row is still reachable later by flicking to the
   start, instead of being hunted for at an arbitrary position.
2. **The ref goes away entirely, not just the call.** A dead `useRef` on that `ScrollView` is an invitation
   to re-add a scroll, and this is the second design pass on these eight lines.
3. **The guard is a source assertion.** "This row must never programmatically scroll" is not observable
   through a rendered tree; `__tests__/shots.test.js` already establishes reading a source file in a test as
   a legitimate idiom in this repo.
4. **Out of scope:** `WriteFlow`'s chip row (it wraps, it never scrolls, and it belongs to **IMP-069**), the
   date-bound pickers, and the clear button.

### Steps

**1 — `src/screens/ArchiveFilters.js`: `toggleMood` stops scrolling.** Replace the whole function
([`:91-98`](../src/screens/ArchiveFilters.js#L91)) with:

```js
  // The selected chip sorts to the front (orderMoodChips) but the row deliberately
  // does NOT scroll to follow it (IMP-071, reversing IMP-065). Picking a second and
  // third filter used to cost a re-scroll each time. The accepted trade: the chip you
  // just tapped leaves the viewport — it is at the front, which is a fixed, learnable
  // place. Do not re-add a programmatic scroll here.
  const toggleMood = (m) => {
    const next = moods.includes(m) ? moods.filter((x) => x !== m) : [...moods, m];
    onChange({ text, moods: next, from, to });
  };
```

**2 — same file: delete the ref.** Remove `const chipScroll = useRef(null);`
([`:89`](../src/screens/ArchiveFilters.js#L89)) and the `ref={chipScroll}` prop from the horizontal
`ScrollView` ([`:142`](../src/screens/ArchiveFilters.js#L142)). Drop `useRef` from the React import — check
first that nothing else in the file uses it (nothing does today); if something does, leave the import alone.

### Tests (+2, no new suite files)

**`__tests__/screens/ArchiveFilters.test.js`** (+2, in a new `describe('ArchiveFilters — IMP-071')`) —
pressing an unselected chip calls `onChange` with that mood appended and `text`/`from`/`to` untouched · the
source of `src/screens/ArchiveFilters.js` contains no `scrollTo(`:

```js
const fs = require('fs');
const path = require('path');

// A source assertion on purpose: "never auto-scroll this row" is a decision
// about the code, and a rendered tree cannot show the absence of an imperative
// scroll (IMP-071).
test('the chip row never scrolls itself', () => {
  const src = fs.readFileSync(path.join(__dirname, '../../src/screens/ArchiveFilters.js'), 'utf8');
  expect(src).not.toMatch(/scrollTo\(/);
});
```

The file's existing IMP-065 cases — including both chip-order assertions — must stay green **untouched**;
the ordering is not what changed.

### Done

`npm test` green at **the prior count + 2** (848 → **850** if IMP-069 and IMP-070 landed first), **83 suite
files, unchanged**. `npx expo export --platform android` clean.
**Commit:** `fix(archive): the mood filter row stops jumping under your thumb (IMP-071)`.
No `Release-Lane` trailer. Then tick the backlog row, write the session note, move this spec into
`docs/build-log.md`, and leave **WALK-04** for a walk chat — **do not walk it here.**
