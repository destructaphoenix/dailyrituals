// src/dev/buildState.js
// Pure: turn a set of knob values into a complete persisted state slice that the
// existing App.js restore path (onReplaceAllData) can load. Output keys are a
// subset of PERSISTED_KEYS so it round-trips through the real serializer.
import { buildEntries, shiftDayKey } from './generateEntries';
import { DAILY_QUESTS, SHOP_PALETTES, SHOP_SKIES } from '../data';
import { DEFAULT_SETTINGS } from '../theme';
import { dayKeyToUtcMs, DAY_MS } from '../insights/dateKeys';

const XP_PER_DAY = 50; // mirrors XP_GAIN in RitualsApp.js

const uniq = (arr) => [...new Set(arr)];

// Preset offset arrays for the `gaps` knob — lets the panel offer a picker
// instead of a freeform array control. A raw array still works (existing
// scenarios pass one directly), so this only kicks in for the preset strings.
const GAP_PRESETS = { none: [], one: [2], scattered: [2, 5, 9] };

export function buildState(knobs = {}, today) {
  const {
    streak = 0,
    entryCount = streak,
    gaps: gapsKnob = [],
    done = true,
    plus = false,
    embers = 0,
    xp,
    palette = 'goldenhour',
    sky = 'classic',
    ownAll = false,
    tone = 'gentle',
    freezes = 0,
    mode = 'day',
    name = DEFAULT_SETTINGS.name,
    endOffset = 0,
    lastBackupAt,
    subCanceled = false,
    plan,
    reminderEnabled = DEFAULT_SETTINGS.reminder.enabled,
    reminderHour = DEFAULT_SETTINGS.reminder.hour,
    reminderMinute = DEFAULT_SETTINGS.reminder.minute,
    storePurchase = DEFAULT_SETTINGS.storePurchase,
    storeRestore = DEFAULT_SETTINGS.storeRestore,
    headlineFont = DEFAULT_SETTINGS.headlineFont,
    roundness = DEFAULT_SETTINGS.roundness,
    textLength = 'short',
  } = knobs;

  const gaps = typeof gapsKnob === 'string' ? (GAP_PRESETS[gapsKnob] || []) : gapsKnob;

  const baseEndDayKey = done ? today : shiftDayKey(today, -1);
  const endDayKey = endOffset ? shiftDayKey(baseEndDayKey, -endOffset) : baseEndDayKey;
  const entries = entryCount > 0 ? buildEntries({ count: entryCount, endDayKey, gaps, textLength }) : [];

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

  // Mirrors RitualsApp.retint(): loading a palette must also retint settings.accent,
  // or the Shop shows the palette active while the whole theme stays amber.
  const paletteMeta = SHOP_PALETTES.find((p) => p.id === palette);

  return {
    onboarded: true,
    mode,
    entries,
    // No `streak` field: streak is derived from `entries` (IMP-024). The Streak
    // knob drives entryCount (a run of consecutive days ending today/yesterday),
    // so the app derives that exact streak from the generated entries.
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
    subCanceled,
    activePlan: plan !== undefined ? plan : (plus ? 'yearly' : null),
    lastActiveDay: today,
    settings: {
      ...DEFAULT_SETTINGS,
      tone,
      name,
      headlineFont,
      roundness,
      accent: paletteMeta ? paletteMeta.swatch : DEFAULT_SETTINGS.accent,
      storePurchase,
      storeRestore,
      reminder: { enabled: reminderEnabled, hour: reminderHour, minute: reminderMinute },
    },
    ...(lastBackupAt !== undefined
      ? { lastBackupAt: lastBackupAt === -1 ? null : new Date(dayKeyToUtcMs(today) - lastBackupAt * DAY_MS).toISOString() }
      : {}),
    promptDeck: [],
  };
}
