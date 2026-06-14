# Dynamic Daily Text Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Home greeting (multilingual hello) and the write-card reflection prompt change each day, fully offline, while respecting all theme/dark-mode/accent customization.

**Architecture:** Two rotation mechanisms. The greeting is a stateless, date-seeded pick from a bundled pool (repeats are fine). The reflection prompt is a persisted no-repeat "deck" (shuffle-bag) that advances once per calendar day and guarantees every prompt is seen before any repeat. All new logic lives in small pure modules that are unit-tested; the screens consume them. No hardcoded colors — every new view reads `useTheme()` tokens.

**Tech Stack:** React Native (Expo), Jest + @testing-library/react-native. Existing test style is pure-logic / `renderHook` (no full screen renders) — this plan follows that.

---

## File Structure

**New:**
- `src/time/dailyPick.js` — `dayNumber(date)`, `mulberry32(seed)` PRNG, `pickForDay(pool, date, salt)` (stateless greeting picker).
- `src/content/greetings.js` — `HELLOS` constant (multilingual, time-neutral hellos).
- `src/content/prompts.js` — `PROMPTS` constant (English reflection prompts).
- `src/content/deck.js` — `shuffle(n, seed)` + `selectPrompt(pool, deck, day)` (persisted no-repeat picker).

**New tests:**
- `__tests__/time/dailyPick.test.js`
- `__tests__/content/greetings.test.js`
- `__tests__/content/prompts.test.js`
- `__tests__/content/deck.test.js`
- additions to `__tests__/persistence/state.test.js`

**Modified:**
- `src/persistence/state.js` — add `'promptDeck'` to `PERSISTED_KEYS`.
- `src/screens/HomeScreen.js` — header → Layout A (utility row + full-width greeting block, subtitle `"<time-of-day> · <date>"`); write card body shows `dailyPrompt`; kicker → "Today's reflection".
- `src/RitualsApp.js` — hold `promptDeck` state, compute today's prompt via `selectPrompt`, persist deck, pass `dailyPrompt` to `HomeScreen`.

---

## Task 0: Feature branch

We are on the default branch (`main`). Create a working branch before committing.

- [ ] **Step 1: Create and switch to the branch**

Run:
```bash
git checkout -b feat/dynamic-daily-text
```
Expected: `Switched to a new branch 'feat/dynamic-daily-text'`

---

## Task 1: `dailyPick.js` — day number, PRNG, stateless picker

**Files:**
- Create: `src/time/dailyPick.js`
- Test: `__tests__/time/dailyPick.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/time/dailyPick.test.js`:
```js
import { dayNumber, mulberry32, pickForDay } from '../../src/time/dailyPick';

describe('dayNumber', () => {
  it('is identical for the same calendar day regardless of time', () => {
    expect(dayNumber(new Date(2026, 5, 14, 0, 1))).toBe(dayNumber(new Date(2026, 5, 14, 23, 59)));
  });
  it('increments by one the next day', () => {
    expect(dayNumber(new Date(2026, 5, 15))).toBe(dayNumber(new Date(2026, 5, 14)) + 1);
  });
});

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(123); const b = mulberry32(123);
    expect(a()).toBe(b());
    expect(a()).toBe(b());
  });
  it('returns values in [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 50; i++) { const v = r(); expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
  });
});

describe('pickForDay', () => {
  const pool = ['a', 'b', 'c', 'd', 'e'];
  it('returns the same item all day for a given date', () => {
    expect(pickForDay(pool, new Date(2026, 5, 14, 8))).toBe(pickForDay(pool, new Date(2026, 5, 14, 20)));
  });
  it('always returns an item from the pool', () => {
    for (let d = 1; d <= 28; d++) {
      expect(pool).toContain(pickForDay(pool, new Date(2026, 5, d)));
    }
  });
  it('the salt changes which item is picked', () => {
    const date = new Date(2026, 5, 14);
    const picks = new Set([pickForDay(pool, date, 0), pickForDay(pool, date, 1), pickForDay(pool, date, 2), pickForDay(pool, date, 3)]);
    expect(picks.size).toBeGreaterThan(1);
  });
  it('returns empty string for an empty pool', () => {
    expect(pickForDay([], new Date())).toBe('');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/time/dailyPick.test.js`
Expected: FAIL — "Cannot find module '../../src/time/dailyPick'".

- [ ] **Step 3: Write minimal implementation**

Create `src/time/dailyPick.js`:
```js
// dailyPick.js — deterministic, offline daily selection.
// The local calendar day is the seed, so a pick is stable for the whole day
// and needs no stored state. Hashing the day (not day % len) makes consecutive
// days look unrelated rather than cycling in visible order.

// Integer index of the local calendar day. Uses Date.UTC of the local Y/M/D so
// it is stable across the day and unaffected by DST.
export function dayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

// mulberry32 PRNG — tiny, fast, deterministic for a given 32-bit seed.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Stateless daily pick from a pool. `salt` lets independent slots rotate
// differently from the same date without colliding.
export function pickForDay(pool, date = new Date(), salt = 0) {
  if (!pool || pool.length === 0) return '';
  const rnd = mulberry32(dayNumber(date) + salt);
  return pool[Math.floor(rnd() * pool.length)];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/time/dailyPick.test.js`
Expected: PASS (all assertions).

- [ ] **Step 5: Commit**

```bash
git add src/time/dailyPick.js __tests__/time/dailyPick.test.js
git commit -m "feat(home): add deterministic daily pick util (dayNumber, mulberry32, pickForDay)"
```

---

## Task 2: `greetings.js` — multilingual hello pool

**Files:**
- Create: `src/content/greetings.js`
- Test: `__tests__/content/greetings.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/content/greetings.test.js`:
```js
import { HELLOS } from '../../src/content/greetings';

describe('HELLOS', () => {
  it('has at least 12 greetings', () => {
    expect(HELLOS.length).toBeGreaterThanOrEqual(12);
  });
  it('are all non-empty strings', () => {
    HELLOS.forEach((h) => { expect(typeof h).toBe('string'); expect(h.length).toBeGreaterThan(0); });
  });
  it('contains no duplicates', () => {
    expect(new Set(HELLOS).size).toBe(HELLOS.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/content/greetings.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/content/greetings.js`:
```js
// greetings.js — time-neutral hellos across languages. Shown as the rotating
// Home headline; the English time-of-day greeting lives in the subtitle.
export const HELLOS = [
  'Hello', 'Hej', 'Konnichiwa', 'Ni Hao', 'Hey', 'Howdy',
  'Bonjour', 'Hola', 'Ciao', 'Namaste', 'Salaam', 'Olá',
  'Hallo', 'Annyeong', 'Privet', 'Aloha',
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/content/greetings.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/content/greetings.js __tests__/content/greetings.test.js
git commit -m "feat(home): add multilingual hello pool"
```

---

## Task 3: `prompts.js` — reflection prompt pool

**Files:**
- Create: `src/content/prompts.js`
- Test: `__tests__/content/prompts.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/content/prompts.test.js`:
```js
import { PROMPTS } from '../../src/content/prompts';

describe('PROMPTS', () => {
  it('has 60 prompts (~2 months before the deck recycles)', () => {
    expect(PROMPTS.length).toBe(60);
  });
  it('are all non-empty strings', () => {
    PROMPTS.forEach((p) => { expect(typeof p).toBe('string'); expect(p.trim().length).toBeGreaterThan(0); });
  });
  it('contains no duplicates', () => {
    expect(new Set(PROMPTS).size).toBe(PROMPTS.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/content/prompts.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/content/prompts.js`:
```js
// prompts.js — gentle, open, non-prescriptive reflection prompts. Shown in the
// "today's ritual" write card, one per day via a no-repeat deck (see deck.js).
export const PROMPTS = [
  "What's one small thing you're grateful for today?",
  'What moment from today would you like to remember?',
  "What's something that made you smile recently?",
  "What's weighing on your mind right now?",
  'What did you learn about yourself this week?',
  'What are you looking forward to?',
  "What's one kind thing you could do for yourself today?",
  'Who are you thankful for, and why?',
  "What's a small win you can celebrate?",
  'What would make today feel complete?',
  "What's something you'd like to let go of?",
  'When did you feel most at ease today?',
  "What's a challenge you're quietly proud of facing?",
  'What does rest look like for you right now?',
  "What's one thing you'd tell your past self?",
  "What's been giving you energy lately?",
  "What's been draining your energy lately?",
  'What did your body need today?',
  "What's a worry you can set down for now?",
  'What surprised you today?',
  "What are you curious about right now?",
  "What's something beautiful you noticed today?",
  'How did you show up for someone today?',
  'How did someone show up for you?',
  "What's a habit you'd like to nurture?",
  "What's one thing within your control today?",
  "What's a feeling you've been avoiding?",
  'What made today different from yesterday?',
  "What's a small comfort you're grateful for?",
  'What would you like more of in your days?',
  'What would you like less of in your days?',
  "What's a question you're sitting with?",
  'What did you do today that was just for you?',
  "What's something you're slowly getting better at?",
  "What's a boundary you're glad you kept?",
  'When did you feel most like yourself today?',
  "What's a memory that brought you peace lately?",
  "What's something you forgive yourself for?",
  "What are you holding onto that's no longer yours to carry?",
  "What's one hope you have for tomorrow?",
  'What sound, smell, or sight grounded you today?',
  "What's a strength you leaned on recently?",
  "What's something you'd like to say but haven't?",
  'How have you grown in the last year?',
  "What's a simple pleasure you enjoyed today?",
  "What's asking for your attention right now?",
  'What helped you get through a hard moment?',
  "What's a promise you'd like to make to yourself?",
  'What does "enough" feel like for you today?',
  "What's something you're proud of this week?",
  'Where did you find a little joy today?',
  "What's a thought you'd like to release before sleep?",
  "What's something you're learning to accept?",
  'Who or what made you feel supported lately?',
  "What's a small step you took toward something that matters?",
  "What's been on your heart today?",
  'What would you like to remember about this season of life?',
  "What's a fear that's softening over time?",
  'What gave today meaning, however small?',
  'What do you need to hear right now?',
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/content/prompts.test.js`
Expected: PASS (length is exactly 60, no duplicates).

- [ ] **Step 5: Commit**

```bash
git add src/content/prompts.js __tests__/content/prompts.test.js
git commit -m "feat(home): add reflection prompt pool (60 prompts)"
```

---

## Task 4: `deck.js` — no-repeat shuffle-bag

**Files:**
- Create: `src/content/deck.js`
- Test: `__tests__/content/deck.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/content/deck.test.js`:
```js
import { shuffle, selectPrompt } from '../../src/content/deck';

const POOL = ['p0', 'p1', 'p2', 'p3', 'p4'];

describe('shuffle', () => {
  it('returns a permutation of [0..n-1]', () => {
    const out = shuffle(5, 42);
    expect([...out].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  });
  it('is deterministic for a given seed', () => {
    expect(shuffle(8, 99)).toEqual(shuffle(8, 99));
  });
});

describe('selectPrompt', () => {
  it('initializes a deck when none exists', () => {
    const { state, item } = selectPrompt(POOL, null, 100);
    expect(state.day).toBe(100);
    expect(state.pos).toBe(0);
    expect(state.order.length).toBe(POOL.length);
    expect(POOL).toContain(item);
  });

  it('returns the SAME deck reference and item on the same day', () => {
    const first = selectPrompt(POOL, null, 100);
    const again = selectPrompt(POOL, first.state, 100);
    expect(again.state).toBe(first.state); // same reference — no churn
    expect(again.item).toBe(first.item);
  });

  it('advances to the next prompt on a new day', () => {
    const d1 = selectPrompt(POOL, null, 100);
    const d2 = selectPrompt(POOL, d1.state, 101);
    expect(d2.state.pos).toBe(1);
    expect(d2.item).not.toBe(d1.item);
  });

  it('shows every prompt once before any repeat (full cycle)', () => {
    let state = null; const seen = [];
    for (let day = 200; day < 200 + POOL.length; day++) {
      const r = selectPrompt(POOL, state, day); state = r.state; seen.push(r.item);
    }
    expect(new Set(seen).size).toBe(POOL.length); // all unique across one cycle
  });

  it('reshuffles after the deck is exhausted', () => {
    let state = null;
    for (let day = 300; day < 300 + POOL.length; day++) { state = selectPrompt(POOL, state, day).state; }
    const wrapped = selectPrompt(POOL, state, 300 + POOL.length);
    expect(wrapped.state.pos).toBe(0); // back to start of a fresh deck
    expect(POOL).toContain(wrapped.item);
  });

  it('does not skip prompts when days are missed (advance is per app-open day)', () => {
    const d1 = selectPrompt(POOL, null, 100);
    const d2 = selectPrompt(POOL, d1.state, 110); // 10-day gap
    expect(d2.state.pos).toBe(1); // advanced by exactly one
  });

  it('reinitializes when the deck is invalid or the pool size changed', () => {
    const stale = { day: 100, order: [0, 1, 2], pos: 0 }; // length 3, pool is 5
    const { state } = selectPrompt(POOL, stale, 101);
    expect(state.order.length).toBe(POOL.length);
  });

  it('does not mutate the input deck', () => {
    const d1 = selectPrompt(POOL, null, 100);
    const snapshot = JSON.stringify(d1.state);
    selectPrompt(POOL, d1.state, 101);
    expect(JSON.stringify(d1.state)).toBe(snapshot);
  });

  it('handles an empty pool without throwing', () => {
    expect(selectPrompt([], null, 100)).toEqual({ state: null, item: '' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/content/deck.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

Create `src/content/deck.js`:
```js
// deck.js — a no-repeat "shuffle-bag" for the daily reflection prompt. Unlike
// the stateless greeting, a repeated prompt is noticeable, so we deal the whole
// pool without replacement and only reshuffle once it is exhausted. State is
// persisted (see RitualsApp / persistence). selectPrompt is pure: it returns the
// SAME deck reference when nothing changed, so React effects don't churn.
import { mulberry32 } from '../time/dailyPick';

// Deterministic Fisher–Yates permutation of [0..n-1] for a given seed.
export function shuffle(n, seed) {
  const arr = Array.from({ length: n }, (_, i) => i);
  const rnd = mulberry32(seed >>> 0);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr;
}

function valid(deck, len) {
  return !!deck
    && Array.isArray(deck.order) && deck.order.length === len
    && deck.order.every((x) => Number.isInteger(x) && x >= 0 && x < len)
    && Number.isInteger(deck.pos) && deck.pos >= 0 && deck.pos < len
    && Number.isInteger(deck.day);
}

// Returns { state, item }. `day` is an integer calendar-day index (dayNumber).
export function selectPrompt(pool, deck, day) {
  const len = pool.length;
  if (len === 0) return { state: null, item: '' };

  // (Re)initialize on first use, corruption, or a pool-size change.
  if (!valid(deck, len)) {
    const order = shuffle(len, day);
    return { state: { day, order, pos: 0 }, item: pool[order[0]] };
  }

  // Same day → unchanged. Return the SAME reference so consumers can skip writes.
  if (deck.day === day) {
    return { state: deck, item: pool[deck.order[deck.pos]] };
  }

  // New day → advance by exactly one; reshuffle when the deck runs out.
  let pos = deck.pos + 1;
  let order = deck.order;
  if (pos >= len) { order = shuffle(len, day); pos = 0; }
  return { state: { day, order, pos }, item: pool[order[pos]] };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/content/deck.test.js`
Expected: PASS (all assertions, including same-reference and no-mutation).

- [ ] **Step 5: Commit**

```bash
git add src/content/deck.js __tests__/content/deck.test.js
git commit -m "feat(home): add no-repeat prompt deck (shuffle + selectPrompt)"
```

---

## Task 5: Persist the prompt deck

**Files:**
- Modify: `src/persistence/state.js` (add `'promptDeck'` to `PERSISTED_KEYS`)
- Test: `__tests__/persistence/state.test.js` (append)

- [ ] **Step 1: Write the failing test**

Append to `__tests__/persistence/state.test.js`:
```js
import { PERSISTED_KEYS, pickPersisted } from '../../src/persistence/state';

describe('promptDeck persistence', () => {
  it('promptDeck is a persisted key', () => {
    expect(PERSISTED_KEYS).toContain('promptDeck');
  });
  it('pickPersisted carries promptDeck through', () => {
    const deck = { day: 100, order: [2, 0, 1], pos: 1 };
    expect(pickPersisted({ promptDeck: deck }).promptDeck).toEqual(deck);
  });
  it('pickPersisted omits promptDeck when undefined', () => {
    expect('promptDeck' in pickPersisted({})).toBe(false);
  });
});
```

(If `state.test.js` already imports `PERSISTED_KEYS`/`pickPersisted`, reuse the existing import and only add the `describe` block.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/persistence/state.test.js`
Expected: FAIL — `PERSISTED_KEYS` does not contain `'promptDeck'`.

- [ ] **Step 3: Write minimal implementation**

In `src/persistence/state.js`, add `'promptDeck'` to the `PERSISTED_KEYS` array:
```js
export const PERSISTED_KEYS = [
  'onboarded',
  'entries', 'streak', 'xp', 'done', 'quests', 'freezes', 'embers',
  'plus', 'activePalette', 'ownedPalettes', 'activeSky', 'ownedSkies',
  'subCanceled', 'activePlan', 'lastActiveDay', 'settings', 'lastBackupAt',
  'promptDeck',
];
```
No schema migration is required: a missing `promptDeck` is filled by `mergeWithDefaults`, and `selectPrompt` initializes the deck on first use. `SCHEMA_VERSION` is unchanged.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/persistence/state.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/persistence/state.js __tests__/persistence/state.test.js
git commit -m "feat(home): persist promptDeck"
```

---

## Task 6: Home header → Layout A + multilingual greeting

**Files:**
- Modify: `src/screens/HomeScreen.js` (imports; `greeting` line; header JSX at lines ~21, ~34-50)

- [ ] **Step 1: Add imports and compute the daily hello**

In `src/screens/HomeScreen.js`, add to the import block (near the existing `import { greetingFor, todayLabel } from '../time/clock';`):
```js
import { pickForDay } from '../time/dailyPick';
import { HELLOS } from '../content/greetings';
```

Replace the line:
```js
  const greeting = greetingFor();
```
with:
```js
  const hello = pickForDay(HELLOS);
```

- [ ] **Step 2: Replace the header block with Layout A**

Replace the entire current header block:
```js
      {/* greeting */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <T d w={700} color={c.ink} style={{ fontSize: 27, lineHeight: 30 }}>{greeting}.</T>
          <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 2 }}>{todayLabel()}</T>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
          <EmberPill embers={embers} plus={plus} onPress={onOpenShop} />
          <Pressable
            onPress={onToggleMode}
            accessibilityLabel={mode === 'night' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <Orb size={24} color={c.accentDeep} />
          </Pressable>
        </View>
      </View>
```
with (Layout A — utility row on top, full-width greeting below):
```js
      {/* header: utility row + greeting (Layout A) */}
      <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 9 }}>
          <EmberPill embers={embers} plus={plus} onPress={onOpenShop} />
          <Pressable
            onPress={onToggleMode}
            accessibilityLabel={mode === 'night' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={({ pressed }) => [{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.92 : 1 }] }]}
          >
            <Orb size={24} color={c.accentDeep} />
          </Pressable>
        </View>
        <View style={{ marginTop: 10 }}>
          <T d w={700} color={c.ink} style={{ fontSize: 27, lineHeight: 32 }}>{hello}.</T>
          <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 2 }}>{greetingFor()} · {todayLabel()}</T>
        </View>
      </View>
```
Note: colors are all `useTheme()` tokens (`c.ink`, `c.muted`, `c.accentSoft`, `c.border`, `c.accentDeep`) — works in day / night / nightV2 and honors accent customization. `todayLabel` and `greetingFor` are already imported.

- [ ] **Step 3: Run the full suite to confirm nothing broke**

Run: `npx jest`
Expected: PASS (existing suite still green; no test references the removed `greeting` variable).

- [ ] **Step 4: Commit**

```bash
git add src/screens/HomeScreen.js
git commit -m "feat(home): header Layout A with rotating multilingual greeting"
```

---

## Task 7: Write-card daily prompt + RitualsApp deck wiring

**Files:**
- Modify: `src/RitualsApp.js` (imports; `promptDeck` state; compute + persist; pass `dailyPrompt`)
- Modify: `src/screens/HomeScreen.js` (accept `dailyPrompt` prop; render it in the write card; kicker label)

- [ ] **Step 1: Wire the deck into RitualsApp — imports**

In `src/RitualsApp.js`, add to the imports (near `import { entryDateParts } from './time/clock';`):
```js
import { dayNumber } from './time/dailyPick';
import { selectPrompt } from './content/deck';
import { PROMPTS } from './content/prompts';
```

- [ ] **Step 2: Add deck state and today's selection**

In `src/RitualsApp.js`, after the existing `lastActiveDay` state line (`const [lastActiveDay, setLastActiveDay] = useState(...)`), add:
```js
  const [promptDeck, setPromptDeck] = useState(initialState.promptDeck ?? null);
  const promptSel = useMemo(() => selectPrompt(PROMPTS, promptDeck, dayNumber()), [promptDeck]);
```
Then, after the existing daily-reset effect (the `useEffect` that resets `done`/quests at line ~207-214), add an effect that persists deck advances:
```js
  // Advance + persist the prompt deck when the day rolls over. selectPrompt
  // returns the same reference when nothing changed, so this is a no-op then.
  React.useEffect(() => {
    if (promptSel.state !== promptDeck) setPromptDeck(promptSel.state);
  }, [promptSel, promptDeck]);
```
(`useMemo` is already imported on line 8: `import React, { useState, useMemo } from 'react';`.)

- [ ] **Step 3: Persist promptDeck in the autosave + slice**

In the autosave object (inside the debounced `saveState(pickPersisted({ ... }))` call, ~line 219-224) add `promptDeck`:
```js
        subCanceled, activePlan, lastActiveDay, settings, lastBackupAt, promptDeck,
```
Add `promptDeck` to that effect's dependency array (~line 227-229):
```js
  }, [entries, streak, xp, done, quests, freezes, embers, plus,
    activePalette, ownedPalettes, activeSky, ownedSkies,
    subCanceled, activePlan, lastActiveDay, settings, lastBackupAt, promptDeck]);
```
And add it to `currentSlice()` (~line 250-255) so backups include it:
```js
    subCanceled, activePlan, lastActiveDay, settings, lastBackupAt, promptDeck,
```

- [ ] **Step 4: Pass dailyPrompt to HomeScreen**

In the `today` case of `screen()` (~line 347-353), add the `dailyPrompt` prop:
```js
          <HomeScreen
            copy={copy} gamify={gamify} mode={mode}
            streak={streak} level={level} levelName={levelName} xpInto={xpInto} xpToNext={xpToNext} entries={entries}
            quests={quests} freezes={freezes} onOpenAchievements={() => setShowAch(true)}
            embers={embers} plus={plus} onOpenShop={() => setShopOpen(true)}
            done={done} onWrite={() => setWriting(true)} onToggleMode={onToggleMode}
            dailyPrompt={promptSel.item}
          />
```

- [ ] **Step 5: Accept and render dailyPrompt in HomeScreen**

In `src/screens/HomeScreen.js`, add `dailyPrompt` to the destructured props (end of the props list, with a safe default):
```js
export default function HomeScreen({ copy, gamify, mode, streak, level, levelName, xpInto, xpToNext, entries, quests, freezes, onOpenAchievements, done, onWrite, onToggleMode, embers, plus, onOpenShop, dailyPrompt = '' }) {
```

Replace the write-card kicker + teaser body:
```js
            <T w={700} color={c.muted} style={{ fontSize: 12, letterSpacing: 1.7, textTransform: 'uppercase', marginBottom: 12 }}>
              {copy.teaserKicker}
            </T>
            <T d w={600} color={c.ink} style={{ fontSize: 19, lineHeight: 25 }}>
              {copy.teaser[0]}<T d w={700} color={c.accentDeep} style={{ fontSize: 19 }}>{copy.teaser[1]}</T>{copy.teaser[2]}
            </T>
```
with:
```js
            <T w={700} color={c.muted} style={{ fontSize: 12, letterSpacing: 1.7, textTransform: 'uppercase', marginBottom: 12 }}>
              Today's reflection
            </T>
            <T d w={600} color={c.ink} style={{ fontSize: 19, lineHeight: 25 }}>
              {dailyPrompt || copy.teaser.join('')}
            </T>
```
The `dailyPrompt || copy.teaser.join('')` fallback keeps the card sensible if the prop is ever missing. Colors remain theme tokens.

- [ ] **Step 6: Run the full suite**

Run: `npx jest`
Expected: PASS — all existing + new tests green.

- [ ] **Step 7: Commit**

```bash
git add src/RitualsApp.js src/screens/HomeScreen.js
git commit -m "feat(home): daily reflection prompt in write card via persisted deck"
```

---

## Task 8: Manual verification (theme acceptance) + finish

- [ ] **Step 1: Full test run**

Run: `npx jest`
Expected: entire suite PASS.

- [ ] **Step 2: Manual visual check (acceptance criteria from spec)**

Launch the app (`npm start` / Expo) and confirm:
- Header shows a multilingual hello headline with full width (no crowding against the ember/toggle row), and a subtitle reading `"<time-of-day> · <date>"` (e.g. "Good morning · Saturday, 14 June").
- The write card (before writing today) shows the kicker "Today's reflection" and a reflection prompt above the write button; after writing, it becomes "Today is at rest." with no prompt.
- Toggle to **night (nightV2)** mode: all new text/elements remain legible and correctly themed (no hardcoded colors).
- Change the **accent** (You → Shop palette, or settings): the greeting/subtitle/card respect the new accent via theme tokens.
- Reopen the app on the same day: greeting and prompt are unchanged (stable within a day).

- [ ] **Step 3: Finish the branch**

Use the `superpowers:finishing-a-development-branch` skill to choose how to integrate `feat/dynamic-daily-text` (merge to `main`, open a PR, etc.).

---

## Self-Review notes

- **Spec coverage:** greeting (Task 1+2+6), prompt deck (Task 3+4+7), persistence/no-migration (Task 5), header Layout A + subtitle (Task 6), prompt in write card + auto-hide when done (Task 7, reuses existing `!done` branch), theme/dark-mode/accent via tokens (Tasks 6-8 + manual check), pool sizing 16/60 (Tasks 2-3), edge cases empty/size-1/corrupt/gap (Task 4 tests).
- **Type consistency:** `dayNumber`, `mulberry32`, `pickForDay`, `shuffle`, `selectPrompt`, `HELLOS`, `PROMPTS`, `promptDeck`, `dailyPrompt`, `promptSel` are used consistently across tasks. `selectPrompt` returns `{ state, item }` everywhere; deck shape `{ day, order, pos }` everywhere.
- **No placeholders:** all steps contain full code/commands.
