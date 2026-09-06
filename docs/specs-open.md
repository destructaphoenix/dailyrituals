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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **902 passed, 89 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## IMP-085 — the SDK probe that has always said no

### IMP-085 — `isBillingConfigured()` must be able to return true   ·   Lane: BUILD   ·   Status: ⬜

- 🔴 **TOP OF THE QUEUE. It supersedes the "vc14 had no key" story as the primary cause.**

- **Goal:** the app can actually detect the RevenueCat SDK, so a build carrying a key transacts for real —
  and a person who already has Plus can always reach the cancel route, whatever the gate says.

- **Why / context — verified in the toolchain source 2026-09-06, and it rewrites IMP-084's record.**
  `src/billing/index.js` probes with `require.resolve('react-native-purchases')` inside a try/catch.
  **Metro does not implement it:** `metro-runtime/src/polyfills/require.js` assigns `resolveWeak` but never
  `resolve`, and `metro/src/ModuleGraph/worker/collectDependencies.js` rewrites `require.resolveWeak` and
  `require.context` but not `require.resolve`. The call therefore throws in every Metro bundle, the catch
  swallows it, and **`isBillingConfigured()` has returned `false` in every build this app has ever
  shipped.** Every release has run `simService`. **vc15 does too** — IMP-084 layer A really does inject the
  key now (proven in its build log) but nothing reads it.
  - **The SDK is bundled and would work.** `revenueCatService.js` does a static
    `import Purchases from 'react-native-purchases'`, which Metro *does* collect. Only the probe is broken.
  - **jest cannot see this**: under jest `require` is node's, where `require.resolve` works. 915 green.
  - **The owner-visible symptom** (2026-09-06, on device): Manage Subscription vanished from the app while
    Plus stayed applied and the skins stayed unlocked — `PAYWALL_LIVE === false` with a stale local `plus`.

- **Files likely touched:** `src/billing/index.js`, `src/RitualsApp.js`, `src/screens/PlusFlow.js`, tests.

- **Approach (decided by Opus — do not re-litigate).**

  **A — probe by loading, not by resolving.** A static `require` is collected by Metro; the presence of a
  working native module is proven by the shape of what comes back, not by whether a path resolves.
  Add a pure exported `billingModuleOk(mod)` returning true only when
  `mod && typeof mod.configure === 'function'` (RevenueCat's own entry point), then:

  ```js
  let _rcModule = null;
  try {
    // Static require: Metro collects this. require.resolve does NOT exist in a
    // Metro bundle (IMP-085) and threw here in every build ever shipped.
    const m = require('react-native-purchases');
    _rcModule = (m && m.default) || m;
  } catch (e) {
    _rcModule = null; // Expo Go / no native module linked
  }
  const _rcModuleOk = billingModuleOk(_rcModule);
  ```

  **B — a subscriber never loses the route to cancel.** This is the same "never assert what you cannot
  back" rule read from the other side: hiding the *management* path from someone who believes they are a
  subscriber is worse than hiding the paywall. **Gate Manage on entitlement, not on saleability.** Where
  `RitualsApp.js` currently passes `onOpenManage={PAYWALL_LIVE ? … : () => {}}` and
  `onManage={PAYWALL_LIVE ? … : () => {}}`, the condition becomes **`plus`**. When `plus && !PAYWALL_LIVE`,
  **do not open the in-app sheet** (it would render numbers billing cannot back) — call
  `openExternal(manageUrl({ … }))` so the person lands in Play's own subscription screen, which is the one
  place the truth lives. `visible={PAYWALL_LIVE && manageOpen}` becomes `visible={manageOpen}`, since the
  sheet is now only ever opened on a path that already checked. **Every other `PAYWALL_LIVE` use in that
  file stays exactly as IMP-084 left it** — the paywall, the Restore button and the perk modals still hide.

- **TDD:** RED-first on `billingModuleOk`, and on the source assertion in A.

- **Steps:**
  - [ ] 1. **RED** — `billingModuleOk`: a module exposing `configure` ⇒ true; `{}` ⇒ false; `null` ⇒ false;
        `undefined` ⇒ false; a module whose `configure` is not a function ⇒ false.
  - [ ] 2. Implement `billingModuleOk`, export it, and rewire `_rcModuleOk` per A.
  - [ ] 3. **RED** — a source assertion that `src/billing/index.js` contains **no `require.resolve`**. That
        one string is the whole defect and nothing else in the suite can catch its return.
  - [ ] 4. Rewire the Manage route per B, including the `plus && !PAYWALL_LIVE` external fallback.
  - [ ] 5. Tests for B: with `plus` true and the gate false, the Manage handler is **not** a no-op and the
        in-app sheet is **not** opened; with `plus` false the entry point stays hidden.
  - [ ] 6. `npm test` green (≥ **915**). 7. `npx expo export --platform android` clean.

- **Tests:** the five `billingModuleOk` cases, the `require.resolve` source assertion, and the two Manage
  routing cases.

- **Commit:** `fix(billing): the SDK probe stops answering no in every build`

- **Acceptance — RUNTIME ONLY, and it is the whole point of this spec.** No test can close it.
  **WALK-19 step 0(c) inverted:** on a build carrying this fix and a key, the paywall must be **VISIBLE**,
  a purchase in airplane mode must **FAIL**, and a purchase online must appear **in Play's subscription
  list**. Until that runs, treat billing as unproven — that has been true of every build to date.

- ⚠️ **Do not fix this by reverting IMP-084 layer C.** Layer C did not cause the outage; it revealed it,
  and reverting restores the free-Plus giveaway.

- ⚠️ **Open question for the owner, not for the build chat:** the owner's current Plus is a **stale fake
  entitlement** written by `simService`. Once billing is real, that local flag will disagree with
  RevenueCat. Whether to clear it on first real launch is a product decision and is **not** in this spec.

---

### Numbers that must not be reused

- **079** — used on 2026-09-05 for a baseline-capture path written, reviewed and deleted in the same
  session. Nothing landed under it, but the note naming `IMP-079` is still in the log, so reusing the
  number would make that note read as though it described a different spec.
- **057** — reserved for the historical `dayKey` migration IMP-056 deferred. It cannot be written until a
  real device's numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added.

### 🔒 The branch rule still stands — `feat/design-push`, never pushed

Owner instruction, 2026-08-17, extended to IMP-080/081 on 2026-09-05: **none of this work reaches
GitHub.** **Never `git push`** (the branch has no upstream so a bare push fails — do not set one),
**never add a `Release-Lane:` trailer**, and **do not merge to `main`.** Merging is a separate owner
decision taken after the walks pass. It applies to every spec that lands here next, too.

### The rules the next spec inherits

**Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
build chat**, and do not read a missing walk as an unfinished spec. IMP-077 is the newest worked example:
it ended code-complete at 873 green tests, and **its green suite proves nothing about the motion** — the
Reanimated jest mock no-ops every hook. WALK-18 settles it.
