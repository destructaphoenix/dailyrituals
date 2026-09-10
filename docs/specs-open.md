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

## The queue — six rows, all opened by the owner on 2026-09-10

**Both came out of WALK-19 step 7, and neither is what the walk was looking for.** The owner went to check
IMP-104 and found something bigger: **the paywall sells a promise the shop does not keep.** Read
[`data.js:174`](../src/data.js#L174) — `PLUS_PERKS[0]` is *"Every palette & sky — unlocked forever"* — and
then [`Shop.js:38`](../src/screens/Shop.js#L38), which unlocks only `tier: 'plus'` items for a member.
Five ember-priced items stay locked behind a grind for someone who has already paid.

| Row | What | Severity |
| --- | --- | --- |
| [IMP-108](#imp-108) | **A paying member is still charged embers for five palettes and skies the paywall says they own.** | 🔴 **Live mis-sell on the paid surface** |
| [IMP-109](#imp-109) | The "you can't afford this" toast never mentions the price, the balance, or affording anything. | 🟠 **Confusing, owner-reported, three call sites** |
| [IMP-110](#imp-110) | `PLUS_PERKS[1]` sells streak insurance as a Plus perk; `applyAutoFreeze` is ungated and **every free user already has it**. | 🔴 **The second live mis-sell. Reword the line — the owner ruled the feature stays free** |
| [IMP-111](#imp-111) | The tab transition draws shadow outlines around the next screen's cards. **Day mode only.** | 🎨 **Owner chose deletion over a fix — remove `ScreenFade`** |
| [IMP-112](#imp-112) | Stored candles are unbounded, so the ember economy has no sink. **Owner set the cap at 3.** | 🟢 **Ready. ⚠️ A cap of 3 makes the 5-pack unsellable — it goes** |
| [IMP-113](#imp-113) | Ember packs display real prices and hand the goods over for free; `onBuy` is a bare counter increment. | 🚦 **BLOCKED on an owner prerequisite — 3 consumable products must exist in Play Console + RevenueCat first** |

---

## IMP-108

### Plus must unlock every palette and sky — the paywall has been promising it since Plus went live

**Lane: OTA.** Opened by the owner 2026-09-10 during WALK-19 step 7, on group `f961b427`.

**The finding as walked.** A Plus member with 15 embers tapped **Harvest Moon** (`tier: 300`) and was
refused. The owner's words: *"harvest moon is not free even for a subscriber."*

**It is a mis-sell, not a preference.** [`data.js:174`](../src/data.js#L174) opens with the comment
*"Every line here is a promise the paid surface makes"* — and the first promise is **"Every palette & sky
— unlocked forever"**. It is shown on the paywall and in the first three items of
[`Onboarding.js`](../src/screens/Onboarding.js). The shop disagrees
([`Shop.js:36-41`](../src/screens/Shop.js#L36)):

```js
const palState = (p) => p.id === activePalette ? 'active'
  : (p.tier === 'owned' || ownedPalettes.includes(p.id)) ? 'owned'
  : p.tier === 'plus' ? (plus ? 'owned' : 'plus') : 'buy';   // ← `plus` only ever reaches tier 'plus'
```

**The five items a paying member is still charged for:** Marigold (240), Honey (240), Rose Dusk (420),
Sage Eve (420) and Harvest Moon (300). ⚠️ **This is the same family of defect as IMP-084 and the
`PLUS_PERKS[1]` streak-insurance line — the paid surface and the code telling different stories — and it
has been live on every build since `PLUS_ENABLED` flipped on 2026-09-05.**

**Steps.**

1. In [`Shop.js`](../src/screens/Shop.js), make `plus` unlock **every** tier, not just `'plus'`:

```js
const palState = (p) => p.id === activePalette ? 'active'
  : (plus || p.tier === 'owned' || ownedPalettes.includes(p.id)) ? 'owned'
  : p.tier === 'plus' ? 'plus' : 'buy';
```

   Same shape for `skyState`. Note `'active'` still wins first, and with `plus` true the `'plus'` branch
   becomes unreachable — that is correct, a member owns those too.

2. 🔴 **Do NOT write unlocked items into `ownedPalettes` / `ownedSkies`.** Access must stay a **live read
   on `plus`**, so it follows the membership. Persisting it would hand a lapsed member five palettes
   permanently — the vc14 giveaway shape IMP-084 exists to prevent. `buyPalette`/`buySky` keep writing to
   those arrays; that is the *ember-purchase* record and it is rightly permanent.

3. No change to `buyPalette`/`buySky` in [`RitualsApp.js:278-294`](../src/RitualsApp.js#L278). They are
   only reachable from the `'buy'` state, which a member can no longer be in.

**⚠️ One accepted consequence — document it, do not "fix" it.** A member who applies Harvest Moon and
later lapses keeps it *applied*, because `s.id === activeSky` returns `'active'` before any ownership test
runs. **This is deliberate.** Forcibly changing someone's theme at the moment they lapse is punitive, reads
as a bug, and risks more than it protects — it is one cosmetic they were already looking at, not a paid
good. Leave a comment saying so, or the next reader will "correct" it. (They cannot re-apply it after
switching away, which is a little odd and still better than the alternative.)

**Not in scope.** The word *"forever"* in that perk line is loose for a subscription and the owner may want
it reworded. **Not this row** — this row makes the code keep the promise as written.

**Acceptance.** `npm test` green and ≥ the prior count, plus new tests: a member reads `'owned'` for a
numeric-tier item, a non-member still reads `'buy'`, a member's `ownedPalettes` is **not** mutated by
merely being a member, and a lapsed member reverts to `'buy'` for anything they never ember-bought. Then
WALK-19 step 7 re-run: a member taps Harvest Moon and it applies.

**Commit:** `fix(plus): a member owns every palette and sky, as the paywall promises (IMP-108)`

---

## IMP-109

### The "you can't afford it" message never says you can't afford it

**Lane: OTA.** Opened by the owner 2026-09-10, same sitting. Their words: *"That message is just hella
confusing."* They are right.

**The finding as walked.** With 15 embers, tapping Harvest Moon (300) produced **"Embers also gather on
their own — one for every day you keep."** Nothing about the price, the balance, or being short.

**Cause, confirmed in source.** [`RitualsApp.js:271-274`](../src/RitualsApp.js#L271) `openGetEmbers()`
serves two different intents with one string:

```js
const openGetEmbers = () => {
  if (EMBER_PACKS_ENABLED) setGetEmbersOpen(true);
  else showToast(EMBERS_ARE_FREE_COPY);
};
```

Called deliberately from the ember pill, that copy is a fine answer. Called from a **shortfall**, it
answers a question the user did not ask. **Three call sites hit it that way** — `buyPalette` (280),
`buySky` (289) and **`buyCandles` (295), which the owner did not reach but has the identical bug.**

**Steps.**

1. Add a shortfall message next to `EMBERS_ARE_FREE_COPY`, naming the item, the price and the balance:

```js
const shortfallCopy = (name, price) => `${name} costs ${price} embers — you have ${embers}`;
```

2. At all **three** sites, replace the bare `openGetEmbers()` on the shortfall branch with
   `showToast(shortfallCopy(...))`. For candles the name is the pack (`'3 candles'` / `pack.count`).
3. ⚠️ **Leave the ember-pill path alone.** `EMBERS_ARE_FREE_COPY` stays exactly as it is for a deliberate
   tap on "Gather Embers" — it is the right answer to that question and IMP-034 put it there on purpose.
4. ⚠️ **`EMBER_PACKS_ENABLED` stays `false`.** Do not touch it; see the parked section below.

**Acceptance.** `npm test` green and ≥ prior, +3 tests — one per call site — asserting the toast names the
price and the balance and is **not** `EMBERS_ARE_FREE_COPY`, plus one asserting the pill still shows the
free copy. Re-walk in WALK-19 step 7.

**Commit:** `fix(shop): say what it costs and what you have, not how embers accrue (IMP-109)`

---



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

### ✅ Embers for money — NO LONGER PARKED, it is [IMP-113](#imp-113)

Both gating questions were answered by the owner on 2026-09-10 (cash → embers → candles; auto-freeze stays
free) and the candle cap was set at 3, so the conversation became a spec. **The economics, the
streak-integrity argument and the three findings that shaped it are preserved in
[`docs/build-log.md`](build-log.md) → "The embers-for-money conversation".** ⚠️ **`EMBER_PACKS_ENABLED`
still must not be flipped** until IMP-113 is built and walked — see step 6 there.

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

---

## IMP-111

### Remove the tab-change fade — owner's decision, 2026-09-10

**Lane: OTA. This is a DELETION, not a fix.** Opened from WALK-18 on a Galaxy S24 Ultra, then re-scoped
the same night when the owner ruled: **"I choose b and c. Remove the fade. Then some time later when plus
is complete I can work on the motion."**

**The defect it removes.** Switching tabs drew shadow outlines around the next screen's cards, **day mode
only**. Cause, confirmed in source: [`ScreenFade`](../src/motion.js#L143) animates `opacity` over a subtree
whose [`Card`](../src/ui.js#L45)s carry Android `elevation: 8` — but only in day mode, because the style is
`t.dark ? null : t.shadow(…)`. Android elevation shadows do not composite under fractional parent opacity;
the subtree renders offscreen and each card's shadow is drawn against that layer. Dark mode has no
elevation, so it cannot occur there — which is exactly the owner's day-mode-only report.

**Why deletion rather than a compositing fix.** `ScreenFade` is the sole cause of the defect and delivers a
320ms fade the owner could not perceive on a flagship while actively looking for it. Fixing it would spend
effort defending motion nobody sees. **Removing it resolves the defect by subtraction and is smaller than
any fix.** Applying the motion vocabulary properly is deferred, not cancelled — see the parked section.

**Steps.**

1. In [`RitualsApp.js:885`](../src/RitualsApp.js#L885), replace the wrapper with a plain `View`, keeping
   both style values exactly:

```jsx
<View style={{ flex: 1, paddingTop: insets.top }}>{screen()}</View>
```

2. Delete the three-line comment above it (it describes motion that will no longer be there) and drop
   `ScreenFade` from the `./motion` import on [line 18](../src/RitualsApp.js#L18).
3. **Delete the `ScreenFade` export from [`motion.js`](../src/motion.js)** and its tests. It has no other
   consumer.
4. ⚠️ **Nothing else in `motion.js` changes.** `DUR`, `EASE`, `riseIn`, `popIn`, `fadeOut`, `stagger`,
   `useCountUp` and `usePressScale` all stay exactly as they are — they are the vocabulary the deferred
   motion work is written in.

**🔴 Three things a later chat will be tempted to do. Do none of them.**

- **Do NOT remove `react-native-reanimated` or `react-native-worklets`.** `usePressScale` still uses
  Reanimated and is live in [`ui.js`](../src/ui.js#L14). They are **native** deps: removing them needs a
  new build, not an OTA, and would close the OTA lane. They stay.
- **Do NOT delete `motion.js`** or the unused exports. The owner has explicitly deferred applying them,
  not abandoned them.
- **Do NOT "improve" this into a different transition.** No slide, no crossfade, no navigation library.
  The tab swap becomes instant, and that is the decision.

**⚠️ `tabKey` was never a remount key.** It is a `useEffect` dependency, not a React `key` prop, so
children were never remounted on a tab change. **Removing `ScreenFade` is therefore purely visual** — no
mount/unmount behaviour changes, and no screen loses or resets state. Verify this holds rather than
assuming it.

**Acceptance.** `npm test` green and **≥ the prior count minus only the deleted `ScreenFade` tests** — say
so explicitly in the session note, since this is the rare row where the count legitimately drops. Then
WALK-18 re-run in **day mode**: switching tabs shows no shadow outline around any card, because there is no
longer a transition to draw one during.

**Commit:** `fix(motion): remove the tab fade that outlined every card in day mode (IMP-111)`

---

### ⏸ Parked: apply the motion vocabulary — owner's (c), deferred 2026-09-10

**Owner: *"some time later when plus is complete I can work on the motion."* NOT A ROW YET. Do not open a
number for it and do not start it — Plus is not complete.**

**Why it exists.** IMP-077 bought a motion vocabulary and the app never spent it. **Six of eight exports
have no consumer**: `riseIn`, `popIn`, `fadeOut`, `stagger`, `useCountUp`, and (after IMP-111)
`ScreenFade` is gone too. Only `usePressScale` is live — a 0.99 press scale deliberately built to be
imperceptible. ⚠️ **That vocabulary was not free:** IMP-077 added `react-native-reanimated` and
`react-native-worklets` as **native** deps and forced the vc14 build. **This parked row is the only thing
that ever makes that cost worth paying.**

⚠️ **`stagger` is unused — do not be fooled by `Animated.stagger` in
[`Celebration.js:23`](../src/screens/Celebration.js#L23).** That is React Native's own `Animated` API, a
different function entirely. An audit on 2026-09-10 initially miscounted it as a consumer.

**Where to start when it unparks.** `riseIn` on cards and rows is the default entrance the module was
written around; `popIn` on rewards and badges is generalized from `Celebration.js`, which is the house
motion. ⚠️ **`art.js`, `Celebration.js` and `Toast.js` stay on the RN `Animated` API — coexistence is the
design, not a compromise. Do not port them** ([`motion.js:16`](../src/motion.js#L16)).

**The gate.** "Plus is complete" is the owner's phrase and the owner's call. At minimum that means the
open Plus rows (IMP-108, IMP-109, IMP-110) shipped and WALK-19 finished.

---

## IMP-112

### Cap stored candles at 3

**Lane: OTA. Pure logic.** Owner set the cap on 2026-09-10: **"candle cap is 3."**

**Why a cap exists at all.** `setFreezes` is unbounded today, so a user banks candles, buys once, and the
ember economy has no ongoing sink. A cap turns candles into a consumable you spend and re-buy — it is what
makes [IMP-113](#imp-113) worth building. It also bounds what money can buy: capped at 3, cash buys at most
three days of streak cover, never immunity.

### 🔴 Read this before touching code: a cap of 3 makes the 5-pack unsellable

`CANDLE_PACKS` ([`data.js:150`](../src/data.js#L150)) sells **1 / 3 / 5**. With a cap of 3 the **5-pack can
never be bought by anyone, in any state** — and the 3-pack only from exactly zero. **The cap and the pack
lineup are coupled, and the owner chose the cap without this in front of them.**

✅ **RATIFIED by the owner 2026-09-10, after being shown this consequence: the cap stays 3 and the `c5`
pack goes.** Shipping a "Best value" product that is always refused is worse than not shipping it. `c1`
(1 for 120) and `c3` (3 for 300) remain. ⚠️ **Do not re-add the 5-pack.** Restoring it would require the
cap to be 5, and the owner has now declined that twice.

**Steps.**

1. In [`data.js`](../src/data.js), export **`export const MAX_CANDLES = 3;`** beside `CANDLE_PACKS`, and
   **remove the `c5` entry**. Move `tag: 'Best value'` to `c3`.
2. New pure helper `src/home/candleCap.js`, tested in isolation the way
   [`freezeGrant.js`](../src/billing/freezeGrant.js) is:

```js
// How many of `wanted` actually fit, given `held`. Never negative.
export function roomFor(held, wanted, cap = MAX_CANDLES) {
  return Math.max(0, Math.min(wanted, cap - held));
}
```

3. **The Plus renewal grant** ([`RitualsApp.js:323`](../src/RitualsApp.js#L323)). Clamp it, and **make the
   toast tell the truth** — today it always says `+3` ([line 326](../src/RitualsApp.js#L326)):

```js
const got = roomFor(freezes, grant.freezes);
if (got > 0) {
  setFreezes((f) => f + got);
  showToast(`+${got} ${got === 1 ? 'candle' : 'candles'} — your Plus perk renewed`);
}
```

   ⚠️ **When `got` is 0, say nothing.** A renewal is a background event with nothing for the user to do,
   and a "you're full" toast on every renewal is noise. **Deliberate — do not add a message here.**

4. **`buyCandles`** ([`RitualsApp.js:295`](../src/RitualsApp.js#L295)). **Refuse a pack that does not fit
   entirely, and charge nothing.** Never take embers for candles that cannot be stored, and never
   part-fill a pack the user paid full price for. The refusal message must follow
   [IMP-109](#imp-109)'s lesson and say *why*:

```js
if (freezes + pack.count > MAX_CANDLES) {
  showToast(`You can hold ${MAX_CANDLES} candles — you have ${freezes}`);
  return;
}
```

   Order matters: **check the cap before the ember balance**, so a full user is told they are full rather
   than told they are poor.
5. **Show the cap in the Shop** ([`Shop.js`](../src/screens/Shop.js)), next to the candle count — e.g.
   `3 / 3`. Without it the refusal in step 4 is the next "hella confusing" message.
6. ⚠️ **Do not touch [`applyAutoFreeze`](../src/home/streakFreeze.js#L14).** It only ever spends downward.
   **The cap is an intake problem, not a spend problem.**

**Acceptance.** `npm test` green and ≥ prior. New `candleCap.test.js` covering `roomFor` at, below and
above the cap; a member at 3 receiving a renewal grant gains **nothing and sees no toast**; a member at 1
gains **2** and the toast says **"+2 candles"**, not "+3"; `buyCandles` at 2 refuses the 3-pack **and does
not decrement embers**; and a `data.js` assertion that no pack exceeds `MAX_CANDLES`, which is the guard
that stops the `c5` problem coming back.

**Commit:** `feat(shop): cap stored candles at 3, and stop lying about the renewal grant (IMP-112)`

---

## IMP-113

### Ember packs, bought with real money

**Lane: OTA for the code — corrected from the parked note, which said BUILD.** `react-native-purchases`
**10.5.0 is already installed** and carries everything needed, so no native change and no `bump:native`.
⚠️ **But there is an owner prerequisite that no spec can do — see below.** Opened 2026-09-10 once the owner
answered both gating questions and set the candle cap.

### ✅ OWNER PREREQUISITE — DONE 2026-09-10. This row is UNBLOCKED

**The owner confirmed all four hand-back items on 2026-09-10:** the three products exist and are **Active**
in Play Console, all three are typed **Consumable** in RevenueCat, and **none is attached to any
entitlement.** Imported rather than hand-entered, so the identifiers cannot disagree with Play.

🚦 **THE IDENTIFIERS, AS REVENUECAT REPORTS THEM — use these verbatim:**

```js
['embers_240', 'embers_680', 'embers_1500']
```

✅ **Question resolved: there is NO `:standard` suffix.** RevenueCat presents these one-time products by
their bare product id, unlike the `productId:basePlanId` form it uses for subscriptions. **Do not append
the purchase-option id.** This was an open unknown until the owner read it off the dashboard; it is now
settled and must not be re-guessed.

**The mapping the grant ledger needs:**

| RevenueCat / Play id | Embers | Pack |
| --- | --- | --- |
| `embers_240` | 240 | `e1` |
| `embers_680` | 680 | `e2` — *Popular* |
| `embers_1500` | 1500 | `e3` — *Best value* |

_The setup record below is kept for the day these ever need recreating — it is done, not owed._

#### Part 1 — Play Console: create three one-time products

Play Console → **Daily Rituals** → **Monetize** → **Products** → **In-app products** → *Create product*.
(Menu names drift between Play Console redesigns; the thing you want is one-time in-app products, **not**
Subscriptions.) Make three:

| Product ID — type these EXACTLY | Embers | Price | Name (Play field, ≤55 chars) |
| --- | --- | --- | --- |
| `embers_240` | 240 | $1.99 | `Kindling — 240 Embers` |
| `embers_680` | 680 | $4.99 | `Firelight — 680 Embers` |
| `embers_1500` | 1500 | $9.99 | `Hearthfire — 1500 Embers` |

**Descriptions (Play field, ≤200 chars).** Same shape for all three, only the number changes:

> `240 embers to spend in the Shop on palettes, skies and streak candles. Embers also gather on their own — fifteen for every day you keep.`

⚠️ **The second sentence is deliberate and should stay.** It tells a buyer they do not have to pay, which
is both true and the tone this app takes about money. It also matches the app's own line in
[`tips.js:21`](../src/content/tips.js#L21) and the Shop's `EMBERS_ARE_FREE_COPY`.

⚠️ **Do not call a pack a "handful".** [`tips.js:21`](../src/content/tips.js#L21) already uses *handful*
to mean **one day's earnings (15 embers)**. Reusing it for a 240-pack would contradict copy that ships
today. `EMBER_GAIN` is `15` ([`data.js:126`](../src/data.js#L126)) — verified, not remembered.

🔴 **A product ID is permanent. Google will not let you rename or reuse it, ever — not even after
deleting the product.** Type them carefully; a typo is forever.

**Each product needs one purchase option.** Play's newer one-time-product model nests
**product → purchase option → offer**, the way subscriptions nest base plans. For each of the three:

| Field | Value |
| --- | --- |
| Purchase option ID | `standard` — the same for all three; it only has to be unique *within* its product |
| Type | **Buy**, not Rent |
| Multi-quantity | 🔴 **OFF** — see below |

🔴 **Multi-quantity MUST be off, and this is not a preference.** `PurchasesStoreTransaction` carries
`transactionIdentifier`, `productIdentifier`, `purchaseDate`, `purchaseToken`, `originalJson` and
`signature` — **and no quantity field** (verified in `node_modules` 2026-09-10). The grant ledger keys on
the transaction, so a user who buys **3 × `embers_240` in one transaction would be granted 240 embers, not
720**, and would be short-changed 480 they paid for. The quantity does exist inside `originalJson`, but
parsing raw store JSON is fragile and deliberately not in this spec. **Turn it off and the ledger is
correct as written.**

🚦 **The identifier the CODE needs comes from RevenueCat, not from Play.** With purchase options in play,
RevenueCat may present a one-time product as `embers_240` **or** as `embers_240:standard` — the same way it
uses `productId:basePlanId` for subscriptions. **Do not assume.** After Part 2, read the identifier off the
RevenueCat product row and paste *that exact string* back; it is what goes into `getProducts([...])` in
step 1. Guessing this wrong produces an empty product list and a Shop that silently shows nothing.

**Set each one Active.** Prices are your call — the app reads the real price from the store
(`priceString`), so whatever you set is what users see, correctly converted per country. The
`$1.99`/`$4.99`/`$9.99` literals in `data.js` stop being used at step 4 of this spec.

⚠️ **Do not look for a "consumable" checkbox.** Play has no such setting on the product — whether a
one-time product can be re-bought is decided by the app consuming it, which RevenueCat handles. This is
the right kind of product; there is nothing extra to tick.

#### Part 2 — RevenueCat: register the same three products

RevenueCat dashboard → your project → **Products**.

✅ **Use "Import products" rather than adding them by hand.** The single biggest risk in Part 1 is a
mistyped identifier, and importing pulls the IDs straight from Play so they cannot disagree. It also
**answers the open question above for free**: whatever the imported rows are called *is* the string
`getProducts()` needs, `:standard` suffix or not. Importing existing subscription products alongside them
is harmless — **do not delete anything it brings in.**

🔴 **Set the product type to CONSUMABLE. Not non-consumable.** RevenueCat offers subscription /
consumable / non-consumable, and this is the one setting on the page that cannot be shrugged off:

- **Consumable** = can be bought again and again. Correct for embers, which are spent and re-bought.
- **Non-consumable** = bought once, owned forever (a permanent unlock). **Pick this and every user could
  buy each pack exactly once, ever** — the store would refuse their second purchase.

⚠️ **Import will not necessarily infer the type.** After importing, open each of the three and confirm it
says **Consumable**.

🔴 **Do NOT attach them to an entitlement — not `Daily Rituals Plus`, not anything.** An entitlement is how
the app decides someone has Plus. Attach an ember pack to one and **buying embers would grant Plus.**
Ember packs grant embers through the app's own ledger (step 2 of this spec) and must own no entitlement at
all.

**Why RevenueCat must know about them:** the grant ledger reads `customerInfo.nonSubscriptionTransactions`
from the RevenueCat customer record. Products RevenueCat has never heard of will not reliably appear
there, and the ledger is what stops a double-grant.

⚠️ **No Offering is needed.** This spec fetches by ID with `getProducts(...)`, not through an Offering, so
there is nothing to configure on that screen.

#### Part 3 — hand back three things

1. **The three identifiers AS REVENUECAT SHOWS THEM** — not as Play shows them. They may carry the
   `:standard` purchase-option suffix. Paste, do not retype.
2. **Confirmation they are Active** in Play Console.
3. **Confirmation all three are typed CONSUMABLE** in RevenueCat.
4. **Confirmation none of them is attached to an entitlement.**

Then the IDs get written into step 1 below and this row unblocks.

⚠️ **Testing is already set up.** The Google account used for WALK-19 is a **license tester**, so these
purchases will be test purchases too — no real money. Two things carry over from that sitting: test
purchases **never appear in Play Console Order Management**, so do not go looking; and a new product can
take a little while to propagate after you activate it, so a "product not found" on the first try is
usually patience, not a bug.

### The SDK shape — verified against `node_modules` on 2026-09-10, not assumed

**Read this rather than re-deriving it.** IMP-085, IMP-099 and IMP-100 were all written against an
imagined SDK and all three were wrong.

| Need | Real API |
| --- | --- |
| Fetch consumables | `Purchases.getProducts(ids: string[], PRODUCT_CATEGORY.NON_SUBSCRIPTION)` → `PurchasesStoreProduct[]` |
| Buy one | `Purchases.purchaseStoreProduct(product)` → `MakePurchaseResult` |
| Localised price | `product.priceString` — *"Formatted price of the item, including its currency sign"* |
| What was bought | `customerInfo.nonSubscriptionTransactions: PurchasesStoreTransaction[]` |
| Ledger key | `transaction.transactionIdentifier` (also `productIdentifier`, `purchaseDate`) |

### 🔴 The hard part: consumables are not restorable the way a subscription is

A subscription has one live truth the store can be asked for at any time — which is why
[WALK-19a](walk-open.md) passed. **A consumable has no such state.** `nonSubscriptionTransactions` is a
*history*, not a balance: it lists every ember pack ever bought, forever. Grant naively from it and a
reinstall re-grants everything; ignore it and a purchase interrupted mid-flight is lost money.

**The design: a local ledger of applied transaction ids.**

1. Persist `appliedEmberTx: string[]` — add it to `PERSISTED_KEYS` and both persisted-slice literals in
   `RitualsApp.js`, exactly as IMP-102 did for `lastFreezeGrantPeriod`. **No schema bump.**
2. On every `customerInfo` the app already receives, grant embers for each transaction whose
   `transactionIdentifier` is **not** in `appliedEmberTx`, then record it. Pure function, tested in
   isolation: `pendingEmberGrants(transactions, applied, packsById)`.
3. This makes the grant **idempotent** and self-healing: a purchase that completes while the app is being
   killed is granted on the next launch, because the transaction is in the history and not in the ledger.

**⚠️ THE decision on this row, and it is the owner's to reverse.** On a reinstall the local ledger is empty,
so **every past ember purchase re-grants.** A user who bought, spent, and reinstalled gets those embers
again. **Accepted deliberately**, because: the app is offline-first with no server to hold a real ledger;
the exploit needs a full uninstall/reinstall cycle per repeat, which is heavy friction for cosmetic
currency in a journal; and losing embers an honest user paid for is worse than a determined cheat getting a
free palette. It is also consistent with how this app already treats the store — generous on restore
(IMP-043, IMP-092). **Flagged here so it is a choice, not an accident.**

**Steps.**

1. Add `productId` to each entry of `EMBER_PACKS` ([`data.js:157`](../src/data.js#L157)) using the table
   above, so one place maps a store product to an ember amount. Then extend
   [`revenueCatService.js`](../src/billing/revenueCatService.js) with `getEmberProducts()` — which calls
   `Purchases.getProducts(['embers_240','embers_680','embers_1500'], PRODUCT_CATEGORY.NON_SUBSCRIPTION)` —
   and `buyEmberPack(product)`. **Mirror the existing `buy()`/`getPrices()` error
   handling — reuse [`mapError.js`](../src/billing/mapError.js), do not invent a second mapper.**
2. Add the same methods to the **sim service**, or every test silently exercises a shape that does not
   exist. ⚠️ **`npm test` runs `simService` — a green suite is not evidence about billing.**
3. New pure `src/billing/emberGrants.js` holding `pendingEmberGrants(...)`. No React, no persistence.
4. **Replace the `$1.99` / `$4.99` / `$9.99` literals** in `EMBER_PACKS` ([`data.js:157`](../src/data.js#L157))
   with `priceString` from the store, the way IMP-090 made the trial copy honest. ⚠️ **Especially on INR** —
   a hardcoded dollar sign is wrong for most of the world.
5. Wire `onBuy` — [`RitualsApp.js:985`](../src/RitualsApp.js#L985) is currently
   `onBuy={(pack) => setEmbers((e) => e + pack.amount)}`, **a bare counter increment that hands over the
   goods for free.**
6. 🔴 **Flip `EMBER_PACKS_ENABLED` LAST**, only once 1–5 are done and walked. It is the only thing standing
   between today's tree and a store that shows dollar prices and gives the goods away — the vc14 shape
   IMP-084 exists to prevent.

**Acceptance.** `npm test` green and ≥ prior, with `emberGrants.test.js` covering: a new transaction grants
once; the same transaction seen twice grants **once**; an empty ledger re-grants history (the accepted
behaviour above, asserted so it is deliberate); and an unknown `productIdentifier` grants **nothing**
rather than `NaN`. ⚠️ **None of that is evidence the purchase works** — this row owes a new `WALK-20` on
hardware with a license tester, and the cap interaction from [IMP-112](#imp-112) must be walked with it.
