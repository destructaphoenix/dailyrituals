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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **559 passed, 57 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane |
| --- | --- | --- |
| 1 | [IMP-049 — settings survive a corrupt restore](#imp-049--settings-survive-a-corrupt-restore) | OTA |

---

### IMP-049 — settings survive a corrupt restore

**Lane:** OTA · **Free/Plus:** N/A (robustness) · **Origin:** hit for real on the 2026-08-09 emulator walk.

**The problem, proven not theorised.** [`src/backup/backup.js`](../src/backup/backup.js) calls itself *"the
single validation boundary for untrusted backup files"*, but `readBackup` validates only the **envelope**
(`format`, `payload` is a string) and the **schema version**. Nothing checks the *shape* of what is inside.
`mergeWithDefaults` is a shallow spread (`{ ...defaults, ...loaded }`), so a key with the **wrong type**
does not get corrected — it **replaces** the default outright.

Demonstrated during the walk with a backup whose `settings.accent` was a string (`'#C9884A'`) where
`DEFAULT_SETTINGS.accent` is the array `['#f59e0b', '#d97706', '#fef3c7']` (`[accent, deep, soft]`,
[`theme.js:102`](../src/theme.js#L102)). `makeTheme` then indexes it *by character*
([`theme.js:167–181`](../src/theme.js#L167)) and produces `accent: '#'`, `accentDeep: 'C'`,
`accentSoft: '9'`, `accentBright: '#'` (`lighten`'s regex fails and it returns its input unchanged),
`heat3: '#'`, `iconAccent: 'C'`. RN's `processColor('#')` returns `null`, and every `LinearGradient` in the
app throws `Cannot set prop 'colors' … java.lang.NullPointerException: null cannot be cast to non-null type
kotlin.Double`. **Result: an app with unreadable colours, a red console error, and no clean failure —
recoverable only via Reset all data, because the poisoned settings persist to AsyncStorage and survive
every relaunch.**

Reachable in the wild by a truncated file, a bad cloud sync, a hand-edited export, or an older/newer
build's settings shape. This also violates the standing rule *never trust external data at a boundary*.

**Scope — settings only. Decided; do not widen.** `entries` already have defensive readers by design and
are tested for malformed input throughout (IMP-035/037/038/046 each tolerate `null` rows and missing
fields). Wrong-typed counters (`xp`, `embers`) are cosmetic, not fatal. `settings` is the one slice whose
wrong type is **silently fatal**, because it feeds `makeTheme`, which feeds native views. Fix that; leave
the rest.

**Steps**

1. **RED first** — new `__tests__/persistence/sanitizeSettings.test.js` against a module that does not
   exist yet. Cases, all required:
   - `accent` as a string → the default array.
   - `accent` as an array whose 2nd element is not a hex colour → the **whole** default array (a partial
     repair would produce a mismatched palette).
   - `accent` as three valid hex strings → kept untouched.
   - `accent` as an array of the wrong length → the default array.
   - `reminder` as `null`, and as a string → the default object.
   - `reminder` as an object whose `hour` is a string → `hour` defaulted, a valid sibling `enabled` kept.
   - `name` as a number → `''`.
   - `customMoods` as a string → `[]`.
   - `recapSeen: null` is **valid** (its default is `null`) — a null default must accept null, not loop
     back to itself. Pin this; it is the easy bug in this file.
   - An unknown key (`somethingFromANewerBuild: 1`) is **preserved**, not dropped — forward-compat.
   - A missing key stays missing (`mergeWithDefaults` supplies it afterwards; sanitize does not fill).
   - Never mutates its input; `undefined`/`null`/a non-object input → `{}`.
2. **GREEN** — new pure `src/persistence/sanitizeSettings.js` exporting
   `sanitizeSettings(loaded, defaults = DEFAULT_SETTINGS)`. Shape comparison is
   `Array.isArray` → `'array'`, `null` → `'null'`, else `typeof`. A key whose shape matches its default is
   kept; a key whose shape differs is replaced by the default; `reminder` recurses one level.
   `accent` gets its own check — an array of exactly 3 strings each matching `/^#?([\da-f]{2}){3}$/i`
   (the same shape `lighten`/`darken` accept) or the default array wholesale.
3. **Wire both hydration points** — there are exactly two, both in [`App.js`](../App.js):
   line **87** (cold-start load) and line **122** (the restore/replace path). Both become
   `setSettings(mergeWithDefaults(sanitizeSettings(s.settings), DEFAULT_SETTINGS))`. **Both are required**
   — the cold-start path is how a already-poisoned install stays poisoned, so fixing only the import path
   would leave existing bad state unrecoverable.
4. **Regression test proving the actual failure is closed** — in the same test file, feed the poisoned
   `{ accent: '#C9884A' }` through `sanitizeSettings` → `mergeWithDefaults` → `makeTheme` for **both**
   `'day'` and `'night'`, and assert every string colour matches
   `/^(#[\da-f]{3,8}|rgba?\(|transparent)/i`. Without sanitize this assertion fails on ≥6 colours — verify
   it does by temporarily removing the call, then restore it. A check that cannot fail proves nothing.
5. `npm test` green (≥ 559), `npx expo export --platform android` clean.

**Do NOT** add a user-facing "this backup was repaired" notice, change `readBackup`'s return shape, or
touch the `'unreadable'`/`'too-new'` rejection reasons. Silent correction to a known-good default is the
whole behaviour.

**Commit:** `fix(persistence): repair wrong-typed settings from a restore instead of rendering null colours (IMP-049)`
