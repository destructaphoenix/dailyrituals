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
> **Every spec ends the same way:** `npm test` green (must stay ≥ the prior count, currently **1102 passed, 98 suites** — verified 2026-09-09), `npx expo export --platform android` clean, commit with the **exact** message given, then
> update `PROGRESS.md` (tick the backlog row, write the session note) and **move the finished spec from
> this file into `docs/build-log.md`**.
>
> **Ship trailer:** only add `Release-Lane: ota` / `Release-Lane: build` when the owner asked you to
> release. No trailer = committed but not shipped, which is the normal end state.

---

## The queue — EMPTY

**No open IMP rows.** IMP-105, the last one, closed on 2026-09-10 when WALK-19a passed: the
reinstall-restore "defect" was the walk's own ordering, not the app. The next row must be opened by the
owner (the parked embers-for-money conversation at the bottom is the only candidate, and it is gated on
two unanswered questions).

**The owner asked for the Plus purchase surface to be investigated hard after IMP-099.** It was, by reading
the shipped SDK rather than our assumptions about it, and **the audit found a defect larger than IMP-099**.
**Three more rows came out of the WALK-19 re-run on 2026-09-08 (hardware, owner-run)**, and all three were
re-scoped the same day by reading source rather than trusting the field report. **Two of the three moved:
IMP-103 is not a defect at all, and IMP-104 no longer needs the device dump it asked for.** The
investigation also opened IMP-106, now code-complete and archived.

| Row | What | Severity |
| --- | --- | --- |
| IMP-100 | Every RevenueCat purchase error becomes `failed`. `e.code` is a **number**, our mapper matches **names**. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-101 | The `failed` card claims "you weren't charged" and never asks the store. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-102 | Completing a purchase grants **+3 freezes every time**, not once. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-103 | Step 4e failed on a bundle without IMP-100/101 — **neither was ever pushed or shipped**. | ✅ **done — shipped 2026-09-10, group `f961b427`; archived in `docs/build-log.md`** |
| IMP-104 | `tier: 'owned'` means free and `Shop.js` never reads it — and tapping such an item **wipes the ember balance to 0**. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-105 | 🚦 Reinstall + Restore said "Nothing to restore." **The test subscription had expired mid-walk; the app was innocent.** | ✅ **CLOSED 2026-09-10 by WALK-19a — not reproducible, walk-protocol defect. Archived in `docs/build-log.md`** |
| IMP-106 | A healthy build cannot say which JS bundle it is running — the gap that mis-scoped IMP-103. | ✅ **done — archived in `docs/build-log.md`** |
| IMP-107 | A lapsed member kept Plus until they happened to background the app — no launch-time downgrade check. | ✅ **done — archived in `docs/build-log.md`** |

---

### Parked: embers for money — a conversation, not yet a spec

**Owner, 2026-09-08:** *"embers need to be made acquirable for money — without embers you cannot buy
candles."* **Parked for its own chat. Nothing here is authorised to build.** This section exists so that
chat starts from findings instead of re-deriving them. It is not an `IMP-xxx` and must not be given a
number until the two questions at the bottom are answered.

**Where it actually stands.** `EMBER_PACKS_ENABLED` is `false` ([`config.js:82`](../src/billing/config.js#L82)).
`EMBER_PACKS` already exist in [`data.js:157-161`](../src/data.js#L157) carrying real prices
(`$1.99` / `$4.99` / `$9.99`). But the buy handler at
[`RitualsApp.js:985`](../src/RitualsApp.js#L985) is `onBuy={(pack) => setEmbers((e) => e + pack.amount)}`
— a bare counter increment. No purchase service, no RevenueCat, no IAP of any kind.
⚠️ **Flipping the flag today ships a store that displays dollar prices and hands over the goods for
free** — the exact vc14 giveaway shape IMP-084 was opened for. The flag is the only thing preventing it.

**The economy as built.** `EMBER_GAIN` is 15 per day kept. Candles cost 120 / 300 / 450 for 1 / 3 / 5;
palettes 240–420; skies 300. One candle ≈ 8 days of writing; the $1.99 pack ≈ 16 days of earning.

**Three findings the decision turns on.**

1. **Selling embers is selling streak protection.** Candles auto-spend to repair a broken streak
   ([`streakFreeze.js:14`](../src/home/streakFreeze.js#L14)). Once embers are purchasable, a user who
   breaks a streak can buy it back with cash. For an app whose proposition is an honest record, that is
   the one mechanic where money buying a better outcome costs something real. Mitigations exist (candles
   must be *held before* the missed day; or cash buys cosmetics only and candles stay earned) — but the
   choice has to be deliberate.
2. **A shipped promise is already wrong, independent of this.** `PLUS_PERKS[1]` sells *"Streak insurance
   — a candle spends itself when you miss a day"* as a **Plus** perk, and `Onboarding.js:31` shows it in
   the first three. **`applyAutoFreeze` is not gated on `plus` at all** — free users already get it. Either
   gate it or rewrite the line. This is a live mis-sell today and it decides what ember money would be
   buying.
3. **Consumables are a build lane and harder than the subscription was.** New Play *consumable* products
   attached in RevenueCat; `revenueCatService.buy()` only knows subscription packages and would need
   `purchaseStoreProduct` plus `getProducts(..., 'NON_SUBSCRIPTION')` (both confirmed present in
   `react-native-purchases` 10.5.0). The sharp edge: **consumables are not restorable the way a
   subscription is.** `CustomerInfo.nonSubscriptionTransactions` exists, but the app must track which
   grants it has already applied or a reinstall double-grants / loses them. ✅ **The IMP-105 gate has
   LIFTED (2026-09-10):** the simple case is now proven on hardware — a subscription entitlement survives
   uninstall → reinstall untouched (WALK-19a). ⚠️ **That proof does not extend to consumables**, which
   restore by a different mechanism entirely; the ledger problem below is still real and unsolved. The
   `$1.99` literals
   must also become store-fetched, the way IMP-090 made the trial copy honest, especially on INR.

**Recommendation on the table (owner has not ruled).** Ship **cosmetics-first**: cash buys embers, embers
buy palettes and skies, candles stay earned. Captures nearly all the revenue upside, costs none of the
streak integrity, and avoids the consumable-ledger problem entirely because cosmetics are durable state
the app already persists.

**The two questions that must be answered before any spec is written.**

1. **Does cash buy candles, or only cosmetics?**
2. **Is auto-freeze a Plus perk or free for everyone?** The code says free; the paywall says Plus.

---

### Numbers that must not be reused

- **079** — used on 2026-09-05 for a baseline-capture path written, reviewed and deleted in the same
  session. Nothing landed under it, but the note naming `IMP-079` is still in the log, so reusing the
  number would make that note read as though it described a different spec.
- **057** — reserved for the historical `dayKey` migration IMP-056 deferred. It cannot be written until a
  real device's numbers come back from the dev-panel Inspector's "Data health" reporter IMP-056 added.

### ✅ The branch rule is OVER — `main` is the lane now

Superseded 2026-09-08: `feat/design-push` fast-forwarded onto `main` and the owner pushed it (`cb3d60e`).
**Commit normally, push to `main`, and add a `Release-Lane:` trailer only when the owner asks to ship.**
CI (`release.yml`) then owns the test gate, the native-file backstop, the billing preflight and
`--environment production`. ⚠️ **Never run `eas update` by hand** — that is what the trailer is for.

### The rules the next spec inherits

**Every spec here is code-complete at green tests. None of them ends in a walk.** A build chat and a
runtime walk are **two different tasks for two different chats** — where a feature needs runtime proof,
the spec's last step names its `WALK-nn` row in [`walk-open.md`](walk-open.md). **Do not run a walk from a
build chat**, and do not read a missing walk as an unfinished spec. IMP-077 is the newest worked example:
it ended code-complete at 873 green tests, and **its green suite proves nothing about the motion** — the
Reanimated jest mock no-ops every hook. WALK-18 settles it.
