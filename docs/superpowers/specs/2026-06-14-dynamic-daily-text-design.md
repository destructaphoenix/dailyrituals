# Dynamic Daily Text — Design

**Date:** 2026-06-14
**Status:** Approved (design), pending implementation plan

## Goal

Make two pieces of Home text feel alive and different each day while keeping the
app **fully offline** (no network, no accounts). Both rotate from string pools
bundled in the app:

1. **Greeting headline** — a rotating, multilingual, time-neutral *hello*
   (e.g. "Hej.", "Konnichiwa.", "Howdy.", "Ni Hao.").
2. **Daily reflection prompt** — a single English gentle journaling question,
   shown in the "today's ritual" write card.

The English time-of-day greeting ("Good morning") is **kept** but demoted to the
subtitle line, next to the date.

Non-goals: rotating any other UI text, multiple languages for anything except the
greeting hellos, any server/network dependency.

## User-facing behavior

### Header (Layout A — approved)
- A slim **top utility row** holds the existing `EmberPill` + light/dark toggle,
  so the greeting headline gets the full content width (fixes the crowding where
  a long hello collided with the right-side cluster).
- Below it: the **multilingual hello** as the big headline (Quicksand display,
  `c.ink`), and a subtitle reading `"<time-of-day> · <date>"`, e.g.
  **"Good morning · Saturday, 14 June"** (`c.muted`).
- The greeting changes **once per calendar day** and stays stable all day.

### Write card (today's reflection)
- When today is **not done**, the "today's ritual" card body shows the day's
  **reflection prompt** in place of the current static `copy.teaser`, directly
  above the write button. Kicker label reads "Today's reflection".
- When today **is done**, the card flips to the existing "Today is at rest."
  state — the prompt is simply not shown, so it never feels stale.
- The prompt changes **once per calendar day**.

## Rotation mechanics

Two different mechanisms, chosen deliberately (see brainstorm rationale):

### Greeting — date-seeded, stateless, unpredictable
- A deterministic picker maps the **day key** (local-date integer) through a
  small seeded PRNG (mulberry32/xorshift) to an index in the hello pool.
- No persistence needed — the date *is* the seed. Hashing (not `dayKey % len`)
  makes consecutive days look unrelated rather than cycling in visible order.
- Repeats are acceptable here (greetings are pure flavor), so a stateless
  date-seed is the right trade-off (zero state, zero maintenance).

### Reflection prompt — persisted shuffle-bag (deck), no-repeat
- A **deck** guarantees every prompt is seen once before any repeat, which
  matters because a repeated *prompt* is noticeable (unlike a repeated hello).
- Deck state: `{ day: <dayKey last advanced>, order: number[], pos: number }`
  where `order` is a seeded permutation of the pool indices.
- `selectPrompt(pool, deckState, dayKey)` is a **pure** function returning
  `{ state, item }`:
  - No deck yet → initialize: `order = shuffle(range(len), seed=dayKey)`,
    `pos = 0`, `day = dayKey`.
  - Same `dayKey` as stored → no advance; return current item.
  - New `dayKey` → `pos += 1`; if `pos >= len` reshuffle (new `order` seeded
    from `dayKey`) and `pos = 0`; set `day = dayKey`.
  - **Validation:** if `order.length !== pool.length` or any index is out of
    range (e.g. pool grew in an app update, or corrupt state) → reinitialize the
    deck. This keeps no-repeat correct when the pool changes.
- **Day gaps:** the deck advances by exactly one per *distinct day the app is
  opened*. Skipped days don't burn prompts, so the no-repeat guarantee holds
  regardless of how irregularly the user shows up.

## Pool sizing (the "repetition" dial)

Repetition is purely a function of pool size; pools are extensible at any time
without code changes.
- **Greetings:** ~16 time-neutral hellos across languages. Repeats are fine.
- **Prompts:** ~60 gentle questions → roughly two months before the deck
  recycles. Tone: calm, open, non-prescriptive (fits the ritual app).

## Theme / dark mode / customization (explicit requirement)

- **No hardcoded colors.** All new UI reads `useTheme()` tokens (`c.ink`,
  `c.muted`, `c.accentDeep`, `c.surface`, `c.border`, etc.), exactly like the
  surrounding header/card code.
- Works automatically across **day**, classic **night**, and **nightV2** AMOLED
  palettes, and respects the user's **accent customization** (`settings.accent`),
  because it consumes the same resolved `colors` object.
- Reused components (`EmberPill`, toggle, `Card`, `PrimaryButton`) are already
  themed; the header restructure only moves them, it doesn't restyle them.
- Acceptance: visually verify header + write card in day and nightV2 modes and
  with a non-default accent.

## Architecture & files

**New modules** (small, single-purpose, pure where possible):
- `src/time/dailyPick.js` — `dayKey(date)`, a seeded PRNG, and
  `pickForDay(pool, date, salt?)` for the stateless greeting.
- `src/content/greetings.js` — the multilingual hello pool (constant).
- `src/content/prompts.js` — the reflection prompt pool (constant).
- `src/content/deck.js` — `shuffle(range, seed)` + `selectPrompt(...)`.

**Modified:**
- `src/screens/HomeScreen.js` — header restructured to Layout A (utility row +
  full-width greeting block); subtitle becomes `"<greetingFor()> · <todayLabel()>"`;
  write card body renders the daily prompt instead of `copy.teaser` when `!done`.
- `src/RitualsApp.js` — on load and on day rollover, run `selectPrompt`, persist
  the updated deck, and pass `dailyPrompt` (and updated deck) down to Home. The
  greeting stays stateless and is computed in `HomeScreen` from `new Date()`.
- `src/persistence/state.js` — add `'promptDeck'` to `PERSISTED_KEYS`. Default is
  absent → `selectPrompt` initializes on first run; `mergeWithDefaults` handles
  the missing key, so **no schema migration is required**.
- `src/time/clock.js` — unchanged (existing `greetingFor` / `todayLabel` reused).

## Edge cases & error handling
- Empty/size-1 pools → guarded; size-1 returns the single item every day.
- Corrupt or stale deck (bad indices, pool size changed) → revalidate and
  reinitialize (covered above).
- Day boundary uses **local date** (`getFullYear/getMonth/getDate`), consistent
  with existing `lastActiveDay`/streak logic.

## Testing (TDD, mirrors `__tests__/` layout)
- `dailyPick`: same day → same pick; deterministic; different days vary.
- `deck.shuffle`: deterministic for a given seed; is a true permutation.
- `deck.selectPrompt`: no repeat across a full pool cycle; reshuffles after
  exhaustion; advances exactly once per new day; gap days don't skip; reinit on
  pool-size change / corrupt state; pure (no mutation of inputs).
- `content/greetings` + `content/prompts`: non-empty, all strings, expected size.
- `persistence/state`: `promptDeck` round-trips; absent key → default/init.
- `HomeScreen`: renders hello headline + `"<time> · <date>"` subtitle; shows the
  prompt in the write card when `!done`; shows "Today is at rest." when `done`.
