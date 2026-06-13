# Backup / Restore Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users keep their journal safe and portable with no account — a user-held JSON backup file (export off-device + restore-by-replace with an automatic safety copy), plus an honest in-app surface for Android Auto Backup.

**Architecture:** Reuse the existing `serialize`/`deserialize` engine in `src/persistence/state.js` (it already validates and migrates old payloads forward). Add a small **pure** core under `src/backup/` (envelope builder/parser, label formatter, import orchestration) that is fully unit-tested, plus one **thin native wrapper** (`io.js`) over `expo-file-system` / `expo-sharing` / `expo-document-picker` that holds no logic and is not unit-tested. Wire export/import handlers into `RitualsApp.js` (it owns all live state) and a "replace all data + remount" handler into `App.js` (it owns hydration). `YouScreen.js` stays presentational — it renders rows that call the injected handlers.

**Tech Stack:** Expo 51 (bare/dev-client), React Native 0.74, AsyncStorage, Jest (jest-expo). New native deps: `expo-file-system`, `expo-sharing`, `expo-document-picker`.

**Design source:** `docs/superpowers/specs/2026-06-14-backup-restore-design.md`

**Ship lane:** BUILD (new native deps) → `npm run bump:build`. Rides the same build as IMP-006 (Auto Backup, native `allowBackup` already in `app.config.js`). Do not run `eas` by hand — follow the playbook Release rules when the owner asks to ship.

---

## File structure

**New (pure, unit-tested):**
- `src/backup/backup.js` — `createBackup`, `readBackup`, `backupFilename`, `BACKUP_FORMAT`. The envelope builder + the **validation boundary**.
- `src/backup/lastBackupLabel.js` — `lastBackupLabel(iso, now)`. Human "Backed up N days ago" string.
- `src/backup/importFlow.js` — `runConfirmedImport(...)`. Guarantees recovery-copy-before-replace ordering, with native effects injected so it's testable.

**New (thin native wrapper, not unit-tested):**
- `src/backup/io.js` — `exportFile`, `pickFile`, `writeRecovery`. The only file that touches the three native modules.

**Modified:**
- `src/persistence/state.js` — add `lastBackupAt` to `PERSISTED_KEYS`.
- `src/RitualsApp.js` — add `lastBackupAt` state + autosave; `currentSlice()`; `doExport`/`doImport`; pass new props to `YouScreen`.
- `App.js` — add `handleReplaceAllData` + a remount `key` on `<RitualsApp>`; import `saveState`.
- `src/screens/YouScreen.js` — new "Your journal is safe" section (3 rows); relabel the PDF stub row to "Save as PDF".
- `jest.setup.js` — mock the three expo native modules defensively.

**New tests:**
- `__tests__/backup/backup.test.js`
- `__tests__/backup/lastBackupLabel.test.js`
- `__tests__/backup/importFlow.test.js`
- `__tests__/persistence/state.test.js` — add one case for `lastBackupAt` (append to existing file).

---

## Task 1: Persist `lastBackupAt`

**Files:**
- Modify: `src/persistence/state.js:7-12` (the `PERSISTED_KEYS` array)
- Test: `__tests__/persistence/state.test.js` (append a test)

- [ ] **Step 1: Write the failing test** (append to `__tests__/persistence/state.test.js`)

```javascript
describe('lastBackupAt persistence', () => {
  test('pickPersisted carries lastBackupAt', () => {
    expect(pickPersisted({ lastBackupAt: '2026-06-14T00:00:00.000Z', junk: 1 }))
      .toEqual({ lastBackupAt: '2026-06-14T00:00:00.000Z' });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/persistence/state.test.js -t "carries lastBackupAt"`
Expected: FAIL — `pickPersisted` drops `lastBackupAt` (not in `PERSISTED_KEYS`), so the result is `{}`.

- [ ] **Step 3: Add the key**

In `src/persistence/state.js`, add `'lastBackupAt'` to the `PERSISTED_KEYS` array:

```javascript
export const PERSISTED_KEYS = [
  'onboarded',
  'entries', 'streak', 'xp', 'done', 'quests', 'freezes', 'embers',
  'plus', 'activePalette', 'ownedPalettes', 'activeSky', 'ownedSkies',
  'subCanceled', 'activePlan', 'lastActiveDay', 'settings', 'lastBackupAt',
];
```

No migration is needed: existing users simply have no `lastBackupAt`, and the app reads it as `null` via `?? null` (Task 6). `SCHEMA_VERSION` stays `2`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/persistence/state.test.js`
Expected: PASS (all existing cases still green).

- [ ] **Step 5: Commit**

```bash
git add src/persistence/state.js __tests__/persistence/state.test.js
git commit -m "feat(backup): persist lastBackupAt timestamp"
```

---

## Task 2: Pure backup core (envelope build + parse)

**Files:**
- Create: `src/backup/backup.js`
- Test: `__tests__/backup/backup.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/backup/backup.test.js`:

```javascript
import { createBackup, readBackup, backupFilename, BACKUP_FORMAT } from '../../src/backup/backup';
import { SCHEMA_VERSION } from '../../src/persistence/state';

const state = {
  entries: [
    { id: 'a', dayKey: '2026-06-10', did: 'x' },
    { id: 'b', dayKey: '2026-06-10', did: 'y' }, // same day → counts as 1 day, 2 entries
    { id: 'c', dayKey: '2026-06-11', did: 'z' },
  ],
  streak: 3, xp: 150, settings: { name: 'Maya' }, junk: 'dropped',
};

describe('createBackup', () => {
  const env = createBackup(state, { appVersion: '1.0.0', now: new Date('2026-06-14T08:00:00.000Z') });

  test('tags format, version-stamped payload, and metadata', () => {
    expect(env.format).toBe(BACKUP_FORMAT);
    expect(env.appVersion).toBe('1.0.0');
    expect(env.exportedAt).toBe('2026-06-14T08:00:00.000Z');
    expect(JSON.parse(env.payload).version).toBe(SCHEMA_VERSION);
  });

  test('counts entries and unique days', () => {
    expect(env.counts).toEqual({ entries: 3, days: 2 });
  });

  test('payload only contains persisted keys (junk dropped)', () => {
    expect(JSON.parse(env.payload).junk).toBeUndefined();
  });
});

describe('readBackup', () => {
  const good = JSON.stringify(createBackup(state, { appVersion: '1.0.0' }));

  test('round-trips a good backup back to state', () => {
    const res = readBackup(good);
    expect(res.ok).toBe(true);
    expect(res.state.streak).toBe(3);
    expect(res.state.settings).toEqual({ name: 'Maya' });
    expect(res.meta.counts).toEqual({ entries: 3, days: 2 });
  });

  test('rejects non-JSON', () => {
    expect(readBackup('not json')).toEqual({ ok: false, reason: 'not-json' });
  });

  test('rejects a JSON file that is not our backup format', () => {
    expect(readBackup(JSON.stringify({ hello: 'world' }))).toEqual({ ok: false, reason: 'not-backup' });
  });

  test('rejects a backup made by a newer app (future schema)', () => {
    const future = JSON.stringify({
      format: BACKUP_FORMAT, appVersion: '9.9', exportedAt: 'x',
      counts: { entries: 0, days: 0 }, payload: JSON.stringify({ version: SCHEMA_VERSION + 99, streak: 1 }),
    });
    expect(readBackup(future)).toEqual({ ok: false, reason: 'too-new' });
  });

  test('rejects a corrupt payload', () => {
    const bad = JSON.stringify({
      format: BACKUP_FORMAT, appVersion: '1', exportedAt: 'x',
      counts: { entries: 0, days: 0 }, payload: 'not json either',
    });
    expect(readBackup(bad)).toEqual({ ok: false, reason: 'unreadable' });
  });
});

describe('backupFilename', () => {
  test('is dated YYYY-MM-DD', () => {
    expect(backupFilename(new Date('2026-06-14T08:00:00.000Z'))).toBe('daily-rituals-2026-06-14.json');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/backup/backup.test.js`
Expected: FAIL — `Cannot find module '../../src/backup/backup'`.

- [ ] **Step 3: Write the implementation**

Create `src/backup/backup.js`:

```javascript
// backup.js — pure backup envelope build + parse. No native calls. The envelope
// wraps the exact serialize() payload (so deserialize's validation + forward-
// migration carry over), plus metadata for the import preview. This file is the
// single validation boundary for untrusted backup files.

import { serialize, deserialize, pickPersisted, SCHEMA_VERSION } from '../persistence/state';

export const BACKUP_FORMAT = 'daily-rituals-backup';

function countDays(entries = []) {
  return new Set(entries.map((e) => e.dayKey)).size;
}

// Build a self-describing backup envelope from a state slice.
// meta = { appVersion, now }.
export function createBackup(state, { appVersion = 'unknown', now = new Date() } = {}) {
  const slice = pickPersisted(state);
  const entries = slice.entries || [];
  return {
    format: BACKUP_FORMAT,
    appVersion,
    exportedAt: now.toISOString(),
    counts: { entries: entries.length, days: countDays(entries) },
    payload: serialize(slice),
  };
}

// Parse + validate a backup file's text. Returns
//   { ok: true, meta: { appVersion, exportedAt, counts }, state }
//   { ok: false, reason: 'not-json' | 'not-backup' | 'too-new' | 'unreadable' }
export function readBackup(rawText) {
  let env;
  try { env = JSON.parse(rawText); }
  catch (e) { return { ok: false, reason: 'not-json' }; }

  if (!env || typeof env !== 'object' || env.format !== BACKUP_FORMAT || typeof env.payload !== 'string') {
    return { ok: false, reason: 'not-backup' };
  }

  // Peek at the payload's schema version to give a precise "too new" message.
  let payloadObj;
  try { payloadObj = JSON.parse(env.payload); }
  catch (e) { return { ok: false, reason: 'unreadable' }; }
  if (payloadObj && typeof payloadObj.version === 'number' && payloadObj.version > SCHEMA_VERSION) {
    return { ok: false, reason: 'too-new' };
  }

  const state = deserialize(env.payload); // validates + migrates forward; null if unusable
  if (!state) return { ok: false, reason: 'unreadable' };

  return {
    ok: true,
    meta: { appVersion: env.appVersion, exportedAt: env.exportedAt, counts: env.counts },
    state,
  };
}

export function backupFilename(now = new Date()) {
  return `daily-rituals-${now.toISOString().slice(0, 10)}.json`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/backup/backup.test.js`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add src/backup/backup.js __tests__/backup/backup.test.js
git commit -m "feat(backup): pure backup envelope build + validating parse"
```

---

## Task 3: "Backed up N days ago" label

**Files:**
- Create: `src/backup/lastBackupLabel.js`
- Test: `__tests__/backup/lastBackupLabel.test.js`

- [ ] **Step 1: Write the failing test**

Create `__tests__/backup/lastBackupLabel.test.js`:

```javascript
import { lastBackupLabel } from '../../src/backup/lastBackupLabel';

const now = new Date('2026-06-14T12:00:00.000Z');

describe('lastBackupLabel', () => {
  test('null → never backed up', () => {
    expect(lastBackupLabel(null, now)).toBe('Not backed up yet');
  });
  test('same day → today', () => {
    expect(lastBackupLabel('2026-06-14T01:00:00.000Z', now)).toBe('Backed up today');
  });
  test('one day → yesterday', () => {
    expect(lastBackupLabel('2026-06-13T01:00:00.000Z', now)).toBe('Backed up yesterday');
  });
  test('several days → N days ago', () => {
    expect(lastBackupLabel('2026-06-01T12:00:00.000Z', now)).toBe('Backed up 13 days ago');
  });
  test('over 30 days → gentle nudge appended', () => {
    expect(lastBackupLabel('2026-05-01T12:00:00.000Z', now)).toBe('Backed up 44 days ago — back up again soon');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/backup/lastBackupLabel.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/backup/lastBackupLabel.js`:

```javascript
// lastBackupLabel.js — pure formatter for the "Back up my journal" subtitle.
const DAY_MS = 86400000;

export function lastBackupLabel(iso, now = new Date()) {
  if (!iso) return 'Not backed up yet';
  const days = Math.floor((now.getTime() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return 'Backed up today';
  if (days === 1) return 'Backed up yesterday';
  const base = `Backed up ${days} days ago`;
  return days > 30 ? `${base} — back up again soon` : base; // gentle nudge when stale
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/backup/lastBackupLabel.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/backup/lastBackupLabel.js __tests__/backup/lastBackupLabel.test.js
git commit -m "feat(backup): lastBackupLabel subtitle formatter"
```

---

## Task 4: Import orchestration (recovery-before-replace guarantee)

**Files:**
- Create: `src/backup/importFlow.js`
- Test: `__tests__/backup/importFlow.test.js`

This isolates the one safety-critical ordering rule (write the recovery copy *before* the destructive replace) into a pure function with injected effects, so it can be unit-tested without rendering any UI.

- [ ] **Step 1: Write the failing test**

Create `__tests__/backup/importFlow.test.js`:

```javascript
import { runConfirmedImport } from '../../src/backup/importFlow';

describe('runConfirmedImport', () => {
  test('writes the recovery copy BEFORE replacing data', async () => {
    const calls = [];
    const writeRecovery = jest.fn(async () => { calls.push('recovery'); });
    const replaceAll = jest.fn(async () => { calls.push('replace'); });

    await runConfirmedImport({
      currentEnvelopeText: '{"recovery":true}',
      restoredState: { streak: 9 },
      writeRecovery,
      replaceAll,
    });

    expect(calls).toEqual(['recovery', 'replace']); // order matters
    expect(writeRecovery).toHaveBeenCalledWith('{"recovery":true}');
    expect(replaceAll).toHaveBeenCalledWith({ streak: 9 });
  });

  test('does NOT replace if the recovery write throws', async () => {
    const replaceAll = jest.fn();
    const writeRecovery = jest.fn(async () => { throw new Error('disk full'); });

    await expect(runConfirmedImport({
      currentEnvelopeText: 'x', restoredState: {}, writeRecovery, replaceAll,
    })).rejects.toThrow('disk full');

    expect(replaceAll).not.toHaveBeenCalled(); // data was never destroyed
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/backup/importFlow.test.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/backup/importFlow.js`:

```javascript
// importFlow.js — orchestrates a *confirmed* restore. Native effects are injected
// so the safety guarantee (recovery copy first, replace second; never replace if
// the recovery write fails) is unit-testable without UI.

export async function runConfirmedImport({ currentEnvelopeText, restoredState, writeRecovery, replaceAll }) {
  await writeRecovery(currentEnvelopeText); // 1. safety copy of current data FIRST
  await replaceAll(restoredState);          // 2. only then the destructive replace
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/backup/importFlow.test.js`
Expected: PASS (both cases).

- [ ] **Step 5: Commit**

```bash
git add src/backup/importFlow.js __tests__/backup/importFlow.test.js
git commit -m "feat(backup): import orchestration guarantees recovery before replace"
```

---

## Task 5: Native I/O wrapper + install deps + jest mocks

**Files:**
- Create: `src/backup/io.js`
- Modify: `package.json` (via `expo install`), `jest.setup.js:1-4`

No unit tests — `io.js` is a thin pass-through to native modules. Verification is "the suite stays green and the app bundles."

- [ ] **Step 1: Install the native dependencies**

Run: `npx expo install expo-file-system expo-sharing expo-document-picker`
Expected: three packages added to `package.json` `dependencies` at Expo-51-compatible versions.

- [ ] **Step 2: Write the native wrapper**

Create `src/backup/io.js`:

```javascript
// io.js — the ONLY file that touches native file/share/pick modules. Keeps the
// backup core pure and testable. No business logic lives here.

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const UTF8 = { encoding: FileSystem.EncodingType.UTF8 };

// Write text to a temp file and open the OS share sheet (the off-device step).
// Returns true if the share sheet was presented.
export async function exportFile(filename, text) {
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, text, UTF8);
  if (!(await Sharing.isAvailableAsync())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/json', dialogTitle: 'Save your journal backup' });
  return true;
}

// Let the user pick a backup file; return its text, or null if they cancelled.
export async function pickFile() {
  const res = await DocumentPicker.getDocumentAsync({ type: 'application/json', copyToCacheDirectory: true });
  if (res.canceled || !res.assets || !res.assets[0]) return null;
  return FileSystem.readAsStringAsync(res.assets[0].uri, UTF8);
}

// Silent on-device safety copy written before a destructive import. Returns the filename.
export async function writeRecovery(text, now = new Date()) {
  const name = `daily-rituals-recovery-${now.toISOString().replace(/[:.]/g, '-')}.json`;
  await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + name, text, UTF8);
  return name;
}
```

- [ ] **Step 3: Add defensive jest mocks**

Replace the contents of `jest.setup.js` with:

```javascript
// jest.setup.js — silence RN animation native warnings, and stub the expo native
// modules used by src/backup/io.js so any module that imports it doesn't break
// the jsdom test environment.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), { virtual: true });

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'file:///cache/',
  documentDirectory: 'file:///docs/',
  EncodingType: { UTF8: 'utf8' },
  writeAsStringAsync: jest.fn(async () => {}),
  readAsStringAsync: jest.fn(async () => '{}'),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => true),
  shareAsync: jest.fn(async () => {}),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(async () => ({ canceled: true })),
}));
```

- [ ] **Step 4: Verify the whole suite is still green**

Run: `npm test`
Expected: PASS — all suites, including the new backup tests. No suite should fail on importing the expo modules.

- [ ] **Step 5: Commit**

```bash
git add src/backup/io.js jest.setup.js package.json
# also stage the lockfile if the repo has one: git add package-lock.json 2>/dev/null
git commit -m "feat(backup): native file/share/picker wrapper + jest mocks + deps"
```

---

## Task 6: Wire export/import into RitualsApp + App.js (replace-all remount)

**Files:**
- Modify: `src/RitualsApp.js` (imports; `lastBackupAt` state; `currentSlice`; `doExport`; `doImport`; `YouScreen` props)
- Modify: `App.js` (`saveState` import; `handleReplaceAllData`; remount `key` on `<RitualsApp>`)

No new unit tests (UI/integration wiring — the safety-critical logic was already tested in Tasks 2 & 4). Verify by bundling + the manual smoke test in Task 8.

- [ ] **Step 1: Add imports to `RitualsApp.js`**

At the top of `src/RitualsApp.js`, add `Alert`, `Linking` to the react-native import, and the new modules:

```javascript
import { View, Pressable, Modal, StyleSheet, Platform, AppState, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import { createBackup, readBackup, backupFilename } from './backup/backup';
import { runConfirmedImport } from './backup/importFlow';
import * as backupIO from './backup/io';
```

(`Constants` — `expo-constants` is already a dependency.)

- [ ] **Step 2: Accept the new prop + add state + the error map**

Change the component signature (line ~45) to also accept `onReplaceAllData`:

```javascript
export default function RitualsApp({ mode = 'day', settings, setSettings, onToggleMode, initialPlus = false, initialState = {}, onResetData, onReplaceAllData }) {
```

Add near the other `useState` calls (after the `freezes` line ~64):

```javascript
  const [lastBackupAt, setLastBackupAt] = useState(initialState.lastBackupAt ?? null);
```

Add a module-level constant near the top of the file (after `const XP_GAIN = 50;`):

```javascript
const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
const IMPORT_ERROR = {
  'not-json': "That file isn't readable as a backup.",
  'not-backup': "This doesn't look like a Daily Rituals backup.",
  'too-new': 'This backup was made by a newer version — update the app first.',
  'unreadable': "That backup file looks damaged and can't be restored.",
};
```

- [ ] **Step 3: Add `lastBackupAt` to the autosave slice**

In the debounced autosave effect (the object passed to `pickPersisted`, ~line 207) add `lastBackupAt`, and add `lastBackupAt` to the effect's dependency array (~line 215):

```javascript
      saveState(pickPersisted({
        onboarded: true,
        entries, streak, xp, done, quests, freezes, embers, plus,
        activePalette, ownedPalettes, activeSky, ownedSkies,
        subCanceled, activePlan, lastActiveDay, settings, lastBackupAt,
      }));
```
```javascript
  }, [entries, streak, xp, done, quests, freezes, embers, plus,
    activePalette, ownedPalettes, activeSky, ownedSkies,
    subCanceled, activePlan, lastActiveDay, settings, lastBackupAt]);
```

- [ ] **Step 4: Add `currentSlice`, `doExport`, `doImport`, and the auto-backup explainer**

Add these just before `const screen = () => {` (~line 237):

```javascript
  // The exact persisted slice (mirrors the autosave object) — source for backups.
  const currentSlice = () => ({
    onboarded: true,
    entries, streak, xp, done, quests, freezes, embers, plus,
    activePalette, ownedPalettes, activeSky, ownedSkies,
    subCanceled, activePlan, lastActiveDay, settings, lastBackupAt,
  });

  const doExport = async () => {
    if (!entries.length) { showToast("Nothing to back up yet — write your first reflection."); return; }
    try {
      const env = createBackup(currentSlice(), { appVersion: APP_VERSION });
      const shared = await backupIO.exportFile(backupFilename(), JSON.stringify(env));
      if (shared) {
        setLastBackupAt(new Date().toISOString());
        showToast('Backup ready — save it somewhere off this phone.');
      }
    } catch (e) {
      showToast("Couldn't create the backup. Please try again.");
    }
  };

  const doImport = async () => {
    let raw;
    try { raw = await backupIO.pickFile(); }
    catch (e) { showToast("Couldn't open that file."); return; }
    if (raw == null) return; // user cancelled the picker

    const res = readBackup(raw);
    if (!res.ok) { showToast(IMPORT_ERROR[res.reason] || IMPORT_ERROR['not-backup']); return; }

    const here = entries.length;
    Alert.alert(
      'Restore this backup?',
      `This backup has ${res.meta.counts.entries} ${res.meta.counts.entries === 1 ? 'entry' : 'entries'}.\n` +
      `It will replace what's on this phone now (${here} ${here === 1 ? 'entry' : 'entries'}). ` +
      `We'll save a recovery copy of your current journal first.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Replace', style: 'destructive',
          onPress: async () => {
            try {
              await runConfirmedImport({
                currentEnvelopeText: JSON.stringify(createBackup(currentSlice(), { appVersion: APP_VERSION })),
                restoredState: res.state,
                writeRecovery: (text) => backupIO.writeRecovery(text),
                replaceAll: (state) => onReplaceAllData(state),
              });
            } catch (e) {
              showToast("Restore failed — your current journal is unchanged.");
            }
          },
        },
      ]
    );
  };

  // Honest Auto Backup explainer (we can't read the OS-level Google toggle).
  const explainAutoBackup = () => {
    Alert.alert(
      'Automatic backup',
      "Your journal is included in Android's automatic backup to your Google account, so it can be restored when you set up a new phone.\n\n" +
      "We can't see whether device backup is switched on, so it's worth checking: Settings › Google › Backup. For full control, also export your own copy.",
      [
        { text: 'Open phone settings', onPress: () => Linking.openSettings() },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };
```

- [ ] **Step 5: Pass the handlers to `YouScreen`**

In the `case 'you':` branch, add three props to `<YouScreen ... />`:

```javascript
            onResetData={onResetData}
            lastBackupAt={lastBackupAt}
            onExportData={doExport}
            onImportData={doImport}
            onExplainAutoBackup={explainAutoBackup}
```

- [ ] **Step 6: Add the replace-all handler + remount key in `App.js`**

In `App.js`, change the storage import (line 8) to include `saveState`:

```javascript
import { loadState, saveState, clearState } from './src/persistence/storage';
```

Add a remount counter alongside the other `useState`s (after line 36):

```javascript
  const [dataKey, setDataKey] = useState(0); // bump to remount RitualsApp with fresh state
```

Add the handler next to `handleResetData` (after line 77):

```javascript
  const handleReplaceAllData = async (restoredSlice) => {
    await saveState(restoredSlice);
    setHydrated(restoredSlice);
    if (restoredSlice.settings) setSettings(restoredSlice.settings);
    setDataKey((k) => k + 1); // forces RitualsApp to re-init useState from the restored slice
  };
```

Update the `<RitualsApp ... />` render (line ~94) to add the `key` and the new prop:

```javascript
      <RitualsApp
        key={dataKey}
        mode={mode}
        settings={settings}
        setSettings={setSettings}
        onToggleMode={() => setMode(dark ? 'day' : 'night')}
        initialPlus={startedPlus}
        initialState={hydrated}
        onResetData={handleResetData}
        onReplaceAllData={handleReplaceAllData}
      />
```

- [ ] **Step 7: Verify the suite still passes and the bundle builds**

Run: `npm test`
Expected: PASS (no behavior tested here changed; existing tests stay green).

Run: `npx expo export --platform android` *(or `npx expo start` and confirm it bundles with no red-screen error, then stop)*.
Expected: bundles with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/RitualsApp.js App.js
git commit -m "feat(backup): wire export/import handlers + replace-all remount"
```

---

## Task 7: "Your journal is safe" section + relabel the PDF stub

**Files:**
- Modify: `src/screens/YouScreen.js` (props; new section; relabel existing PDF row)

No unit tests (presentational). Verified in the Task 8 smoke test.

- [ ] **Step 1: Accept the new props**

Extend the `YouScreen` props destructure (line ~12-16) with:

```javascript
  onResetData,
  lastBackupAt, onExportData, onImportData, onExplainAutoBackup,
```

- [ ] **Step 2: Import the label helper + a cloud icon**

Add to the imports at the top of `YouScreen.js`:

```javascript
import { lastBackupLabel } from '../backup/lastBackupLabel';
```

Reuse existing icons: `Download` (export), `Restore` (import), `Info` (auto-backup). They're already imported on line 8 — confirm `Download`, `Restore`, `Info` are present (they are).

- [ ] **Step 3: Add the "Your journal is safe" section**

Insert this block in the returned JSX, **immediately before** the `{/* general */}` comment (~line 127):

```javascript
      {/* backup & restore — data safety (free, distinct from the Plus PDF below) */}
      <View style={{ paddingHorizontal: 20 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>Your journal is safe</T>
        <Card>
          <Row icon={<Info size={20} color={c.accentDeep} />} label="Automatic backup"
            value="How it works" onPress={onExplainAutoBackup} />
          <Divider />
          <Row icon={<Download size={20} color={c.accentDeep} />} label="Back up my journal"
            value={lastBackupLabel(lastBackupAt)} onPress={onExportData} />
          <Divider />
          <Row icon={<Restore size={20} color={c.accentDeep} />} label="Restore from a backup"
            onPress={onImportData} />
        </Card>
      </View>
```

- [ ] **Step 4: Relabel the existing PDF stub so it never collides with backup**

In the `{/* general */}` section, change the PDF row's `label` from `"Export reflections"` to `"Save as PDF"` (line ~131). The verb "Export" now appears nowhere on the screen, and the two features read as clearly different intents (data safety vs. a printable keepsake). Leave its Plus-gating and `onPress` behavior exactly as-is (still an unimplemented stub):

```javascript
          <Row icon={<Download size={20} color={c.accentDeep} />} label="Save as PDF"
```

- [ ] **Step 5: Verify bundle + suite**

Run: `npm test`
Expected: PASS.

Run: `npx expo start` → open the **You** tab → confirm the "Your journal is safe" section renders with three rows, and the General section now shows "Save as PDF" (no "Export reflections"). Stop the server.

- [ ] **Step 6: Commit**

```bash
git add src/screens/YouScreen.js
git commit -m "feat(backup): You-tab backup section + relabel PDF stub to Save as PDF"
```

---

## Task 8: End-to-end smoke test + ship prep

**Files:** none (verification + version bump)

- [ ] **Step 1: Full unit suite**

Run: `npm test`
Expected: PASS — all suites including the three new `__tests__/backup/*` files. Note the total count for the PROGRESS.md note.

- [ ] **Step 2: Manual device/emulator smoke test** (record pass/fail for each)

1. Write at least one reflection so there's data.
2. You tab → **Back up my journal** → the OS share sheet appears → save the file to Drive / Files. Subtitle updates to "Backed up today".
3. You tab → **Restore from a backup** → pick the file just saved → confirm dialog shows the right entry counts → **Replace** → app reloads showing the restored data; a recovery file was written (no crash).
4. **Restore from a backup** → pick a non-backup file (e.g. any other JSON / text) → a clear error toast appears, nothing is replaced.
5. **Automatic backup** row → explainer dialog → "Open phone settings" launches settings.
6. General section reads **Save as PDF** (Plus-gated as before), and there is no "Export reflections" row.

- [ ] **Step 3: Bump the build version (BUILD lane — new native deps)**

Run: `npm run bump:build`
Expected: native build number bumped (see `scripts/bump-version.js`).

- [ ] **Step 4: Commit the bump (no ship trailer unless the owner asked to release)**

```bash
git add -A   # stage whatever bump:build touched (app.config.js and/or version files)
git commit -m "chore(release): bump build for backup/restore native deps"
```

> **Shipping (only if the owner asked):** make the final commit's last line exactly `Release-Lane: build` and `git push origin main`. This rides the same build as IMP-006's Auto Backup. Never run `eas` by hand. No trailer = nothing ships (fine for WIP).

- [ ] **Step 5: Update PROGRESS.md**

- Tick IMP-020 in the backlog table → ✅.
- Move the full IMP-020 spec block out of PROGRESS.md into `docs/build-log.md` (it's code-complete).
- Write the dated "Last session note": what shipped, `npm test` count, last command/commit, and that IMP-006's device-verification of Auto Backup is still owner-pending.
- Confirm `wc -l PROGRESS.md` is ≤ ~120 lines.

```bash
git add PROGRESS.md docs/build-log.md
git commit -m "docs(progress): IMP-020 backup/restore code-complete; archive spec"
```

---

## Notes & deferrals (do NOT build now)

- **Scheduled auto-export** to a chosen folder → v2 (SAF + background limits).
- **File encryption / passphrase** → future. The backup file is plaintext journal content; the explainer copy already tells users to keep it private. Never log file contents.
- **Live OS-backup status detection** → needs a custom native module; out of scope. The explainer is honest about this limit by design.
- **Merge-on-import** → rejected in the spec; replace + recovery copy is the model.
