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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **764 passed, 78 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## Index — take them in this order

| # | Spec | Lane |
| --- | --- | --- |
| IMP-062 | [The restore offer outlives the launch that made it](#imp-062--the-restore-offer-outlives-the-launch-that-made-it) | OTA |

> **IMP-056 is done (2026-08-10), IMP-050 is done (2026-08-10), IMP-051 is done (2026-08-10), IMP-052 is
> done (2026-08-13), IMP-053 is done (2026-08-13), IMP-054 is done (2026-08-13), IMP-055 is done
> (2026-08-13), IMP-060 is done (2026-08-13), IMP-059 is done (2026-08-13), IMP-058 is done (2026-08-14)
> and IMP-061 is done (2026-08-14) — see `docs/build-log.md`.**
> **IMP-062 came out of a walk, not a feature idea** — the owner hit it mid-WALK-02 on 2026-08-14. It
> **blocks WALK-02**, which is the first 🚦 row gating the release build, so it is the whole queue until it
> lands.
> **IMP-057 is still deliberately absent.** It is reserved
> for the historical `dayKey` migration IMP-056 deferred, and it cannot be written until a real device's
> numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added. **Do not reuse the
> number.**
>
> **Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
> runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
> the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
> build chat**, and do not read a missing walk as an unfinished spec.

---

## IMP-062 — the restore offer outlives the launch that made it

**Lane: OTA.** No native change, no bump. Rides the same build as the rest of the batch.
**Runtime proof: WALK-02**, which is the walk this came out of and cannot pass until this lands.

**Why.** Found by the owner mid-walk on **WALK-02** on 2026-08-14: the "We found your journal" sheet's
**Restore from a file** action imports the chosen file but never clears the OS-restore stash. Scoping it
found the same handler family is broken in three separate ways, and the second one is worse than the
reported symptom — **an OS-restored journal can end up locked inside AsyncStorage where no user action can
reach it, in the one flow whose whole purpose is not losing a user's journal.**

| # | Defect | Consequence today |
| --- | --- | --- |
| **A** | `pendingRestore` is only ever set inside the **quarantine branch** of `App.js`'s load effect ([`App.js:61-72`](../App.js#L61)). Quarantine fires exactly once — `serialize()` re-stamps `lastSavedAt = Date.now()` on the next save ([`state.js:31`](../src/persistence/state.js#L31)), so `isRestoredInstall` is false from then on — and **nothing else ever calls `readPendingRestore()`**. | After the launch that quarantined, the offer sheet **and** the You-tab `Google backup — {date}` row both vanish for good, while the stash stays in storage forever. Declining "Keep this fresh start" and relaunching loses the only route back to the data — and the only route to **Discard** it. WALK-02 step 5 asserts the opposite. |
| **B** | The answer to the offer lives in `restoreOfferDismissed`, a plain `useState(false)` ([`RitualsApp.js:143`](../src/RitualsApp.js#L143)). Nothing persists it. | Nothing survives a relaunch. Masked today by **A** (there is no stash to re-offer); the moment A is fixed, an unanswered offer would re-ambush on every cold start. **A and B must land together — fixing either alone is worse than fixing neither.** |
| **C** | `onRestoreFile` ([`RitualsApp.js:997`](../src/RitualsApp.js#L997)) flips `restoreOfferDismissed` **before** `doImport()` runs, and nothing marks the offer answered when the import actually succeeds. | The sheet hides on a cancelled picker, a damaged file or a cancelled confirm — and stays hidden after a real restore only by accident of A. This is the defect as reported. |

**One correction to the filed finding, so nobody re-derives it:** the report said the sheet "re-appears on
every subsequent launch". It does not — defect **A** means it never appears again at all. A repeated sheet
is what **T4** produces, because a clock still set in the past re-quarantines on every launch. The filed
symptom was a walk artifact; the underlying defect is the opposite and larger.

**Nobody in production is carrying an orphaned stash** — IMP-033 has never reached a track (`alpha` is
vc11, pre-IMP-033). Fixing A therefore cannot resurface a stash in a user's face; the first install that
can quarantine at all is the build this ships in.

### Decided design — do not re-litigate

1. **The stash is re-read on every launch, unconditionally.** One `readPendingRestore()` in the load
   effect's fall-through. It is the storage key, not the quarantine event, that decides whether an offer is
   outstanding.
2. **A successful "Restore from a file" does NOT destroy the stash — it only answers the offer.** The user
   picked a different source; they did not ask to delete their Google backup. Destroying it silently would
   bypass the inventory-warning confirm that **Discard** exists to show, which the owner explicitly required
   ("no one-tap destructive dismissal", IMP-033). The stash stays reachable through the You-tab row, where
   Discard still warns properly. **Load** and **Discard** keep consuming it; those two are unchanged.
3. **The answer is persisted in its own AsyncStorage key, NOT in the journal state.** A restore replaces the
   whole persisted slice — an answer stored in `PERSISTED_KEYS` would be overwritten by the very file
   restore that set it, and the sheet would return on the next launch. **Do not add a `PERSISTED_KEYS`
   entry.** The answer belongs to the stash, so it lives next to the stash and dies with it.
4. **The offer is answered at the moment of confirmation, not at the moment of a successful write.** The
   point of no return for the user is tapping **Replace** in the confirm alert. Marking it there means a
   cancelled picker or a rejected file leaves the sheet exactly where it was, and it avoids a one-frame
   re-flash of the sheet over the restored app (the replace bumps `dataKey`, and a post-write answer lands a
   render too late). A *failed* write therefore still counts as answered — accepted deliberately: the toast
   says the journal is unchanged and the You-tab row keeps the stash one tap away.
5. **`shouldOfferRestore` stays unused.** It is exported and tested but nothing calls it, and this task does
   not wire it — the sheet mounts inside `RitualsApp`, which only exists post-onboarding, so its `onboarded`
   half is already structural. Leave it alone.

### Steps

**1 — `src/persistence/storage.js`: the answered key.** Alongside `PENDING_RESTORE_KEY`, add
`const RESTORE_OFFER_ANSWERED_KEY = 'dailyrituals:v1:restoreOfferAnswered';` and three functions in the
exact style of the stash trio — `try/catch`, `console.warn`, falsy on failure, **never throw**:

- `writeRestoreOfferAnswered()` → `setItem(key, '1')`, returns `true`/`false`.
- `readRestoreOfferAnswered()` → returns **a boolean**, `getItem(key) === '1'`; `false` when unset or on
  failure. Never `null` — the caller feeds it straight into a render condition.
- `clearRestoreOfferAnswered()` → `removeItem`, returns `true`/`false`.

**2 — `src/backup/importFlow.js`: an `onImported` step that cannot fake a failure.** `runConfirmedImport`
gains a fifth, optional injected effect:

```js
export async function runConfirmedImport({ currentEnvelopeText, restoredState, writeRecovery, replaceAll, onImported }) {
  await writeRecovery(currentEnvelopeText); // 1. safety copy of current data FIRST
  await replaceAll(restoredState);          // 2. only then the destructive replace
  // 3. post-success effects (IMP-062): the import has already happened, so a
  // failure here must never be reported as a failed import.
  if (onImported) { try { await onImported(); } catch (e) { console.warn('onImported failed after a successful import', e); } }
}
```

Both existing guarantees are unchanged: `onImported` runs **only** after `replaceAll` resolved, and a throw
from either of the first two steps still rejects before it is reached.

**3 — `src/RitualsApp.js`: the offer's answer moves up to `App`.** `RitualsApp` stops owning it — `App`
holds both halves of the stash decision, and `RitualsApp` remounts on `dataKey` (which a restore bumps), so
local state here would be re-initialised mid-restore.

- **Props** ([`RitualsApp.js:89`](../src/RitualsApp.js#L89)) — after `onConsumePendingRestore`, add
  `restoreOfferAnswered = false, onAnswerRestoreOffer, onReopenRestoreOffer`.
- **Delete** the `restoreOfferDismissed` `useState` ([`:143`](../src/RitualsApp.js#L143)). Every reader
  below becomes the prop.
- **`doImport`** ([`:583`](../src/RitualsApp.js#L583)) → `const doImport = async ({ onConfirmed } = {}) => {`.
  Inside the **Replace** button's `onPress`, call `onConfirmed?.()` as the **first** statement, before the
  `try`. Everything else in the handler is untouched.
- **`handleLoadPendingRestore`** ([`:620-648`](../src/RitualsApp.js#L620)) — move the stash consume into the
  orchestration: delete the `await onConsumePendingRestore();` line that follows `runConfirmedImport` and
  pass `onImported: onConsumePendingRestore` inside the call instead. Deleting the stash is destructive, so
  it stays on the proven-success path — and it no longer risks firing the "Load failed" toast after a load
  that worked.
- **`handleKeepFreshStart`** ([`:651`](../src/RitualsApp.js#L651)) → `() => onAnswerRestoreOffer()`.
- **`onReopenPendingRestore`** ([`:718`](../src/RitualsApp.js#L718)) → `() => onReopenRestoreOffer()`, with
  the comment `// session-only: the persisted answer stands, so a reopen the user walks away from doesn't re-ambush them next launch`.
- **The offer's mount + action** ([`:993-999`](../src/RitualsApp.js#L993)) → condition becomes
  `pendingRestore && !restoreOfferAnswered`, and
  `onRestoreFile={() => doImport({ onConfirmed: onAnswerRestoreOffer })}`. **The sheet now stays mounted
  under the file picker and the confirm alert** — both are native layers on top of it, so there is nothing
  to see, and backing out of either correctly leaves the offer standing.
- **`RestoreNotice`'s `onRestoreFile`** ([`:990`](../src/RitualsApp.js#L990)) calls `doImport()` with no
  argument — **leave it exactly as it is.** That is IMP-029's notice, a different surface with no stash.

**4 — `App.js`: own the stash and its answer together.**

- Import `readRestoreOfferAnswered, writeRestoreOfferAnswered, clearRestoreOfferAnswered` from
  `./src/persistence/storage`.
- New state beside `pendingRestore`: `const [restoreOfferAnswered, setRestoreOfferAnswered] = useState(false);`
- **Quarantine branch** ([`App.js:65-72`](../App.js#L65)) — a fresh stash is a fresh question, so clear any
  stale answer, and do **both awaits before any `setState`** so the branch still renders once:
  ```js
  if (quarantined) {
    await clearRestoreOfferAnswered();      // a new stash is a new question
    const stashRaw = await readPendingRestore();
    setPendingRestore(deserialize(stashRaw));
    setRestoreOfferAnswered(false);
    setHydrated({});
    setOnboarded(false);
    return;
  }
  ```
- **The fall-through path — this is defect A.** Immediately before `setHydrated(s)`
  ([`App.js:83`](../App.js#L83)), outside the `if (s.lastSavedAt)` block so it runs on every launch:
  ```js
  // IMP-062: the stash outlives the launch that created it. Quarantine fires
  // once (the next save re-stamps lastSavedAt), so without this read the offer
  // and the You-tab row vanish after one session and the stash is orphaned in
  // storage — unreachable, and undeletable by the user.
  const stashRaw = await readPendingRestore();
  if (stashRaw) {
    setPendingRestore(deserialize(stashRaw));
    setRestoreOfferAnswered(await readRestoreOfferAnswered());
  }
  ```
  One extra `getItem` per launch, both reads before `setHydrated` so it is still a single render.
- **`handleConsumePendingRestore`** ([`App.js:136`](../App.js#L136)) also clears the answer, keeping the
  invariant *the answered key exists only while a stash exists*:
  ```js
  await clearPendingRestore();
  await clearRestoreOfferAnswered();
  setPendingRestore(null);
  setRestoreOfferAnswered(false);
  ```
- **Two new handlers**, passed down with the existing restore props:
  ```js
  // Answered, not consumed: the stash survives so the You-tab row can still
  // reach it, and Discard keeps its inventory warning (IMP-033's rule).
  const handleAnswerRestoreOffer = async () => {
    setRestoreOfferAnswered(true);
    await writeRestoreOfferAnswered();
  };
  const handleReopenRestoreOffer = () => setRestoreOfferAnswered(false);
  ```
  Wire `restoreOfferAnswered={restoreOfferAnswered}`, `onAnswerRestoreOffer={handleAnswerRestoreOffer}`,
  `onReopenRestoreOffer={handleReopenRestoreOffer}` onto `<RitualsApp>` ([`App.js:168`](../App.js#L168)).

### Tests

Neither `App.js` nor `RitualsApp.js` is render-tested anywhere in this repo and **this task does not start
that** — push the assertions onto the two injected seams instead.

**`__tests__/backup/importFlow.test.js`** (+4) — `onImported` runs after `replaceAll`, asserted by call
order, not just call count · never runs when `writeRecovery` throws · never runs when `replaceAll` throws ·
an `onImported` that throws does **not** reject `runConfirmedImport` (this is the "Load failed" toast lie) ·
the existing cases stay green with `onImported` omitted.

**`__tests__/persistence/storage.test.js`** (+4) — write → read → clear round trip · unset reads `false`,
not `null` · the answered key is independent of the live state key and of the stash in both directions
(clearing either leaves it alone — App clears it deliberately, storage does not do it implicitly) ·
`clearRestoreOfferAnswered` on an unset key is a no-op that still resolves `true`.

### Done

`npm test` green and **≥ 764** (expect ~**772**, 78 suites — no new suite files). `npx expo export --platform
android` clean. **Commit:** `fix(restore): the offer outlives its launch — rehydrate the stash, persist the answer (IMP-062)`.
No `Release-Lane` trailer. Then tick the backlog row, write the session note, move this spec into
`docs/build-log.md`, and leave **WALK-02** for a walk chat — **do not walk it here.**
