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

## IMP-084 — the release build stops shipping the purchase simulation

### IMP-084 — a paywall that cannot charge must not be shown   ·   Lane: BUILD   ·   Status: ⬜

- 🔴 **THIS IS THE TOP OF THE QUEUE AND IT BLOCKS WALK-19.** Read this before any other work.

- **Goal:** it becomes structurally impossible to ship a store build whose paywall fakes purchases.
  Three independent layers: the key reaches EAS Build, the preflight verifies the thing that actually
  decides, and the app refuses to show a paywall it cannot transact through.

- **Why / context — found 2026-09-06 by the owner, on a device, and it is proven, not suspected.**
  `PLUS_ENABLED` has been `true` since 2026-09-05 and **v1.0.8 / vc14 has been on Play `internal` since
  then running `simService`** — the purchase simulation. The owner subscribed **in airplane mode and it
  succeeded.** Real Play Billing cannot complete a purchase with no network; the simulation can, and does,
  and grants Plus for free. Consequences, all confirmed:
  - **Every "purchase" on vc14 was fake.** Nothing reached Google, so nothing appears in Play's
    subscriptions list and there is nothing to cancel. That — not a missing `?sku=` — is the real reason
    the owner could not find their subscription, which means **IMP-083 was scoped against a symptom whose
    stated cause was wrong.** IMP-083's fix is still correct and still shipped; it was simply not the
    thing blocking cancellation.
  - **`12 Jun 2026` is not proof the OTA failed to apply.** `simService`'s
    `FALLBACK_RENEW_ISO = '2026-06-12T00:00:00.000Z'` formats through IMP-082's *new* code to exactly that
    string. Any diagnosis that reads that date as "stale bundle" is unsound. Verified by hand 2026-09-06.
  - **WALK-19 cannot be run on vc14 at all**, and any result already recorded against it is void: the
    suite fakes billing and so did the build.

- **Root cause, evidenced — do not re-derive it.** `RC_ANDROID_KEY` **does** exist on EAS in the
  `production` environment, and the build **still** shipped the simulation. That is the evidence: EAS
  Build never injected it, because **no profile in `eas.json` declares an `environment`**. ⚠️ **The
  obvious "fix" is wrong and must not be taken:** adding `env: RC_ANDROID_KEY` to the `eas build` step in
  `.github/workflows/release.yml` does **nothing**, because a cloud build evaluates `app.config.js` on
  EAS's servers, which never see the runner's environment. The binding in `eas.json` is the only lever.
  The existing preflight passed green throughout because it reads `process.env` **on the CI runner** —
  a different machine from the one whose value decides sim-vs-real.

- **Files likely touched:** `eas.json`, `scripts/check-billing-config.js`, `src/billing/index.js`,
  `src/RitualsApp.js`, and their tests.

- **Approach (decided by Opus — do not re-litigate).** Three layers, all three required. Layer C is the
  one that would have prevented this, so **do not stop at A**:

  **A — the key reaches the build.** `eas.json`: give the `production` build profile
  `"environment": "production"`. Give `development` → `"development"` and `preview` → `"preview"` so the
  mapping is explicit rather than implied. Nothing else in `eas.json` changes.

  **B — the preflight verifies the lever, not the runner.** It cannot see EAS's servers, so it must at
  minimum assert the binding exists. Add a pure `easEnvironmentPreflight({ easJson })` to
  `scripts/check-billing-config.js` that fails when `build.production.environment !== 'production'`, and
  call it from `main()` alongside the existing check. Keep the existing `billingPreflight` **unchanged** —
  it is still a useful check of the runner, it was simply never sufficient. Its header comment must be
  corrected: it currently claims to make the simulation "a hard build failure instead of a shipped one",
  which this incident disproves.

  **C — the app refuses to show a paywall it cannot back.** This is the same rule the project already
  applies to the cut PDF perk, the decoupled ember packs and IMP-082's dates: *never assert what cannot
  be backed.* A paywall wired to `simService` in a store build asserts a purchase it cannot make.
  In `src/RitualsApp.js`, immediately after the existing `PLATFORM` is available, derive:

  ```js
  // IMP-084: PLUS_ENABLED says the paid surface is INTENDED; this says it can
  // actually transact. In a store build with no RevenueCat key the service falls
  // back to simService, which fakes purchases and grants Plus free — so the whole
  // paid surface hides instead. __DEV__ keeps the simulation reviewable in Expo Go,
  // which is the only place it is legitimate.
  const PAYWALL_LIVE = PLUS_ENABLED && (isBillingConfigured(PLATFORM) || __DEV__);
  ```

  Then **replace every use of `PLUS_ENABLED` in `RitualsApp.js` with `PAYWALL_LIVE`** — all of them,
  including the `restoreAccess({ plusEnabled: … })` call and every `plusEnabled=` prop. The paid surface
  stands or falls as one; a Restore button on a build that cannot restore is the same defect. **Do not
  change `PLUS_ENABLED` in `config.js`** and do not touch it anywhere outside `RitualsApp.js`.

- **TDD:** RED-first on `easEnvironmentPreflight` (pure, and `checkBillingConfig.test.js` already exists)
  and on the `PAYWALL_LIVE` expression.

- **Steps:**
  - [ ] 1. **RED** — `easEnvironmentPreflight` tests: a production profile with
        `environment: 'production'` ⇒ ok; with the field absent ⇒ **not** ok; with a different value ⇒
        not ok; a missing `build.production` ⇒ not ok with a reason naming the profile.
  - [ ] 2. Implement `easEnvironmentPreflight` and export it; call it from `main()` so either failure
        exits non-zero. Correct the file header comment per Layer B.
  - [ ] 3. `eas.json` — add the three `environment` bindings. **Change nothing else**; leave `channel`,
        `distribution` and `submit` exactly as they are.
  - [ ] 4. **RED** — a test for the gate expression. Extract it as a pure exported helper
        `paywallLive({ plusEnabled, billingConfigured, dev })` in `src/billing/index.js` so it is testable
        without rendering: true only when `plusEnabled && (billingConfigured || dev)`. Cover all eight
        combinations.
  - [ ] 5. Implement `paywallLive`, and in `RitualsApp.js` derive `PAYWALL_LIVE` from it, then do the
        mechanical `PLUS_ENABLED` → `PAYWALL_LIVE` replacement described in Layer C.
  - [ ] 6. `npm test` green (must stay ≥ **902**, the count after commit `1f4f037`).
  - [ ] 7. `npx expo export --platform android` clean.

- **Tests:** the four `easEnvironmentPreflight` cases and the eight `paywallLive` cases. Plus one
  regression test asserting `RitualsApp.js` source contains no bare `plusEnabled={PLUS_ENABLED}` — that is
  the line that would silently reintroduce the giveaway, and a source assertion is the only thing that
  catches it without a device.

- **Commit:** `fix(billing): a paywall that cannot charge is no longer shown`

- **Acceptance:** a store build with `PLUS_ENABLED = true` and no key **hides** the paid surface instead
  of faking it, and CI refuses to build when the `eas.json` binding is missing. **Runtime proof is
  WALK-19 step 0(c)** — airplane mode, attempt a purchase, and it must FAIL.

- **Ship after merge:** ⚠️ **BUILD lane — this needs a new versionCode.** Layer A only takes effect in a
  build; it cannot be OTA'd. See the note below on what the current OTA is and is not doing.

> ### ⚠️ What the 2026-09-06 OTA is doing right now — read before cutting the next build
>
> Update group `ac5c4189-736c-44f0-96ae-6ceea4fe4712` was published from a machine whose `.env` holds a
> valid `goog_` key, and `Constants.expoConfig` reads from the **running update's** manifest. So that OTA
> very likely **flips vc14 from fake billing to real billing** as it applies. That is desirable — it stops
> the giveaway — but it was **not intended**, it is **unwalked**, and it means real charges become possible
> on the `internal` track. **Confirm every account on that tester list is a license tester.** It is also a
> **runtime patch, not a fix**: a device that never takes the update still fakes purchases, and the next
> build regresses to the simulation unless Layer A lands first.

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
