# Design — Backup / Restore ("Your journal is safe")

**Date:** 2026-06-14
**Status:** Approved (owner) — ready for implementation plan
**Track:** Improvements backlog (next IMP-xxx). First of the four-piece "legacy" roadmap.

---

## 0. Context: why this is first

The product thesis driving the next phase of work is a shift in emotional center: from
**"don't break your streak"** (Duolingo) to **"you are building an irreplaceable record of
your life"** (legacy). Four pieces serve that thesis:

- **A** — Days-of-life-captured hero (reframe Home: big number = days recorded, streak demoted)
- **B** — Lifetime Progress dashboard (totals, levels, consistency heatmap, milestone timeline)
- **C** — Annual Recap / Time Capsule ("This is who you were in June 2026")
- **D** — **Backup / Restore** ← this spec

Agreed build order: **D → A+B → C.** Rationale: you can't credibly tell users *"this is a
record of your life worth protecting"* while a dead phone is game over. D de-risks the data
before A/B/C surface and celebrate it. Build the vault before hanging the paintings.

A and B are the same feature at two zoom levels ("days captured" is B's headline stat, already
computed as `daysKept` in `src/insights/derive.js`); they will be specced together later. C is
the showcase, built last on top of B's derivations.

---

## 1. Goal & scope

**One user story:** *"My memories are safe and portable, with no account."*

Backup is **not** an auth problem. Auth proves identity to a server; backup gets a copy of the
data off the device into a place the user controls. An offline app already has what it needs:
the device file system + the OS share sheet. This keeps the app fully consistent with the
locked **local-only decision** (no accounts, no login, no PII off-device).

Two layers, covering two distinct failure modes:

| Layer | Mechanism | Failure mode it covers | User effort |
| --- | --- | --- | --- |
| **Manual export/import** | User-held JSON file via OS share sheet + document picker, **off-device by default** | "I want my own portable copy" + carries to a future iOS app + survives losing the Google account | one tap |
| **Automatic net** | Android Auto Backup (finish IMP-006) + **surface its status honestly in the UI** | "Phone died, I never thought to export" | none |

They are the same user story ("my memories are safe"); shipping only one would be a half-answer.

**Out of scope (YAGNI):**
- Cloud sync and accounts (rejected by the local-only decision — do not re-propose).
- Scheduled / automatic export to a chosen folder (strong **v2**; SAF + background limits make it
  too heavy for the first build).
- Merge-on-import (replace is the right model for the primary "restore to a fresh phone" case).
- File encryption / passphrase (acknowledged limitation in §6; possible future, not built now).
- PDF "Export reflections" already exists (Plus-gated, prose → PDF) and is a **separate** feature
  that stays as-is.

---

## 2. Architecture — small, isolated, testable units

**Key reuse:** `serialize` / `deserialize` in `src/persistence/state.js` already *are* the backup
engine. `deserialize` parses, **validates**, and **migrates old versions forward** via the
`migrators` chain. Consequence: a backup made today (schema v2) still restores correctly after
future schema bumps (v3, v4, …) because import runs through the same migrators. That durability
guarantee is free and must be preserved.

Two new small modules, both built around that engine, plus light wiring:

### `src/backup/backup.js` — pure logic, **no native calls** (fully unit-testable)

- `createBackup(state)` → an **envelope** object:
  ```
  {
    format: 'daily-rituals-backup',
    appVersion: <from expo-constants / app version>,
    exportedAt: <ISO timestamp>,
    counts: { entries: <n>, days: <unique dayKeys> },
    payload: <string from serialize(pickPersisted(state))>
  }
  ```
  The envelope lets the import preview show "247 entries, last June 1" *without* trusting the
  file blindly, and keeps export metadata out of restored app state (the payload is the only
  thing fed to `deserialize`).
- `readBackup(rawText)` → **the validation boundary.** Parses JSON, checks `format ===
  'daily-rituals-backup'`, then runs `payload` through the existing `deserialize`. Returns
  `{ ok: true, meta, state }` or `{ ok: false, reason }`. Every rejection path lives here so the
  UI just maps `reason` → message.
- `backupFilename(date)` → `daily-rituals-YYYY-MM-DD.json`.

### `src/backup/io.js` — thin wrapper isolating the three native modules

Keeps `backup.js` pure and makes I/O mockable in jest.
- `exportFile(filename, text)` → write to cache dir (`expo-file-system`) → `Sharing.shareAsync`
  (the off-device step).
- `pickFile()` → `expo-document-picker` `getDocumentAsync` → read file text.
- `writeRecovery(text)` → silent on-device safety copy to the document directory (the text is a
  full `createBackup` envelope, so the recovery file is itself a re-importable backup).

### Wiring in `src/RitualsApp.js`

New `onExportData` / `onImportData` handlers passed down to `YouScreen`, mirroring the existing
`onResetData` pattern. They own: gathering current state, calling `backup.js` + `io.js`, the
import confirm/safety/replace sequence, and stamping `lastBackupAt`.

### New persisted key

Add `lastBackupAt` (ISO string | null) to `PERSISTED_KEYS` in `state.js`, default `null` via the
defaults object. No destructive migration needed — `mergeWithDefaults` already supplies missing
keys for existing users.

---

## 3. Data flow

**Export**
1. Gather current state.
2. `createBackup(state)` → envelope → `JSON.stringify`.
3. `io.exportFile(backupFilename(today), json)` → OS share sheet.
4. User sends it **off-device** (Drive / email-to-self / Files-synced-to-cloud). The copy
   survives a dead phone *because it has left the device.* Copy makes this explicit:
   *"Save this somewhere that isn't this phone."*
5. Stamp `lastBackupAt = now`.

**Import (replace + safety net)**
1. `io.pickFile()` → raw text.
2. `readBackup(raw)`.
   - If `ok: false` → show the specific error for `reason` (see §6); stop.
   - If `ok: true` → show preview confirm dialog:
     > This backup: **247 entries**, last written **June 1**.
     > On this phone now: **2 entries**.
     > ⚠ This **replaces** what's on this phone. We'll save a recovery copy of the current
     > entries first, just in case.
     > `[ Cancel ]  [ Replace ]`
3. On **Replace**: `io.writeRecovery(createBackup(current state))` runs **FIRST** (on-device),
   then the imported `state` replaces app state and is persisted, then a success toast names the
   recovery file. The recovery copy uses the **same envelope format**, so it is itself a valid
   backup the user can re-import through the normal Import flow to undo a mistaken tap. It is
   intentionally on-device — it's an *undo*, not dead-phone protection.

---

## 4. UI — new "Your journal is safe" section on the You tab

A dedicated section in `src/screens/YouScreen.js`, **visually distinct** from the existing
Plus-gated PDF "Export reflections" row (that is prose → PDF, Plus only; this is data → JSON,
free, everyone — conflating them would confuse users). Reuses the existing `Row` / `Card` /
`Divider` components and the `Alert` confirm pattern already in the file. Icons `Download` and
`Restore` already exist in `src/icons.js`.

```
Your journal is safe
┌─────────────────────────────────────┐
│ ☁  Automatic backup                  │
│    Included in Android's backup to   │
│    your Google account. [How / check]│
│ ───────────────────────────────────  │
│ ↑  Export my journal                 │
│    last exported: 12 days ago     ›  │
│ ───────────────────────────────────  │
│ ↓  Import a backup               ›   │
└─────────────────────────────────────┘
```

- `lastBackupAt` drives the "last exported: N days ago" subtitle and a gentle nudge when it's
  been > 30 days (or never).
- Free for all users (not Plus-gated) — data ownership is not a premium feature.

---

## 5. The automatic layer + honesty caveat

IMP-006 controls whether **our app** opts into Android Auto Backup (Android manifest
`android:allowBackup` + backup rules). That part we own and finish as part of this work.

**Honesty caveat (deliberate):** there is no reliable JS API to read the *user's device-level*
Google-backup toggle. We will **not** fake a live ON/OFF we cannot actually read. The row states
the fact we *do* control ("Your journal is included in automatic backup to your Google account")
plus a short explainer and a deep-link to the system backup settings so the user can verify
themselves. Visibility and honesty over an impressive-but-false indicator. A true live status
would require a small custom native module — a separate decision, not in this scope.

---

## 6. Error handling & edge cases (all surfaced, never silent)

| Case | Behavior |
| --- | --- |
| File is not JSON / not our format / corrupt | "This doesn't look like a Daily Rituals backup." |
| Newer-version file (schema > current; `deserialize` returns null) | "This backup was made by a newer version of the app — update first." |
| User cancels share sheet or picker | No-op, no error message |
| Export with zero entries | Allowed, but warn: "You haven't written anything to back up yet." |
| Import succeeds | Success toast naming the recovery file written before replace |

**Privacy limitation (stated, not solved):** the exported file is **plaintext journal content,
unencrypted.** The UI advises keeping it somewhere private; the app never logs file contents.
Passphrase encryption is a noted future enhancement, deliberately not built now.

---

## 7. Testing (targets the 80% bar)

- **`backup.js` unit tests:**
  - Round-trip: `createBackup` → `readBackup` → restored state deep-equals original
    `pickPersisted(state)`.
  - `counts` correct (entries + unique days).
  - Rejects: non-JSON, wrong `format`, future schema version, corrupt payload.
  - Old-version payload migrates forward through `deserialize`.
- **Import-ordering integration test:** recovery copy is written **before** state is replaced.
- **`io.js` mocked** in jest (no real native modules invoked). The pure core makes this
  straightforward.

---

## 8. Build / shipping note (for later — not deciding deployment now)

Three new native dependencies (`expo-file-system`, `expo-sharing`, `expo-document-picker`) make
this a **BUILD lane** change (`npm run bump:build`), not an OTA. It naturally rides the same
build as IMP-006's manifest change — they are one shipment. Follow the playbook Release rules
when the owner asks to ship; never run `eas` by hand.

---

## 9. Open questions

None blocking. Deferred by explicit decision: scheduled auto-export (v2), file encryption
(future), live OS-backup-status detection (needs native module).
