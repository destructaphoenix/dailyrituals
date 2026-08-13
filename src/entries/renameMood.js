// entries/renameMood.js — rename, delete and validate the feelings a user
// named themselves (IMP-055). Pure, following mutate.js's `{ entries, trash }`
// bag idiom: never mutate in place, and hand back the exact input reference
// wherever nothing actually changed (that's what stops React re-rendering the
// whole archive on an edit that touched neither entries nor trash).

import { MOODS } from '../data';

const renameInList = (list, from, to) => {
  let changed = false;
  const next = list.map((item) => {
    if (!item || !Array.isArray(item.moods) || !item.moods.includes(from)) return item;
    changed = true;
    const renamed = item.moods.map((m) => (m === from ? to : m));
    const deduped = [];
    for (const m of renamed) if (!deduped.includes(m)) deduped.push(m);
    return { ...item, moods: deduped };
  });
  return changed ? next : list;
};

// Rewrites `from` to `to` everywhere it lives: every `moods` array in both
// `entries` and `trash`, `settings.customMoods` (position kept), and the
// `customMoodEmoji` key. `did`/`wished` are never read or touched — a mood
// label is metadata the user is correcting, journal text is not this spec's
// to change.
export function renameMood({ entries, trash, settings }, from, to) {
  const nextEntries = renameInList(entries, from, to);
  const nextTrash = renameInList(trash, from, to);

  const customMoods = settings.customMoods || [];
  const idx = customMoods.indexOf(from);
  const nextCustomMoods = idx === -1 ? customMoods : customMoods.map((m, i) => (i === idx ? to : m));

  const customMoodEmoji = settings.customMoodEmoji || {};
  let nextCustomMoodEmoji = customMoodEmoji;
  if (Object.prototype.hasOwnProperty.call(customMoodEmoji, from)) {
    const { [from]: emoji, ...rest } = customMoodEmoji;
    nextCustomMoodEmoji = { ...rest, [to]: emoji };
  }

  const settingsChanged = nextCustomMoods !== customMoods || nextCustomMoodEmoji !== customMoodEmoji;
  const nextSettings = settingsChanged
    ? { ...settings, customMoods: nextCustomMoods, customMoodEmoji: nextCustomMoodEmoji }
    : settings;

  return { entries: nextEntries, trash: nextTrash, settings: nextSettings };
}

// Removes `name` from the picker only. Entries/trash that used it keep it,
// unchanged — deleting a feeling you once had must not rewrite the days you
// had it. `customMoodEmoji` is deliberately left in place too, so those days
// keep their face instead of falling back to the placeholder glyph.
export function deleteMood({ entries, trash, settings }, name) {
  const customMoods = settings.customMoods || [];
  if (!customMoods.includes(name)) return { entries, trash, settings };
  const nextCustomMoods = customMoods.filter((m) => m !== name);
  return { entries, trash, settings: { ...settings, customMoods: nextCustomMoods } };
}

// null, or a user-facing string explaining why `name` can't be used.
// `existing` is the mood being renamed (undefined when there isn't one),
// excluded from the "already have that one" collision check against itself.
export function moodNameError(name, { customMoods = [], existing } = {}) {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (!trimmed) return 'Give it a name.';
  if (trimmed.length > 24) return 'A bit shorter.';
  if (trimmed === existing) return null;
  const lower = trimmed.toLowerCase();
  if (MOODS.some((m) => m.toLowerCase() === lower)) return 'That one is already here.';
  if (customMoods.some((m) => m !== existing && m.toLowerCase() === lower)) return 'You already have that one.';
  return null;
}
