// src/dev/buildState.js
// Pure: turn a set of knob values into a complete persisted state slice that the
// existing App.js restore path (onReplaceAllData) can load. Output keys are a
// subset of PERSISTED_KEYS so it round-trips through the real serializer.
import { buildEntries, shiftDayKey } from './generateEntries';
import { DAILY_QUESTS, SHOP_PALETTES, SHOP_SKIES } from '../data';
import { DEFAULT_SETTINGS } from '../theme';

const XP_PER_DAY = 50; // mirrors XP_GAIN in RitualsApp.js

const uniq = (arr) => [...new Set(arr)];

export function buildState(knobs = {}, today) {
  const {
    streak = 0,
    entryCount = streak,
    gaps = [],
    done = true,
    plus = false,
    embers = 0,
    xp,
    palette = 'goldenhour',
    sky = 'classic',
    ownAll = false,
    tone = 'gentle',
    gamify = true,
    freezes = 0,
  } = knobs;

  const endDayKey = done ? today : shiftDayKey(today, -1);
  const entries = entryCount > 0 ? buildEntries({ count: entryCount, endDayKey, gaps }) : [];

  const resolvedXp = xp != null ? xp : streak * XP_PER_DAY;

  const ownedPalettes = ownAll
    ? SHOP_PALETTES.map((p) => p.id)
    : uniq(['goldenhour', palette]);
  const ownedSkies = ownAll
    ? SHOP_SKIES.map((s) => s.id)
    : uniq(['classic', 'crescent', sky]);

  const quests = DAILY_QUESTS.map((q) =>
    done && (q.id === 'write' || q.id === 'feel') ? { ...q, cur: q.goal } : q
  );

  return {
    onboarded: true,
    entries,
    streak,
    xp: resolvedXp,
    done,
    quests,
    freezes,
    embers,
    plus,
    activePalette: palette,
    ownedPalettes,
    activeSky: sky,
    ownedSkies,
    activePlan: plus ? 'yearly' : null,
    lastActiveDay: today,
    settings: { ...DEFAULT_SETTINGS, tone, gamify },
    promptDeck: [],
  };
}
