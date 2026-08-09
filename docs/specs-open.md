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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **577 passed, 58 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane |
| --- | --- | --- |
| 1 | [IMP-050 — every mood gets a face](#imp-050--every-mood-gets-a-face) | OTA |
| 2 | [IMP-051 — the keyboard stops eating the Next button](#imp-051--the-keyboard-stops-eating-the-next-button) | OTA |
| 3 | [IMP-052 — tap a day, read it](#imp-052--tap-a-day-read-it) | OTA |

> **IMP-052 must be built AFTER IMP-050.** Both rewrite `ArchiveScreen`'s `Heat`, and IMP-052 relies on
> the `cell.moods` field IMP-050 introduces. Taking them out of order means a merge conflict in a file
> neither spec expects to fight over.

---

### IMP-050 — every mood gets a face

**Lane:** OTA · **Free/Plus:** free (it is stored content — same line IMP-037 drew) · **Origin:** owner
report, 2026-08-09: *"when the user enters no mood in their entry, the grid has an empty square"* + *"when
creating a new mood, need to give the user the ability to select emote as well as the mood name"*.

**The problem, proven not theorised.** [`src/data.js:51`](../src/data.js#L51) is
`moodEmoji = (m) => MOOD_EMOJI[m] || ''`. `MOOD_EMOJI` holds exactly the 8 built-in moods, so **anything
else resolves to an empty string** — silently, with no fallback, in all seven places moods are drawn:
[`calendar.js:55/84`](../src/home/calendar.js#L55) (heatmap cells),
[`ArchiveScreen.js:94/140`](../src/screens/ArchiveScreen.js#L94) (chips + grid),
[`ReadingSheet.js:27`](../src/screens/ReadingSheet.js#L27),
[`InsightsScreen.js:134`](../src/screens/InsightsScreen.js#L134) (mood mix),
[`DeeperInsights.js:84/105/125`](../src/screens/DeeperInsights.js#L84),
[`AnnualRecap.js:87`](../src/screens/AnnualRecap.js#L87) and
[`WriteFlow.js:119`](../src/screens/WriteFlow.js#L119) (the chip you just created).

Two distinct inputs hit that `|| ''`, and they are **not the same bug**:

1. **Every custom mood from IMP-037.** A user-invented feeling has no `MOOD_EMOJI` entry and there is no
   way to give it one. This is the larger half — the feature shipped half-drawn.
2. **An entry with `moods: []`.** The app's own UI cannot produce one — [`WriteFlow.js:33`](../src/screens/WriteFlow.js#L33)
   is `canNext = isMood ? moods.length > 0 : …`, so **mood is already mandatory** and "make it mandatory"
   is a no-op. `moods: []` arrives only from data: the v2→v3 migration
   ([`state.js:9`](../src/persistence/state.js#L9), `mood ? [mood] : []`) or a restored backup. The two the
   owner saw on the emulator were the WALK-01 fixture's deliberate cases
   ([`gen-v2-fixture.js:60–67`](../scripts/gen-v2-fixture.js#L60)) — the migration working correctly.

Note for calibration: such a cell is **not** styled as a missed day.
[`ArchiveScreen.js:131–134`](../src/screens/ArchiveScreen.js#L131) gives written days a filled `accentSoft`
tile with a solid border and missed days `💀` on a dashed transparent one. The defect is a filled tile with
a hole in it, not a day misreported as missed.

**No migration is needed and none may be written.** IMP-037 is in the post-vc11 batch that has never
reached a device or an OTA, so **zero users have ever created a custom mood.** The `✨` fallback below
exists for restored dev backups and for a `sanitizeSettings` wipe — not for real legacy data. Do not write
a migration, and **never back-fill a mood onto a `moods: []` entry**: inventing a feeling the user did not
record is the one thing this app does not do.

**Decided design, do not re-litigate.**

- **Two fallbacks, two named constants.** `moods: []` → `NO_MOOD_EMOJI = '🌫️'` ("a day kept, feeling
  unnamed" — deliberately unlike all 8 mood glyphs and unlike `💀`). A named mood with no emoji on record
  → `CUSTOM_MOOD_FALLBACK = '✨'`.
- **A parallel map, not a reshaped list.** `settings.customMoods` stays `string[]`; the emoji live in a new
  `settings.customMoodEmoji: { [name]: emoji }`. Entries store mood **names**, and `search.js`, `deeper.js`,
  `annualRecap.js`, `derive.js` and `ArchiveFilters` all key on those strings — reshaping `customMoods`
  would ripple through six modules for nothing.
- **The map is threaded as an explicit prop.** No module-level registry, no new context, no hanging it off
  the theme. `moodEmoji`'s second argument is optional, so any call site missed in review degrades to `✨`
  — never back to blank, never to a crash.
- **`calendar.js` stops resolving emoji.** It is a pure date-grid helper; glyph lookup is the only reason it
  would ever need settings. Cells carry moods, screens resolve.
- **A day with several moods shimmers** (owner decision, 2026-08-09). One shared ~2.5s tick; single-mood
  cells never move. See step 6 — the constraints there are the design, not suggestions.

**Steps**

1. **RED first — `__tests__/data/moodEmoji.test.js`.** Against the new two-argument signature. Cases, all
   required:
   - A built-in (`'Proud'`) → `'😌'`, with and without a custom map passed.
   - A custom mood present in the map → the map's emoji.
   - A custom mood **absent** from the map → `CUSTOM_MOOD_FALLBACK`.
   - `''`, `undefined`, `null` → `NO_MOOD_EMOJI`. **This is the blank-cell fix; pin it hard.**
   - A built-in name that also appears in the custom map → the **built-in** wins (a restored map can never
     repaint the eight).
   - Called with no second argument at all → never returns `''` for any input.
2. **GREEN — [`src/data.js`](../src/data.js).** Add `NO_MOOD_EMOJI`, `CUSTOM_MOOD_FALLBACK`, and
   `MOOD_PALETTE` (the 40 below). Change the resolver to:
   `export const moodEmoji = (m, custom = {}) => MOOD_EMOJI[m] || custom[m] || (m ? CUSTOM_MOOD_FALLBACK : NO_MOOD_EMOJI);`
   `MOOD_PALETTE`, exactly these 40, in this order — **chosen for Android 7 font coverage (`minSdkVersion`
   is 24). Do not add Emoji 12+ glyphs; they render as tofu on the oldest supported devices.** None
   duplicates a built-in mood, `💀`, `🌫️` or `✨` (`✨` is excluded on purpose, so it unambiguously means
   "no emoji chosen"):
   `🙂 😊 😄 😅 😆 😔 😞 😟 😢 😭 😡 😳 🤔 🤗 😇 😬 ❤️ 💔 💛 💙 🔥 💧 🌊 🌱 🌿 🍂 🌻 🌸 🌙 ⭐ ☀️ 🌈 ⛈️ ❄️ 🕊️ 🦋 🐌 🏔️ 🗝️ ⚓`
3. **RED then GREEN — `__tests__/entries/emojiInput.test.js` + new pure
   [`src/entries/emojiInput.js`](../src/entries/emojiInput.js).** `isEmojiish(s)` validates the escape
   hatch in step 5. **Code-point based, no `\p{…}` regex** — Hermes's Unicode property-escape support is
   not worth betting the input validator on. The rule, and it is the whole rule:
   ```js
   const cps = [...String(s ?? '').trim()];
   return cps.length > 0 && cps.length <= 8 && cps.every((ch) => ch.codePointAt(0) >= 0x00a0);
   ```
   Required cases: `'😊'` true · `'❤️'` true (variation selector) · `'👨‍👩‍👧‍👦'` true (ZWJ, U+200D ≥ 0xA0) ·
   `'🇮🇳'` true · `'abc'` false · `'1'` false · `'hi 👋'` false (the ASCII space kills it) · `''` false ·
   `'   '` false · `null`/`undefined` false · a 9-code-point string false · never throws.
4. **`settings.customMoodEmoji` — default + sanitizer.** Add `customMoodEmoji: {}` to `DEFAULT_SETTINGS`
   in [`src/theme.js`](../src/theme.js#L116), directly under `customMoods`, with a one-line comment
   pointing at IMP-050. Then give it a **per-key exception** in
   [`src/persistence/sanitizeSettings.js`](../src/persistence/sanitizeSettings.js) — the same kind
   `accent`, `reminder` and `recapSeen` already have: not a plain object (or an array, or null) → `{}`;
   otherwise **keep the object and drop only the individual values failing `isEmojiish`**. Losing one bad
   glyph must not cost the user their other custom moods. Add these cases to the existing
   `__tests__/persistence/sanitizeSettings.test.js`: a string → `{}` · an array → `{}` · a good map kept
   verbatim · a mixed map keeps the good keys and drops `{ Sleepy: 'zzz' }` · input never mutated.
5. **The picker — [`src/screens/WriteFlow.js`](../src/screens/WriteFlow.js).** The "Name your own…" row at
   line 125 gains an emoji selector directly **above** it (above, so the new controls do not sit under the
   keyboard the name field raises — IMP-051 fixes that properly, this ordering is independent of it):
   - A horizontal `ScrollView` of `MOOD_PALETTE`, each a tappable ~34pt round chip, selected one ringed in
     `c.accent`. **`MOOD_PALETTE[0]` is selected by default**, so **Add** is never blocked on the emoji.
   - Then the escape hatch: a small `TextInput` (`maxLength={12}`, placeholder `'or type one…'`,
     `autoCorrect={false}`). On change, if `isEmojiish(v)` the typed value becomes the selection and the
     palette ring clears; if not, the field shows itself in `c.border` and the palette selection stands.
     **No alert, no toast** — the field either takes or it does not.
   - `addCustomMood` now calls `onAddCustomMood(name, emoji)` and resets **both** fields.
   - The rendered chips at line 105 use `moodEmoji(m, customMoodEmoji)`, so a mood shows its own face the
     instant it is created.
   - New props: `customMoodEmoji = {}`.
   Component test `__tests__/screens/WriteFlowMood.test.js` (`@testing-library/react-native`, already a
   devDependency): a palette tap changes the selection · typing `'🌵'` selects it · typing `'abc'` does not
   · **Add** with a name and no explicit emoji choice still fires `onAddCustomMood` with
   `MOOD_PALETTE[0]` · the new chip renders its chosen emoji, not `✨`.
6. **The multi-mood shimmer.** Three new pieces, in this order:
   - **`src/entries/moodFace.js`** (pure, RED first in `__tests__/entries/moodFace.test.js`):
     `hashKey(k)` → `[...String(k)].reduce((h, ch) => (h * 31 + ch.codePointAt(0)) >>> 0, 7)`, and
     `moodFace(moods, tick = 0, dayKey = '')` → `''` when `moods` is not a non-empty array, else
     `moods[(hashKey(dayKey) + tick) % moods.length]`. Cases: a single mood is returned for **every** tick
     0–10 (single-mood days must never move) · a 3-mood day cycles all three across consecutive ticks and
     returns to the first · two different `dayKey`s with the same `moods` and the same tick generally
     differ (the phase offset) · `[]`/`null`/`undefined` → `''` · never throws.
   - **`src/ui/useMoodTick.js`**: `useMoodTick({ enabled, seed = 0 })` → an integer. `useState(seed)`.
     A ~2500ms `setInterval` incrementing it runs **only** when `enabled` **and** `AppState` is `'active'`
     **and** reduce-motion is off (`AccessibilityInfo.isReduceMotionEnabled()` plus a
     `'reduceMotionChanged'` subscription). Every subscription and the interval are cleaned up on unmount
     and whenever the conditions go false. **When it is not ticking it returns `seed`, not `0`** — that is
     what makes the reduce-motion and backgrounded cases still show a day-varying face instead of
     collapsing to "first mood tapped, forever". Test `__tests__/ui/useMoodTick.test.js` with
     `jest.useFakeTimers()`: ticks while enabled · does **not** tick when `enabled` is false · returns
     `seed` when disabled · clears its interval on unmount (assert via `jest.getTimerCount()`).
   - **[`src/home/calendar.js`](../src/home/calendar.js)**: in `buildHeatmap` **and**
     `buildLifetimeHeatmap`, replace the `mood` + `emoji` cell fields with a single
     `moods: entry.moods || []`, and delete the now-unused `MOOD_EMOJI` import. Safe: `cell.emoji` has
     exactly one consumer ([`ArchiveScreen.js:140`](../src/screens/ArchiveScreen.js#L140)) and
     `buildLifetimeHeatmap`'s only consumer ([`InsightsScreen.js:56`](../src/screens/InsightsScreen.js#L56))
     styles cells through `heatCells.cellState` and reads neither field. `buildWeekStrip` is untouched — it
     never carried an emoji.
   - **[`src/screens/ArchiveScreen.js`](../src/screens/ArchiveScreen.js)**: `Heat` already receives
     `cells`, so it computes **both** arguments itself and `ArchiveScreen` passes it only the new
     `customMoodEmoji` — `enabled` is a `useMemo` over the cells,
     `cells.some((c) => (c.moods || []).length > 1)`, so a grid with nothing to animate starts no timer at
     all; `seed` is `hashKey(cells[cells.length - 1].dayKey)`, and that last cell is always today, so the
     phase changes daily with no new imports and no clock plumbing. It then renders
     `moodEmoji(moodFace(cell.moods, tick, cell.dayKey), customMoodEmoji)`.
   **All multi-mood cells change on the same tick but sit at different phases, so they land on different
   moods. That is intended.** Do not add per-cell timers chasing a staggered look — 35 independent
   intervals is not worth it, and the unison beat is calmer than the alternative.
7. **Update `__tests__/home/calendar.test.js`.** Four assertions reference the deleted fields (lines 25, 30,
   36–37, 52) and one test is *named* `'uses only the first mood when an entry carries several'` — its
   intent is now **wrong**, not just its assertion. Rewrite it as
   `'carries every mood on the cell, in order'` asserting `cell.moods` is `['Proud', 'Tender']`. Keep the
   same-day collision test at line 52 (newest wins) — assert on `cell.moods` instead of `cell.mood`.
8. **Thread the map — 5 mount points in [`src/RitualsApp.js`](../src/RitualsApp.js)**, each getting
   `customMoodEmoji={settings.customMoodEmoji || {}}`: line 607 `InsightsScreen` (which passes it on to
   `DeeperInsights` at both call sites, lines 185 and 187), line 615 `ArchiveScreen`, line 728
   `ReadingSheet`, line 827 `AnnualRecap`, line 718 `WriteFlow`. **`ArchiveScreen` needs
   `customMoods={settings.customMoods || []}` as well** — not for its own rendering, but to hand both down
   to `ArchiveFilters` in step 9; it is the only mount point that needs the pair. Then
   `addCustomMood` at line 431 takes `(name, emoji)` and writes **both** slices in one immutable update —
   the existing dedupe on `customMoods` stays, and re-adding an existing name updates its emoji.
9. **[`src/screens/ArchiveFilters.js`](../src/screens/ArchiveFilters.js)** currently offers only the 8
   built-ins (line 9 imports `MOODS` alone), so a feeling you invented **cannot be searched for** — the
   same second-class treatment, on the surface whose entire job is retrieval. Take `customMoods` and
   `customMoodEmoji` as props and map over `[...MOODS, ...customMoods]`, exactly as WriteFlow does. Two
   lines, and it is what makes IMP-037 honest.
10. **A regression test that the mandatory-mood gate cannot silently regress** — in
    `__tests__/screens/WriteFlowMood.test.js`, assert the finish button is disabled with zero moods
    selected and enabled with one. It is already true today; nothing in this spec should make it untrue,
    and it is the rule the owner asked about.
11. `npm test` green (≥ 577), `npx expo export --platform android` clean.

**Do NOT**: write a data migration · back-fill a mood onto a `moods: []` entry · make the heatmap cell
pressable (a genuinely good idea — log it to `PROGRESS.md` → Open items as a future IMP, do not build it
here) · let custom moods override the 8 built-in emoji · add a delete/rename flow for custom moods · touch
`MISS_EMOJI` or any `💀` rendering.

**Commit:** `feat(entries): every mood gets a face — custom emoji, a glyph for moodless days, and multi-mood cells that breathe (IMP-050)`

---

### IMP-051 — the keyboard stops eating the Next button

**Lane:** OTA · **Free/Plus:** N/A (defect) · **Origin:** owner report, 2026-08-09: *"when the keyboard
comes up to type, the Next button is hidden at the bottom, so the user has to keep closing their keyboard
just for one button tap."*

**The problem — three compounding causes, which is why it is fully broken rather than merely janky.**

1. [`WriteFlow.js:50`](../src/screens/WriteFlow.js#L50) is
   `behavior={Platform.OS === 'ios' ? 'padding' : undefined}`. On Android a `KeyboardAvoidingView` with no
   `behavior` **does nothing at all**. The component is inert by construction on the only platform that
   ships.
2. WriteFlow renders inside an RN `Modal` ([`RitualsApp.js:708`](../src/RitualsApp.js#L708)). Android
   renders that as a **separate dialog window**, which does not inherit the activity's
   `windowSoftInputMode=adjustResize`.
3. The app is `targetSdkVersion 36` with edge-to-edge forced (IMP-027). Under edge-to-edge the system
   **stops resizing the window for the IME**; the app is expected to consume the inset itself.

Any fix that relies on the window resizing loses to (2) and (3). So the fix does not rely on it: read the
keyboard height from the keyboard events directly and spend it as padding.

**Decided design, do not re-litigate.** The footer stays exactly where the design puts it and simply rides
above the keyboard. **The owner's "move Next to the top bar" idea is the documented fallback for step 5, to
be built only if the walk shows the footer fix failing** — it is not built speculatively, because moving
the primary action mid-flow is its own confusion. `react-native-keyboard-controller` is the textbook answer
and is **wrong here**: a native module is BUILD lane, cannot reach anyone until vc11 is promoted, and would
need its own R8 walk (IMP-044). This spec stays pure JS and OTA-shippable.

**Steps**

1. **Measure before theorising** — the IMP-042 precedent, and non-optional. On the emulator, with WriteFlow
   open on step 0, log `e.endCoordinates.height` from a temporary `keyboardDidShow` listener alongside
   `insets.bottom`. **Write both measured numbers into the step-3 code as a comment before writing the
   fix**, and into the session note. Whether Android's reported IME height already includes the navigation bar under
   edge-to-edge is exactly the detail that half the material on this is wrong about, and it decides whether
   step 3 adds or replaces `insets.bottom`. Remove the temporary listener afterwards.
2. **New hook `src/ui/useKeyboardHeight.js`** — `useKeyboardHeight()` → a number, `0` when closed.
   Subscribes to `keyboardWillShow`/`keyboardWillHide` on iOS (smoother, and it is what the current
   `behavior="padding"` effectively gives) and `keyboardDidShow`/`keyboardDidHide` on Android, **which is
   all Android emits** — do not subscribe to `keyboardWillShow` there and wonder why nothing fires. Stores
   `e.endCoordinates.height`. Both subscriptions removed on unmount. Test
   `__tests__/ui/useKeyboardHeight.test.js` by mocking `react-native`'s `Keyboard.addListener` to capture
   and fire handlers: 0 initially · the reported height after a show · 0 after a hide · both subscriptions
   removed on unmount · the Android path subscribes to the `did*` events, not `will*`.
3. **[`src/screens/WriteFlow.js`](../src/screens/WriteFlow.js)** — delete the `KeyboardAvoidingView`
   (and its import — **and `Platform`, whose only use in the file is the dead `behavior` ternary at line
   50; leaving it violates the no-dead-code rule**) for a plain `View` with the same style plus
   `paddingBottom: kb`, where
   `const kb = useKeyboardHeight()`. `Foot` takes `kb` and uses
   `paddingBottom: 12 + (kb > 0 ? 0 : insets.bottom)` — **the safe-area inset is replaced while the
   keyboard is up, not added to**, unless step 1's measurement says otherwise, in which case follow the
   measurement and say so in a comment. The `ScrollView` shrinks on its own; nothing needs to scroll into
   view and nothing changes position. This covers all three steps of the flow, including the mood step's
   "Name your own…" field and IMP-050's emoji escape hatch if that has landed first.
4. **The other two keyboard-in-a-Modal screens get the same one-line treatment**, because they have the
   identical three causes: [`ArchiveFilters.js`](../src/screens/ArchiveFilters.js) (journal search, inside
   the archive's own Modal) and [`NameEditModal.js`](../src/screens/NameEditModal.js). **Confirm each
   actually reproduces on the emulator before touching it** — if one is already fine, say so in the session
   note and leave it alone. [`Onboarding.js`](../src/screens/Onboarding.js) has a `TextInput` but is **not**
   inside a Modal; it is out of scope for this spec.
5. **Walk it on the emulator and record the result** in the session note: keyboard up on step 0 → **Next**
   fully visible and tappable without dismissing · same on step 1 · same for the mood step's custom-name
   field · rotating through all three steps does not leave stale padding · dismissing the keyboard with the
   back gesture restores `insets.bottom`. **If the footer is still covered after step 3, stop and take the
   fallback**: `Next` moves to the top bar (replacing the step-dot row's right slot) while `kb > 0`, and
   the footer hides. Log which branch was taken.
6. `npm test` green (≥ 577), `npx expo export --platform android` clean.

**Do NOT** add `react-native-keyboard-controller` or any other native dependency · set
`softwareKeyboardLayoutMode` or `windowSoftInputMode` in `app.config.js` (it cannot reach the Modal's
window, and it would turn an OTA into a BUILD) · change any `Modal`'s `presentationStyle` · restructure the
three-step flow · touch `Onboarding.js`.

**Commit:** `fix(writeflow): lift the footer above the keyboard instead of hiding Next under it (IMP-051)`

---

### IMP-052 — tap a day, read it

**Lane:** OTA · **Free/Plus:** free (retrieval — the line the playbook draws is that a user's own words are
never gated) · **Origin:** logged out of IMP-050's design review, 2026-08-09, and confirmed by the owner as
the next task.

**⛔ Sequencing: build this AFTER [IMP-050](#imp-050--every-mood-gets-a-face).** Both rewrite `Heat` in
`ArchiveScreen`, and this spec reads the `cell.moods` field IMP-050 introduces.

**The problem.** The Reflections heatmap is the most information-dense surface in the app — 35 days of your
life, at a glance — and it is **inert**. [`ArchiveScreen.js:123`](../src/screens/ArchiveScreen.js#L123)
renders each cell as a plain `View`. The same is true of the lifetime heatmap at
[`InsightsScreen.js:230`](../src/screens/InsightsScreen.js#L230). You can see that 14 March was a heavy day
and there is no way to ask what happened. The only route to an old entry is scrolling the list below, or
searching for a word you must already remember.

That is the exact gap the playbook's product thesis names: *"the app today is all continuity and no
retrieval… which makes the archive write-only."* IMP-035 gave it search; this gives it the gesture every
user will try first, unprompted, because a grid of days looks tappable.

**Decided design, do not re-litigate.**

- **Only days you wrote are pressable.** Missed (`💀`), empty and future cells take no press, get no ripple
  and no `accessibilityRole` — a cell that responds to a tap with nothing feels broken in a way that not
  responding does not.
- **A tap opens the existing `ReadingSheet`, through the existing handler.** Grid and list are two doors to
  one room; the grid must also mark the "tend an old grave" quest revisited (IMP-013), which the shared
  handler already does.
- **Tapping today's empty cell does NOT open WriteFlow.** Considered and rejected: the archive is for
  retrieval, writing lives on Home behind a deliberate CTA, and an accidental tap throwing up a
  full-screen write modal is a worse failure than a no-op. Do not add it later without the owner.
- **Both heatmaps, or neither.** They are the same visual idiom on two tabs; making one tappable and not
  the other is precisely the kind of inconsistency this app keeps filing bugs about.

**Steps**

1. **RED first — `__tests__/entries/find.test.js` + new pure
   [`src/entries/find.js`](../src/entries/find.js)** exporting `entryForDayKey(entries, dayKey)`.
   **It must resolve collisions the same way [`calendar.js`](../src/home/calendar.js#L26)'s private
   `indexByDay` does — first match in array order wins ("newest wins", since entries are newest-first).**
   If the two disagree, the grid paints one entry's mood and opens a different entry, which is a worse bug
   than the one this spec fixes. Cases: finds the entry · **two entries on one dayKey → the first in array
   order, the same one `buildHeatmap` paints** · no match → `null` · `null`/`[]`/malformed rows (a `null`
   in the array, a row with no `dayKey`) → `null`, never throws.
2. **Lift the shared open-handler in [`src/RitualsApp.js`](../src/RitualsApp.js).** The inline arrow at
   line 617 (`(e) => { setReading(e); setQuests((qs) => markRevisited(qs, e, todayKey())); }`) becomes a
   named `openEntry` const beside the other handlers, passed to `ArchiveScreen` (unchanged behaviour) and
   **also to `InsightsScreen` as a new `onOpen` prop**. One definition, two callers — do not duplicate it.
3. **[`src/screens/ArchiveScreen.js`](../src/screens/ArchiveScreen.js).** `Heat` takes `entries` and
   `onOpen`. A cell that is neither `missed` nor `empty` renders as a `Pressable` instead of a `View`;
   everything else stays a `View`. On press: `const e = entryForDayKey(entries, cell.dayKey); if (e) onOpen(e);`
   — the guard is not optional, since a cell can outlive its entry by one render after a delete (IMP-036).
   Details, all required:
   - `hitSlop={3}`. The grid gap is 6, so 3 is the largest slop that cannot overlap a neighbour — and the
     cells are only ~40dp on a 360dp screen, under the 48dp target.
   - Press feedback `transform: [{ scale: pressed ? 0.92 : 1 }]`. The list cards use `0.99`, but they are
     full-width; a 40dp square needs a visible amount.
   - `accessibilityRole="button"` and `accessibilityLabel` = the day and its moods, e.g.
     `` `${cell.dayKey}, ${(cell.moods || []).join(', ') || 'no mood recorded'}` ``. Non-pressable cells get
     **neither** — no role, no label.
   - **The grid is not filtered.** It shows all 35 days while the list below shows search results, so a day
     filtered out of the list stays openable from the grid. That is correct and deliberate; do not "fix" it
     by filtering the heatmap.
4. **[`src/screens/InsightsScreen.js`](../src/screens/InsightsScreen.js)** — the same treatment for
   `LifetimeHeat` (line 215), which already carries `dayKey` on every cell from `buildLifetimeHeatmap`.
   `cellState(cell) === 'done'` is the pressable condition. The today-ring child at line 239 already has
   `pointerEvents="none"`, so it will not swallow the press — leave it exactly as it is. **If this step
   turns out to need more than the Pressable swap and the two new props, STOP and log it to
   `PROGRESS.md` → Open items rather than expanding here.**
5. **Component test `__tests__/screens/ArchiveHeat.test.js`** (`@testing-library/react-native`): pressing a
   written day calls `onOpen` with **that day's** entry · pressing a missed day calls nothing · pressing an
   empty day calls nothing · a written day whose entry has been removed from `entries` calls nothing and
   does not throw · pressable cells expose `accessibilityRole="button"` and non-pressable cells do not.
6. `npm test` green (≥ 577, or ≥ whatever IMP-050 left it at), `npx expo export --platform android` clean.

**Do NOT** open WriteFlow from any cell · filter the heatmap to match the search query · make the week
strip on Home tappable (different component, different spec, ask the owner first) · add a long-press menu ·
change `ReadingSheet` · touch the quest logic beyond reusing `openEntry`.

**Commit:** `feat(archive): tap a day on either heatmap to read it (IMP-052)`
