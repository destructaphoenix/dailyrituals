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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **873 passed, 85 suites**), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

## IMP-082 — the member surfaces stop inventing a renewal date

### IMP-082 — RENEW_DATE stops being a runtime fallback   ·   Lane: OTA   ·   Status: ⬜

- **Goal:** no surface ever shows a fabricated subscription renewal date. A real subscriber sees the
  real date from RevenueCat; when no live date exists, the app says nothing about renewal rather than
  making one up.

- **Why / context:** found 2026-09-05 while enabling Plus (`PLUS_ENABLED = true`, commit `7d2e515`).
  `RENEW_DATE = '12 Jun 2026'` ([`data.js:183`](../src/data.js#L183)) is **design-mock data from the
  prototype** and it is wired into live surfaces as a fallback. With Plus off nobody could see it.
  With Plus on, a real paying subscriber can — and it will be wrong for every one of them. **Five
  sites, and the rot starts in the pure layer:**
  - [`format.js:8,10`](../src/billing/format.js#L8) — `formatRenewDate(iso)` returns `RENEW_DATE`
    when the ISO is missing **or unparseable**. So even the "live" path fabricates a date when
    RevenueCat hands back an entitlement without a usable renewal timestamp.
  - [`RitualsApp.js:180`](../src/RitualsApp.js#L180) — `liveEntitlement ? formatRenewDate(…) : RENEW_DATE`.
  - [`shopui.js:52`](../src/shopui.js#L52) — `PlusBanner` renders `Member · renews {RENEW_DATE}` from the
    **imported constant directly**. It takes no `renewLabel` prop at all, so it shows `12 Jun 2026` to
    every subscriber on **both** the You tab ([`YouScreen.js:111`](../src/screens/YouScreen.js#L111)) and
    the Shop ([`Shop.js:76`](../src/screens/Shop.js#L76)).
  - [`PlusFlow.js:184`](../src/screens/PlusFlow.js#L184) + `:214`, `:256`, `:257` — `ManageSubscription`.
  - [`PlusFlow.js:275`](../src/screens/PlusFlow.js#L275) + `:285` — `CancelSheet`.

  This is the same class as the PDF perk and the ember packs: **the paid surface asserting something
  the app cannot back.** It is not a giveaway, so it did not block the vc14 build — it is pure JS and
  **ships by OTA** once vc14 is on `internal`.

- **Files likely touched:** `src/billing/format.js`, `src/RitualsApp.js`, `src/shopui.js`,
  `src/screens/YouScreen.js`, `src/screens/Shop.js`, `src/screens/PlusFlow.js`, and their tests.

- **Approach (decided by Opus — do not re-litigate):** `RENEW_DATE` stops being a **runtime** fallback
  everywhere. The rule, already established by [`prices.js`](../src/billing/prices.js) for prices and
  stated in its header: *never assert what cannot be computed from real data — drop the claim instead of
  showing it stale.* Apply it to dates. `RENEW_DATE` itself is **not deleted** — it stays in `data.js`
  for the dev panel and test fixtures — but nothing user-facing may fall back to it.

- **TDD:** RED-first on `formatRenewDate` (pure, already has a test file) and on `PlusBanner`.

- **Steps:**
  - [ ] 1. **RED** — a `formatRenewDate` test asserting `null` for `undefined`, `''`, and an
        unparseable string like `'not-a-date'`. Update the existing cases that expect `RENEW_DATE`.
  - [ ] 2. `formatRenewDate(iso)` returns **`null`** instead of `RENEW_DATE` on both the missing and
        the `isNaN` branch. Its valid-ISO formatting is unchanged.
  - [ ] 3. [`RitualsApp.js:180`](../src/RitualsApp.js#L180) → `const renewLabel = liveEntitlement ? formatRenewDate(liveEntitlement.renewISO) : null;`
  - [ ] 4. **RED** — a `PlusBanner` test: with `plus` and a `renewLabel` it renders `Member · renews <that label>`;
        with `plus` and **no** `renewLabel` it renders `Member` and the string `renews` appears nowhere.
  - [ ] 5. `PlusBanner` takes a `renewLabel` prop (default `null`). Line 52 becomes
        `Member · renews {renewLabel}` when truthy, otherwise the bare word `Member`. **Drop the
        `RENEW_DATE` import from `shopui.js`.**
  - [ ] 6. Thread it: `YouScreen` and `Shop` each take a `renewLabel` prop and pass it to `PlusBanner`;
        `RitualsApp` passes `renewLabel={renewLabel}` to both.
  - [ ] 7. `ManageSubscription` — `const renew = renewLabel;` (drop `|| RENEW_DATE`). Then:
        **`:214`** — when `renew` is null the row shows `${p.label}` alone (or `Ends soon · access until then`
        when `canceled`); **`:256`/`:257`** — when null, use `Your subscription won't renew.` and
        `Cancelling stops the next renewal.` respectively, i.e. **drop the trailing "until …" clause**,
        keeping the full stop.
  - [ ] 8. `CancelSheet` — same: drop `|| RENEW_DATE`; when null the sentence ends at
        `…so you can cancel.` and the ` — you'll keep Plus until {renew}` clause is not rendered.
  - [ ] 9. Add a comment on `RENEW_DATE` in `data.js` saying it is **mock data for the dev panel and
        fixtures only** and must never be a user-facing fallback — with a pointer to this IMP.
  - [ ] 10. `npm test` green (must stay ≥ **875**, the count after commit `6590834`).
  - [ ] 11. `npx expo export --platform android` clean.

- **Tests:** `formatRenewDate` — null on undefined/empty/unparseable, correct format on a valid ISO
  (existing case). `PlusBanner` — with and without `renewLabel`, asserting `renews` is absent in the
  second. `ManageSubscription` / `CancelSheet` — render with `renewLabel={null}` and assert the copy
  contains no `until` clause and no `12 Jun 2026`. A guard test asserting the string `12 Jun 2026`
  does not appear in any rendered member surface is welcome but not required.

- **Commit:** `fix(billing): the member surfaces stop inventing a renewal date`

- **Acceptance:** on the internal build, a license-tester subscriber sees their **real** renewal date on
  the You tab, the Shop banner and Manage. Confirmed as step 5 of **WALK-19**.

- **Ship after merge:** OTA — pure JS, and the lane reopens once vc14 is on `internal`.

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
