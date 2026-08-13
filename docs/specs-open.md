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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **737 passed, 74 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane |
| --- | --- | --- |
| 1 | [IMP-059 — the app has one accessibility label](#imp-059--the-app-has-one-accessibility-label) | OTA |
| 2 | [IMP-058 — prompt packs](#imp-058--prompt-packs) | OTA |

> **IMP-056 is done (2026-08-10), IMP-050 is done (2026-08-10), IMP-051 is done (2026-08-10), IMP-052 is
> done (2026-08-13), IMP-053 is done (2026-08-13), IMP-054 is done (2026-08-13), IMP-055 is done
> (2026-08-13) and IMP-060 is done (2026-08-13) — see `docs/build-log.md`.**
> **IMP-057 is still deliberately absent.** It is reserved
> for the historical `dayKey` migration IMP-056 deferred, and it cannot be written until a real device's
> numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added. **Do not reuse the
> number.**
>
> **No ordering constraints on the remaining two specs.** Take them in any order.
>
> **Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
> runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
> the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md) and stops. IMP-059 →
> WALK-14. **Do not run a walk from a build chat**, and do not read a missing walk as an unfinished spec.

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
8. `npm test` green, `npx expo export --platform android` clean. **Stop here — this spec is code-complete
   at green tests.** Its acceptance test is a TalkBack walk, and that is
   **[WALK-14](walk-open.md#walk-14--talkback-can-write-an-entry)**, a separate task for a separate chat.
   Do not attempt it here.

**Do NOT** add `accessibilityHint` anywhere (hints are for non-obvious outcomes and mostly add noise) ·
change any visual layout, colour or contrast · touch font scaling (IMP-030 owns it) · add a settings toggle
for anything · rename visible copy to suit a label.

**Commit:** `feat(a11y): label every icon-only control, starting with the write button (IMP-059)`
