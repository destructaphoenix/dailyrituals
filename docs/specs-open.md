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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **632 passed, 64 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane |
| --- | --- | --- |
| 1 | [IMP-052 — tap a day, read it](#imp-052--tap-a-day-read-it) | OTA |
| 2 | [IMP-053 — search shows you the match](#imp-053--search-shows-you-the-match) | OTA |
| 3 | [IMP-054 — the reminder you can actually answer](#imp-054--the-reminder-you-can-actually-answer) | OTA |
| 4 | [IMP-055 — manage your feelings](#imp-055--manage-your-feelings) | OTA |
| 5 | [IMP-060 — a candle burns without telling you](#imp-060--a-candle-burns-without-telling-you) | OTA |
| 6 | [IMP-059 — the app has one accessibility label](#imp-059--the-app-has-one-accessibility-label) | OTA |
| 7 | [IMP-058 — prompt packs](#imp-058--prompt-packs) | OTA |

> **IMP-056 is done (2026-08-10), IMP-050 is done (2026-08-10) and IMP-051 is done (2026-08-10) — see
> `docs/build-log.md`.** **IMP-057 is still deliberately absent.** It is reserved for the historical
> `dayKey` migration IMP-056 deferred, and it cannot be written until a real device's numbers come back from
> the dev-panel Inspector's "Data health" reporter IMP-056 added. **Do not reuse the number.**
>
> **The two ordering constraints that gated IMP-052 and IMP-055 on IMP-050 are now cleared** — IMP-050
> landed this session, so `cell.moods`, `settings.customMoodEmoji` and the emoji palette all exist. Take
> the remaining seven specs in any order.
>
> **IMP-054 is the one spec `npm test` cannot finish alone** — it needs an emulator. Budget for that before
> starting it.

---

### IMP-052 — tap a day, read it

**Lane:** OTA · **Free/Plus:** free (retrieval — the line the playbook draws is that a user's own words are
never gated) · **Origin:** logged out of IMP-050's design review, 2026-08-09, and confirmed by the owner as
the next task.

**✅ Unblocked — IMP-050 is done (2026-08-10, see `docs/build-log.md`).** Both rewrite `Heat` in
`ArchiveScreen`, and this spec reads the `cell.moods` field IMP-050 introduced.

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

---

### IMP-053 — search shows you the match

**Lane:** OTA · **Free/Plus:** free (retrieval — a user's own words are never gated) · **Origin:** found
while reviewing IMP-050, 2026-08-09; owner picked it as the next spec.

**No ordering dependency**, but it lands in the same result card IMP-050 edits. If IMP-050 has not shipped
yet, **do not touch the mood chips at [`ArchiveScreen.js:94`](../src/screens/ArchiveScreen.js#L94)** — this
spec's changes sit above them.

**The problem.** [`ArchiveScreen.js:89`](../src/screens/ArchiveScreen.js#L89) renders every result card the
same way, whether you are browsing or searching:
`<T … numberOfLines={2}>{e.did}</T>` — **always the first two lines of `did`, unconditionally.**

But [`searchEntries`](../src/insights/search.js#L28) matches against
`normalize(`${e.did} ${e.wished}`)`. So a hit in `wished`, or a hit in the fourth paragraph of `did`,
produces a card whose visible text **does not contain the search term anywhere**. The user is shown a list
of days and left to open each one to find out why it is there. There is no snippet function in
`search.js` — the whole module returns entries and nothing else.

IMP-035 built the retrieval engine and then hid its output. This is the missing half, and the playbook's
product thesis is explicit that *"search is the highest-value non-design task in the codebase."*

**⚠️ The one hard part, and it is a correctness trap.** You cannot find the match in the normalized string
and slice the original at that index. [`foldDiacritics`](../src/insights/search.js#L7) is
`normalize('NFD')` + strip combining marks, which **changes the string's length**: `'café'` is 4 code
points, its NFD form is 5, and the folded result is 4 again — but a string containing several accents
drifts by a different amount at every accent. Emoji make it worse: they are surrogate pairs, so UTF-16
indices and code-point indices disagree the moment anyone writes 🎂 in their journal. **A naive
`indexOf` on the folded string will highlight the wrong characters, and it will do it only for users who
write accents or emoji — i.e. it will look perfect in testing and be wrong in the owner's own market.**

The fix is a **length-preserving, per-code-point fold**, so folded index *n* always maps to original code
point *n*.

**Decided design, do not re-litigate.**

- **A new pure module, `searchEntries` untouched.** Its filtering behaviour is shipped and tested; this
  spec adds a renderer's helper beside it and changes nothing about which entries match.
- **First match only.** No multi-highlight, no match counting.
- **`did` wins over `wished`** when both match, and the card says which field it took the snippet from.
- **A match that exists only across the `did`/`wished` join** (the space `searchEntries` concatenates with)
  yields **no** snippet, and the card falls back to today's behaviour. That is a deliberate, tested,
  documented outcome — not a bug to chase.

**Steps**

1. **RED first — `__tests__/insights/snippet.test.js`** against a module that does not exist yet.
2. **GREEN — new pure [`src/insights/snippet.js`](../src/insights/snippet.js)**, importing
   `foldDiacritics` from `search.js` (do not re-implement it). Four exports:
   - `foldChar(ch)` — `foldDiacritics(ch).toLowerCase()`, then **its first code point**; if that is empty,
     return `ch` unchanged. **Both guards are required**: a lone combining mark folds to `''`, and `'İ'`
     (U+0130) lowercases to *two* code points on some engines. Either would break the 1:1 map.
   - `foldChars(s)` — `[...String(s ?? '')].map(foldChar)`. **Exactly one output element per input code
     point. This invariant is the whole spec; assert it directly in a test.**
   - `indexOfSeq(hay, needle)` — naive array-substring search returning a **code-point index** or `-1`.
     Entries are a few hundred characters; do not import or write anything cleverer than the obvious
     double loop.
   - `entrySnippet(entry, text, { lead = 30, tail = 200 } = {})` → `null`, or
     `{ field: 'did' | 'wished', before, match, after, truncatedStart }`. Searches `did` then `wished`
     **separately**; slices the **original** field by code point (`[...field].slice(a, b).join('')`);
     `before` starts at `max(0, matchStart - lead)` with `truncatedStart` set when that clipped anything;
     `after` runs at most `tail` code points past the match.
   Required cases: a mid-string match · a match at index 0 (`truncatedStart` false) · case-insensitive ·
   **searching `'cafe'` against `'un café noir'` highlights `'café'` — the accented original, not `'cafe'`**
   · the reverse, `'café'` matching `'un cafe noir'` · **a string with an emoji before the match highlights
   the right slice** (the surrogate-pair test — this is the one that catches UTF-16 indexing) ·
   `foldChars(s).length === [...s].length` over a mixed string of accents, emoji and ASCII · a match only in
   `wished` → `field: 'wished'` · a match in both → `'did'` · a needle matching only across the
   `did`/`wished` join → `null` · empty/whitespace needle → `null` · `null`/`undefined` entry, and an entry
   missing both fields → `null`, never throws.
3. **[`src/screens/ArchiveScreen.js`](../src/screens/ArchiveScreen.js)** — replace the unconditional
   `numberOfLines={2}` line at 89. When `query.text` is set **and** `entrySnippet` returns a snippet:
   render `{truncatedStart ? '…' : ''}{before}`, then the match inside a nested
   `<T w={800} color={c.accentDeep}>` (nesting works — [`T`](../src/ui.js#L12) is a thin `Text` wrapper and
   always sets its own `fontFamily` and `color`, so the highlight cannot inherit a half-style), then
   `{after}`. Keep `numberOfLines={2}` on the outer `T` — it clips the tail for free.
   When the match came from `wished`, prefix the line with a small `c.muted` `wished` label so the user
   knows which question it answered. **No snippet, or no text query → exactly today's rendering**, unchanged.
4. **Component test `__tests__/screens/ArchiveResults.test.js`** (`@testing-library/react-native`):
   searching a word that appears only in `wished` renders it **and** the `wished` label · searching a word
   deep in `did` renders it · with no text query the card renders `e.did` as before · a mood-only filter
   (no `text`) renders no highlight.
5. `npm test` green (≥ 577, or ≥ whatever the specs before it left), `npx expo export --platform android` clean.

**Do NOT** change `searchEntries`, `normalize` or `foldDiacritics` · tokenize the query into words (it is a
substring search today; changing that is a different spec with different tests) · highlight more than the
first match · add match counts, relevance scoring or sorting changes · touch `ReadingSheet`.

**Commit:** `feat(archive): show the matched words in search results, not the first two lines (IMP-053)`

---

### IMP-054 — the reminder you can actually answer

**Lane:** OTA · **Free/Plus:** free · **Origin:** the *"no `setNotificationHandler` anywhere in the tree"*
finding logged in `PROGRESS.md` on **2026-07-31** and never scoped; a second, larger gap found alongside it
on 2026-08-09.

**Two gaps, same subsystem, one walk.**

**(a) A reminder that fires while the app is open shows nothing.** `setNotificationHandler` appears
**nowhere** in the tree — the single grep hit is the dev panel's own hint string
([`NotifySection.js:119`](../src/dev/panel/NotifySection.js#L119)) *documenting* the absence. Under
`expo-notifications`' default, a foreground notification on Android displays nothing at all. The behaviour
was never chosen; it is just what happens.

**(b) Tapping the reminder does not take you to the write flow.** There is no
`addNotificationResponseReceivedListener` and no `getLastNotificationResponseAsync` call anywhere. Tapping
the notification opens the app on whatever tab it was last left on. A notification whose entire purpose is
*"write today's entry"* drops the user on the You tab if that is where they were. **`PROGRESS.md`'s IMP-044
R8 walk checklist lists "reminder fires + tap routes" as if routing existed — it does not.** Correct that
line when this ships.

**API facts, verified against the installed `expo-notifications` 0.32.17 — do not copy a snippet off the
internet, most are written for the old API.**

- `shouldShowAlert` is **deprecated**. The handler must return `shouldShowBanner`, `shouldShowList`,
  `shouldPlaySound` and `shouldSetBadge` — all four, all non-optional booleans.
- From the package's own type docs: *"On Android, setting `shouldPlaySound: false` will result in the
  drop-down notification alert **not** showing, no matter what the priority is."* **A silent foreground
  banner is not achievable on Android.** This is precisely why the owner's chosen design does not use one.

**Decided design (owner, 2026-08-09), do not re-litigate.** The OS banner is **suppressed** in the
foreground and the app shows **its own Toast** instead — no sound, no system drop-down over the app you are
already using, and it sidesteps the `shouldPlaySound` trap entirely. Tapping a reminder from outside the
app opens **WriteFlow**.

**Steps**

1. **RED first — `__tests__/reminders/route.test.js` + new pure
   [`src/reminders/route.js`](../src/reminders/route.js).** All decisions live here; zero native imports,
   matching [`schedule.js`](../src/reminders/schedule.js)'s stated architecture. Two exports:
   - `isOurReminder(notification)` — true only when the notification's
     `request.content.data.kind` is `'daily-reminder'`. Cases: a matching notification · a foreign
     notification · `null` / `{}` / a missing `content` → false, never throws.
   - `reminderAction({ wroteToday, foreground })` → `'nudge' | 'write' | 'none'`. Foreground **and** not
     written → `'nudge'`; foreground **and** already written → `'none'` (the user is in the app and the day
     is done; saying anything would be nagging); background tap and not written → `'write'`; background tap
     and already written → `'none'` (land wherever the app opens; **do not** force the editor open on a day
     they already finished — IMP-018 already makes today re-editable from Home).
2. **Stamp the reminders so we can recognise them.** At
   [`RitualsApp.js:318`](../src/RitualsApp.js#L318) the `reminderCopy(settings.tone)` result is passed to
   `reminderIO.scheduleAt`. Add `data: { kind: 'daily-reminder' }` to the scheduled content, threaded
   through [`io.js`](../src/reminders/io.js)'s `scheduleAt(date, { title, body, data })`. Without this,
   step 4 would hijack any other notification the app ever sends.
3. **[`src/reminders/io.js`](../src/reminders/io.js) — three additions, and it stays "the ONLY file that
   imports expo-notifications."** Same lazy `load()` guard as everything else in the file, each degrading
   to a no-op when the native module is absent (Expo Go):
   - `setForegroundBehavior()` — calls `setNotificationHandler` with
     `{ shouldShowBanner: false, shouldShowList: false, shouldPlaySound: false, shouldSetBadge: false }`.
     Put the Android `shouldPlaySound` fact in a comment above it so nobody "fixes" it later.
   - `onNotificationReceived(cb)` → a subscription with `.remove()`; wraps
     `addNotificationReceivedListener`.
   - `onNotificationTapped(cb)` → wraps `addNotificationResponseReceivedListener`, **and** on registration
     awaits `getLastNotificationResponseAsync()` once, firing `cb` if it returns one. Both halves are
     required: the listener catches taps while the app runs, the last-response call catches the cold start
     where the tap *launched* the app and the listener registered too late to see it.
4. **Wire it in [`src/RitualsApp.js`](../src/RitualsApp.js)**, beside the existing reminder effects at
   lines 322–327. One `useEffect` with a `[]` dependency list calls `setForegroundBehavior()` once. A
   second subscribes both listeners and removes them on unmount. On a received notification:
   `isOurReminder` → `reminderAction({ wroteToday, foreground: true })` → if `'nudge'`, `showToast` with
   **`Today is still unwritten.`** On a tap: `isOurReminder` → `reminderAction({ wroteToday, foreground:
   false })` → if `'write'`, `setWriting(true)`.
   **Cold-start ordering needs no new plumbing** — [`App.js:103`](../App.js#L103) returns early while
   `hydrated === null`, so `RitualsApp` cannot mount before entries exist. Do not add a readiness flag.
5. **Fix the stale line in `PROGRESS.md`** — IMP-044's R8 walk checklist claims tap routing exists. It did
   not until this spec. Correct it in the same commit.
6. **Emulator walk, and it is the only proof that counts.** `npm test` cannot exercise any of this — see
   the technique notes in [`docs/walk-open.md`](walk-open.md). Required: reminder fires with the app
   **backgrounded** → banner appears → tap → **WriteFlow opens** · reminder fires with the app
   **foregrounded** and today unwritten → **no banner, no sound**, Toast appears · foregrounded after
   writing today → **nothing at all** · force-stop the app, let one fire, tap it → WriteFlow opens on the
   cold start.
7. `npm test` green (≥ 577, or ≥ whatever the specs before it left), `npx expo export --platform android` clean.

**Do NOT** add notification categories, action buttons or a badge count · change `nextOccurrences`, the
rolling-window design or `reminderCopy` · request permission anywhere new · make the Toast tappable (it is
a nudge, not a second CTA) · touch `content/reminders.js`.

**Commit:** `feat(reminders): answer the reminder — a foreground nudge instead of silence, and a tap that opens the write flow (IMP-054)`

---

### IMP-055 — manage your feelings

**Lane:** OTA · **Free/Plus:** free (stored content — the same line IMP-037 and IMP-050 draw) · **Origin:**
walled out of IMP-050 deliberately; owner asked for it on 2026-08-09.

**✅ Unblocked — IMP-050 is done (2026-08-10, see `docs/build-log.md`)** — this spec edits
`settings.customMoodEmoji`, which IMP-050 created, and reuses the emoji palette IMP-050 built.

**The problem.** IMP-050 makes custom moods worth having: a name *and* a face, offered in every future
WriteFlow. What it does not give you is any way to change one. `addCustomMood`
([`RitualsApp.js:432`](../src/RitualsApp.js#L432)) only ever appends (it now also writes the emoji IMP-050
added, but still never edits an existing entry). There is **no rename, no delete, and
no way to change an emoji you picked in a hurry** — so a mood typed as `Anxios` at 11pm is in your picker,
your Insights and your Annual Recap for the life of the install.

**Decided design (the owner chose the rename semantics, 2026-08-09), do not re-litigate.**

- **A rename rewrites the name across every entry.** History stays coherent and the typo is fixed
  everywhere it was ever recorded. This edits historical entries, and that is allowed **only** because a
  mood label is metadata the user themselves chose and is now correcting — **`did` and `wished` are never
  touched by this spec, under any circumstance.**
- **A rename must cover `trash` as well as `entries`.** Trashed entries carry their full `moods` array
  ([`mutate.js:29`](../src/entries/mutate.js#L29)), so skipping trash means restoring an entry later
  resurrects the old name as an orphan.
- **A delete removes the mood from the picker and nothing else.** Entries that used it **keep** it, and its
  `customMoodEmoji` entry is **deliberately left in place** so those days keep their face instead of
  falling back to the `✨` placeholder. Deleting a feeling you once had must not rewrite the days you had
  it. The map carrying a few dead keys is a non-cost.
- **Built-in moods are untouchable.** The 8 in `MOODS` cannot be renamed, re-emoji'd or deleted.

**Steps**

1. **RED first — `__tests__/entries/renameMood.test.js` + new pure
   [`src/entries/renameMood.js`](../src/entries/renameMood.js)**, following
   [`mutate.js`](../src/entries/mutate.js)'s `{ entries, trash }` bag idiom. Three exports:
   - `renameMood({ entries, trash, settings }, from, to)` → a new bag. Rewrites `from` to `to` in every
     `moods` array in **both** `entries` and `trash`, in `settings.customMoods` (keeping list position),
     and re-keys `settings.customMoodEmoji`. **Entries that did not use the mood keep their object
     identity** — assert this directly; it is what stops React re-rendering the whole archive.
   - `deleteMood({ entries, trash, settings }, name)` → removes `name` from `settings.customMoods` only.
     `entries`, `trash` and `customMoodEmoji` come back **by reference, unchanged**.
   - `moodNameError(name, { customMoods, existing })` → `null` or a user-facing string. Rules:
     empty or whitespace → `Give it a name.` · longer than 24 characters → `A bit shorter.` · a
     case-insensitive match against `MOODS` → `That one is already here.` · a case-insensitive match
     against another custom mood → `You already have that one.` · renaming a mood to itself (unchanged) →
     `null`.
   Required cases beyond the above: a rename where an entry already carries **both** the old and the new
   name → the result must not contain a duplicate · a rename with no matching entries anywhere → all three
   slices come back by reference · `null` and malformed rows, and a missing `moods` array, survive without
   throwing · nothing is ever mutated in place (freeze the inputs in the test) · **a `did` or `wished`
   string that happens to contain the mood word is left completely alone** — pin this, it is the one way
   this spec could damage a journal.
2. **New `src/screens/MoodManager.js`** — a full-screen `Modal` sheet in the idiom of
   [`TrashSheet.js`](../src/screens/TrashSheet.js), listing `settings.customMoods`. Each row carries the
   emoji, the name, and two actions: **Edit** (the same emoji palette and name field IMP-050 built,
   prefilled) and **Remove**. Removal asks first, with copy that states the actual behaviour:
   `Remove {name} from your list? Days you already marked with it keep it.` The empty state, when no custom
   moods exist, is `The feelings you name yourself will live here.`
   **Reuse IMP-050's palette rather than rebuilding it** — if IMP-050 left it inline in `WriteFlow`,
   extract it to `src/screens/MoodPalette.js` first and have both screens import it. Do not fork it.
3. **A You-tab route.** Add a row to [`YouScreen.js`](../src/screens/YouScreen.js) in the same card as the
   other journal-content rows: label `Your feelings`, value = the custom mood count, or `None yet` at zero.
   It opens the modal from [`RitualsApp.js`](../src/RitualsApp.js) beside the other overlays, with the same
   `ThemeContext.Provider` wrapper every sibling modal uses.
4. **Wire the writes in `RitualsApp`** — `onRenameMood` / `onDeleteMood` call the pure functions and set
   `entries`, `trash` and `settings` from the returned bag. **All three setters, every time** — a rename
   that updates settings but not trash is exactly the bug step 1 exists to prevent.
5. **Component test `__tests__/screens/MoodManager.test.js`**: renaming to a name that already exists shows
   the error and calls nothing · a valid rename calls `onRenameMood` with the old and new names · Remove
   asks before calling `onDeleteMood` · the empty state renders with no custom moods · built-in moods are
   never listed.
6. `npm test` green (≥ 577, or ≥ whatever the specs before it left), `npx expo export --platform android` clean.

**Do NOT** touch `did` or `wished` · allow editing the 8 built-in moods · delete a mood from historical
entries · remove its `customMoodEmoji` key on delete · merge on a name collision (a clash is an error, not
a merge) · add reordering or favourites · touch `ArchiveFilters` beyond what IMP-050 already changed.

**Commit:** `feat(entries): rename, re-emoji and remove the feelings you named yourself (IMP-055)`

---

### IMP-058 — prompt packs

**Lane:** OTA · **Free/Plus:** **free — decided, see below** · **Origin:** owner asked what prompt packs
were, 2026-08-09.

**Why it is nearly free to build, and where the trap is.**
[`selectPrompt(pool, deck, day)`](../src/content/deck.js#L28) already takes the pool as a **parameter** — a
shuffle-bag that deals the whole pool without replacement and reshuffles only when exhausted. A "pack" is
therefore just a named array. [`RitualsApp.js:170`](../src/RitualsApp.js#L170) hard-codes `PROMPTS` as that
argument; making it a setting is the whole feature.

**The trap:** [`valid(deck, len)`](../src/content/deck.js#L19) validates the deck by **length only**. Switch
between two packs of the *same* length and validation passes, so the old pack's shuffle order and position
carry into the new pool. Nothing crashes — the no-repeat guarantee just silently stops holding, and nobody
would ever trace the repeats back to the switch. **Fixing this is step 1, not an afterthought.**

**Free, and here is the argument — overturn it deliberately or not at all.** The perk list is fixed at six
by an owner decision that says explicitly *"keep it at six; a longer list converts worse"*, so a seventh
perk contradicts a decision already taken. And the free/paid line in the playbook is *free helps you write
today, Plus gives you your years back* — a prompt is the app speaking to you **at the moment of writing**,
which is the free half by definition. There is also a practical reason: `PLUS_ENABLED` is `false`, so a
Plus-gated pack would be unreachable in every build that currently exists, which is exactly the defect
IMP-048 was filed for.

**Steps**

1. **RED first — extend `__tests__/content/deck.test.js`, then change
   [`src/content/deck.js`](../src/content/deck.js).** `selectPrompt(pool, deck, day, packId = 'everyday')`
   stores `pack` in the deck state, and `valid()` additionally requires `deck.pack === packId`. Cases:
   a deck from another pack **of the same length** is rejected and reshuffled · a deck from the same pack is
   kept and advances as before · an old deck with **no `pack` field** is rejected and reinitialised (this
   is the migration, and it is free — one reshuffle, no data touched) · the same-day same-reference
   behaviour still holds · pool of length 0 still returns `{ state: null, item: '' }`.
2. **New [`src/content/packs.js`](../src/content/packs.js)** exporting `PROMPT_PACKS`, an array of
   `{ id, name, blurb, prompts }`, and `packById(id)` returning the everyday pack for an unknown id
   (a restored setting naming a pack this build does not have must never blank the write card).
   `everyday` reuses the existing `PROMPTS` from [`prompts.js`](../src/content/prompts.js) — **do not move
   or rewrite those 60 strings.** The other three packs are content, written below; use them verbatim.
   - `{ id: 'everyday', name: 'Everyday', blurb: 'Open questions for an ordinary day.' }`
   - `{ id: 'grief', name: 'Grief & loss', blurb: 'For carrying someone with you.' }`
   - `{ id: 'gratitude', name: 'Gratitude', blurb: 'For noticing what is already here.' }`
   - `{ id: 'change', name: 'Change & transitions', blurb: 'For the in-between times.' }`
3. **`settings.promptPack`** — add to `DEFAULT_SETTINGS` in [`theme.js`](../src/theme.js) with the value
   `'everyday'`. `sanitizeSettings` needs **no** new exception (a string default, shape comparison handles
   it); `packById`'s fallback covers a valid-shaped but unknown value.
4. **Wire it** — [`RitualsApp.js:170`](../src/RitualsApp.js#L170) becomes
   `selectPrompt(packById(settings.promptPack).prompts, promptDeck, dayNumber(), settings.promptPack)`.
   Nothing else in the deck-persistence effect at line 379 changes.
5. **The picker** — a row on the You tab in the same card as the other content rows: label
   `Writing prompts`, value = the active pack's `name`. It opens a small modal listing the four packs, each
   showing `name`, `blurb` and a sample prompt, with the active one ringed. Selecting one sets
   `settings.promptPack`. **State plainly on that screen: `Changing packs reshuffles — you will not lose
   anything.`** — because it does, and an unexplained reshuffle looks like a bug.
6. **Component test `__tests__/screens/PromptPacks.test.js`**: all four packs render · selecting a pack
   calls the setter with its id · the active pack is marked.
7. `npm test` green, `npx expo export --platform android` clean.

**The prompts — 20 each, use verbatim.** Tone matches `prompts.js`: second person, question form, gentle,
never prescriptive, never assuming the answer.

**`grief`:**
`What do you miss most about them today?` · `What would you tell them if they were here right now?` ·
`What small thing reminded you of them recently?` · `What are you carrying today that nobody can see?` ·
`What did they teach you that you still use?` · `What do you wish people understood about how you are doing?` ·
`What felt heavier today than it looked from outside?` · `What is something of theirs you are glad you kept?` ·
`Where do you feel closest to them?` · `What kindness helped you get through this week?` ·
`What are you avoiding, and is that alright for now?` · `What made you laugh today, and did it feel strange to?` ·
`What would they be proud of you for, right now?` · `What have you stopped explaining to people?` ·
`What does a good day look like at the moment?` · `What did you manage today, however small?` ·
`What are you not ready to let go of yet?` · `Who has stayed, and how?` ·
`What has this taught you that you would rather not have learned?` · `What do you want to remember exactly as it was?`

**`gratitude`:**
`What went right today that you almost did not notice?` · `Who made your day easier without being asked?` ·
`What do you have now that you once hoped for?` · `What ordinary thing would you miss if it vanished tomorrow?` ·
`What did your body let you do today?` · `What is working quietly in the background of your life?` ·
`Who would you thank today if there were no awkwardness in it?` · `What small comfort did you lean on?` ·
`What went better than you feared?` · `What did someone say to you that landed well?` ·
`What part of your home are you glad of?` · `What did you eat today that you enjoyed?` ·
`What skill of yours made something easier today?` · `What are you glad you said no to?` ·
`What is beautiful about where you live?` · `Who taught you something you still rely on?` ·
`What has been given to you that you did not earn?` · `What is easier now than it was a year ago?` ·
`What sound today made you feel at home?` · `What would past-you be delighted to know about today?`

**`change`:**
`What is ending, and how do you feel about it?` · `What is beginning, ready or not?` ·
`What did you leave behind that you do not miss?` · `What do you miss that you did not expect to?` ·
`Who are you becoming in this?` · `What still feels unfamiliar?` ·
`What has already started to feel normal?` · `What would you tell someone about to go through this?` ·
`What are you afraid this will cost you?` · `What has surprised you about the change?` ·
`What part of your old routine do you want to keep?` · `What do you need before you will feel settled?` ·
`What are you postponing until things calm down?` · `Who has been steady through this?` ·
`What version of yourself are you grieving?` · `What have you outgrown without noticing?` ·
`What is one thing that has not changed at all?` · `What would settled actually look like?` ·
`What have you learned that you could not have learned staying?` · `What do you want to remember about this in-between time?`

**Do NOT** gate any pack behind Plus · rewrite or reorder the existing 60 `PROMPTS` · give each pack its own
persisted deck (one deck, reshuffled on switch, is the design) · add pack-specific mood lists, themes or
colours · let a pack be empty.

**Commit:** `feat(content): three more prompt packs, and a deck that knows which pack it belongs to (IMP-058)`

---

### IMP-059 — the app has one accessibility label

**Lane:** OTA · **Free/Plus:** N/A (quality) · **Origin:** audit during the 2026-08-09 spec session.

**The problem, counted.** `grep -rn "accessibilityLabel\|accessibilityRole" src/` excluding `src/dev/`
returns **exactly one match** — the dark-mode toggle at
[`HomeScreen.js:64`](../src/screens/HomeScreen.js#L64). Every other control whose only child is an icon is
announced by TalkBack as an unlabelled button, or not at all.

The worst of them is **the primary action of the entire app**: the write FAB at
[`RitualsApp.js:687`](../src/RitualsApp.js#L687) is a `Pressable` containing only `<Pencil />`. The word
`Write` beneath it is a **sibling** `T`, not a child, so it does not label the button. A TalkBack user
cannot find how to write an entry.

**Scope — one crisp rule, so this cannot sprawl.** *Every interactive element whose accessible name is not
already supplied by visible text inside it gets a label; every purely decorative element that could steal
focus gets `accessibilityElementsHidden` / `importantForAccessibility="no-hide-descendants"`.* Nothing
else. This is not a general accessibility programme, a contrast audit, or a font-scaling pass (IMP-030
already did that one).

**Steps**

1. **`IconBtn` — both copies take a required `label`.** [`WriteFlow.js:178`](../src/screens/WriteFlow.js#L178)
   and [`ReadingSheet.js:62`](../src/screens/ReadingSheet.js#L62) are the same component duplicated.
   **Extract it once to `src/ui/IconBtn.js`** and have both import it — a shared control is exactly how the
   next one gets a label for free. It sets `accessibilityRole="button"` and `accessibilityLabel={label}`.
   Call sites: WriteFlow's back/close (`Close this entry` on step 0, `Back a step` after) and
   ReadingSheet's close (`Close`).
2. **The write FAB** — `accessibilityRole="button"`, `accessibilityLabel="Write today's entry"`. The
   sibling `Write` text is decorative once the button is labelled: give it
   `accessibilityElementsHidden` so TalkBack does not read it twice.
3. **The four tabs** ([`RitualsApp.js:681`](../src/RitualsApp.js#L681) onward). They *do* carry visible
   text, so they are readable — but selection is not announced. Add `accessibilityRole="tab"` and
   `accessibilityState={{ selected: active }}` inside the `Tab` component, once.
4. **Every modal's close control**, in each of the overlay screens mounted from `RitualsApp` lines 708–846
   — `Achievements`, `Shop`, `GetEmbers`, `Paywall`, `ManageSubscription`, `PlusPerks`, `AnnualRecap`,
   `TrashSheet`, `Celebration`, `RestoreNotice`, `RestoreOffer`, `ReminderSheet`, `NameEditModal`. Each
   icon-only dismiss gets `accessibilityRole="button"` and a label naming what closes (`Close the shop`,
   not a bare `Close`, where the sheet's identity is not otherwise announced).
5. **Decorative graphics that can steal focus** — the today-ring child at
   [`InsightsScreen.js:239`](../src/screens/InsightsScreen.js#L239) already has `pointerEvents="none"`, but
   that does not hide it from a screen reader. Sweep the `LinearGradient` / ring / sheen decorations and mark
   them hidden. **Do not** hide the mood emoji in a heat cell — it is content.
6. **If [IMP-052](#imp-052--tap-a-day-read-it) has already landed, the heatmap cells are done** — it
   specifies their role and label. Do not relabel them; check and move on.
7. **A test that stops the regression**, `__tests__/ui/IconBtn.test.js`: `IconBtn` renders
   `accessibilityRole="button"` and the given label · plus a `__tests__/screens/FabLabel.test.js` asserting
   the FAB exposes its label. Two small tests are enough — the point is that the shared component now
   carries the guarantee.
8. `npm test` green, `npx expo export --platform android` clean.
9. **Walk it with TalkBack on** (Settings → Accessibility → TalkBack on the emulator): swipe through Home
   and confirm the FAB announces itself and the tabs announce which is selected; open and dismiss WriteFlow
   using only TalkBack gestures. **That last one is the acceptance test** — if you cannot write and close an
   entry blind, this spec is not done.

**Do NOT** add `accessibilityHint` anywhere (hints are for non-obvious outcomes and mostly add noise) ·
change any visual layout, colour or contrast · touch font scaling (IMP-030 owns it) · add a settings toggle
for anything · rename visible copy to suit a label.

**Commit:** `feat(a11y): label every icon-only control, starting with the write button (IMP-059)`

---

### IMP-060 — a candle burns without telling you

**Lane:** OTA · **Free/Plus:** free (candles are bought with embers by anyone; Plus perk #2 only makes them
automatic) · **Origin:** audit during the 2026-08-09 spec session, verified in code.

**The problem.** [`applyAutoFreeze`](../src/home/streakFreeze.js#L14) returns `{ frozenDays, freezes, spent }`
— and [`RitualsApp.js:363`](../src/RitualsApp.js#L363) uses `result.spent` for exactly one thing: deciding
whether to call the setters.

```
if (result.spent > 0) { setFrozenDays(...); setFreezes(...); }
```

**Nothing tells the user.** A candle they bought for 120–450 embers is consumed, a missed day is silently
marked as covered, and the only visible trace is a number in the Shop being lower than they remember. It
runs on mount, so it happens before they have looked at anything.

This is the same class of complaint the owner raised about the OS restoring a backup — *"it was done
without permission"* — except here it is **inventory the user paid for**, spent by our own code. The
mechanic itself is right and must not change; it is the silence that is wrong.

**Decided design.** A dismissible card on Home, in the idiom of
[`OnThisDayCard`](../src/screens/OnThisDayCard.js) and [`TipCard`](../src/screens/TipCard.js) — **not** a
Toast, which the user may never see and which would compete with the restore notice on exactly the launch
where both can fire. The spend is recorded to settings so the notice survives until it is acknowledged.

**Steps**

1. **RED first — `__tests__/home/freezeNotice.test.js` + new pure
   [`src/home/freezeNotice.js`](../src/home/freezeNotice.js)**, two exports:
   - `addFreezeNotice(pending, coveredDays)` → the new pending array, **appended and deduped, order
     preserved**. Appending matters: the effect is mount-only, so a second spend on a later launch must not
     erase an earlier notice the user has not read yet. Cases: empty + 1 day · existing + new days ·
     a duplicate day is not added twice · empty input returns the same reference.
   - `freezeNoticeCopy(days, freezesLeft)` → `{ title, body }`. Title is always
     `A candle burned for you.` One day → ``You missed {date}. A candle spent itself to keep your streak
     whole.`` More → ``You missed {n} days. {n} candles spent themselves to keep your streak whole.`` Then
     the tail: `{freezesLeft} left.`, or `That was your last one.` when zero. Dates render as
     `{d} {Mon}` from the dayKey — **parse it with `dayKeyToUtcMs`, never `new Date(string)`**, which is
     locale-dependent. Cases: 1 day, 3 days, zero left, one left, empty array → `null`.
2. **`settings.pendingFreezeNotice: []`** in `DEFAULT_SETTINGS`. Array default, so `sanitizeSettings` needs
   no new exception.
3. **Record the spend** — the effect at [`RitualsApp.js:361`](../src/RitualsApp.js#L361) also does
   `setSettings((s) => ({ ...s, pendingFreezeNotice: addFreezeNotice(s.pendingFreezeNotice || [], covered) }))`.
   **`applyAutoFreeze` must return which days it covered**, not just how many — add `covered: covered` to
   its return object (`spent` stays, nothing that reads it changes) and extend
   `__tests__/home/streakFreeze.test.js` to pin the new field.
4. **New `src/screens/FreezeNoticeCard.js`**, rendered on Home when `pendingFreezeNotice` is non-empty.
   Dismiss clears it to `[]`. Place it where `OnThisDayCard` sits; if both would show, **the freeze notice
   goes first** — it is about something that was taken, and that outranks a memory.
5. **Component test `__tests__/screens/FreezeNoticeCard.test.js`**: renders the one-day copy · renders the
   multi-day copy · renders `That was your last one.` at zero remaining · dismiss calls the clear handler ·
   renders nothing for an empty array.
6. `npm test` green, `npx expo export --platform android` clean.

**Do NOT** change when or how candles are spent — `applyAutoFreeze`'s logic, ordering and idempotence are
IMP-039's and are correct · offer an undo (the day is already covered and the streak already depends on
it) · make the card a route into the Shop (it is a notice, not an upsell) · show anything when `spent` is
0 · touch `currentStreak` or `frozenDays` semantics.

**Commit:** `feat(gamify): say so when a candle spends itself for you (IMP-060)`
