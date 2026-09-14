// screenFixtures.js — one prop-mapping function, so scripts/gen-screens.js and
// its guard test share a single source for how a dev-harness state slice
// becomes HomeScreen's props (IMP-135).
//
// WHY THIS IS ITS OWN FILE. HomeScreen takes ~25 props, wired by hand at
// RitualsApp.js:959. Re-typing that wiring here would be a second copy that
// drifts the first time a prop is added or renamed on the screen — exactly
// the class of failure IMP-134 found in the frozen card. Instead this is the
// ONE place that wiring is restated, and __tests__/scripts/genScreens.test.js
// parses HomeScreen's own signature and fails if this function stops
// supplying every prop it declares.
//
// homePropsFromState() takes a buildState()/buildScenario() output (see
// src/dev/scenarios.js) — a PERSISTED STATE SLICE, not screen props — and
// applies the same derivations RitualsApp.js makes between that state and
// `<HomeScreen ... />`. Callbacks all map to no-ops: nothing here is ever
// clicked.
const path = require('path');
const SRC = path.join(__dirname, '..', 'src');

const { COPY } = require(path.join(SRC, 'data.js'));
const { levelFromXp } = require(path.join(SRC, 'profile', 'level.js'));
const { currentStreak } = require(path.join(SRC, 'insights', 'dateKeys.js'));

const noop = () => {};

function homePropsFromState(state) {
  const entries = state.entries || [];
  const frozenDays = state.frozenDays || [];
  // buildEntries() emits newest-first, so entries[0] is the fixture's own
  // "today" — not the real device date. Anchoring the streak to it (rather
  // than to dayKeyOf()) is what keeps a regeneration from producing a diff
  // every day it happens to be run.
  const todayKey = entries.length ? entries[0].dayKey : null;
  const streak = todayKey
    ? currentStreak(entries.map((e) => e.dayKey), todayKey, { frozenDays })
    : 0;
  const { level, name: levelName, into: xpInto, toNext: xpToNext } = levelFromXp(state.xp);
  const settings = state.settings || {};
  const copy = COPY[settings.tone] || COPY.gentle;

  return {
    copy,
    mode: state.mode || 'day',
    streak,
    level,
    levelName,
    xpInto,
    xpToNext,
    entries,
    quests: state.quests || null,
    freezes: state.freezes ?? 0,
    onOpenAchievements: noop,
    done: !!state.done,
    onWrite: noop,
    onToggleMode: noop,
    embers: state.embers ?? 0,
    plus: !!state.plus,
    // Plus has been live in production since 2026-09-05 (PAYWALL_LIVE in
    // RitualsApp.js) — this fixture isn't testing whether the paywall shows,
    // so it takes the shipped answer rather than re-deriving billing config.
    plusEnabled: true,
    onOpenShop: noop,
    // storeShots is always `done`, so HomeScreen never reads this (it only
    // shows the prompt card when `!done`) — '' just takes the safe fallback.
    dailyPrompt: '',
    userName: (settings.name || '').trim(),
    pendingFreezeNotice: [],
    onDismissFreezeNotice: noop,
    onThisDayDismissed: '',
    onDismissOnThisDay: noop,
    onOpenOnThisDay: noop,
    onOpenPaywall: noop,
    recapSeen: null,
    onDismissAnnualRecap: noop,
    onOpenAnnualRecap: noop,
    frozenDays,
    activeSky: state.activeSky || 'classic',
    ownedSkies: state.ownedSkies || [],
  };
}

module.exports = { homePropsFromState };
