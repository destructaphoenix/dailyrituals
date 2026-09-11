# Design queue — the surfaces, and what each one still owes

> **What this file is.** A ranked audit of every user-facing screen, written 2026-09-11 after reading the
> source of all of them. It is the **design** queue, the third one alongside
> [`docs/specs-open.md`](specs-open.md) (build) and [`docs/walk-open.md`](walk-open.md) (runtime). It
> replaces the single line "the live request is Insights", which was true in 2026-09-05 and is now too
> small an answer.
>
> **How to use it.** Take ONE row, in order, and make it one Claude Design request. The four standing
> rules — baseline-first, specs in token names, the frozen sun/rays, design-is-not-enablement — are in
> [`docs/playbook.md`](playbook.md) → "Claude Design — standing rules" and are not repeated here.
> **Only `day-01…07`/`night-01…07` have baselines** (today, write, moods, reflections, insights,
> achievements, shop). Every row below says whether it has one or whether you paste source instead.
>
> **A returned design is not a change.** Porting one is a normal `IMP-xxx` build task scoped by Opus.
> Rows marked 🐛 found a real defect on the way and can be built without any design at all.

---

## ⚠️ Before you paste a row into Claude Design — read this

**A row of this file is not a request.** It is written for the repo: every piece of evidence in it is a
`../src/...` link that Claude Design cannot open. Pasting one verbatim hands it a case it cannot see.
Each request needs, in the message itself: **the ask**, **the screen's actual source**, **the token
names**, and **the constraints that are already pinned** (see each row).

### What the design system actually has

**Baselines are 7 screens × 2 modes, captured 2026-08-17** (`design-system/screens/`), and three facts
about them decide how much help they are:

1. **They are single-viewport captures, not full-page.** `day-05-insights.png` ends mid-grid in "Mar" —
   which makes it *excellent* evidence for D-01 — but **"Your patterns", "Weekly rhythm" and "Deeper" are
   all below the fold and appear in no asset anywhere.** D-03 and D-04 have no picture at all.
2. **The fixture is a 210-day perfect streak.** Every consistency cell is `done`; **`missed`, `frozen` and
   `empty` never appear in any baseline**, so the four states D-01 must carry through the transpose are
   invisible in the only picture of them. Paste
   [`heatCellStyle`](../src/screens/InsightsScreen.js#L217) with that request.
3. **They predate ~28 commits to `src/screens/`** — IMP-094 through IMP-119 among them. `day-07-shop.png`
   in particular is older than the candle cap (IMP-112), the kept label (IMP-115), the tier tags
   (IMP-104/108) and both ember-pill fixes (IMP-117/119).

### 🔴 The Plus card is wrong, and it is the one D-05/06/07 would lean on

`design-system/components/plus.html` states three things the app has since contradicted:

| The card says | The truth |
| --- | --- |
| *"`PLUS_ENABLED` is `false` and stays false"* | `true` since 2026-09-05. The rule is **hands-off, not off** — `playbook.md` was corrected, the card was not. |
| banner copy *"Keep every day you write / Deeper insights, unlimited restores, and every palette."* | IMP-090 replaced it with **"Every palette, sky & candle." / "Plus your graveyard kept forever."** |
| member card *"Member · renews soon"* | **IMP-082 forbade exactly that invented string.** The shipped banner says `Member · renews <real date>`, or just `Member` when the date is unknown. |

⚠️ **`node scripts/gen-design-system.js` does not fix this** — all three strings are hardcoded in
[`scripts/gen-design-system.js:663-690`](../scripts/gen-design-system.js#L663). The generator must be
edited first, then the cards regenerated and re-pushed. **Do that before any Tier-2 request.**

### Row-by-row: what exists, what you must paste

| Row | Baseline | Also paste | Note |
| --- | --- | --- | --- |
| D-01 Insights grid | `day/night-05` ✅ — shows the defect | `calendar.js:68`, `heatCellStyle`, `heatCells.js` | the 4 states are not in the shot |
| D-02 Reflections | `day/night-04` ✅ — shows "210 matches" + one card | `ArchiveScreen.js` | the shot is *with* a query active |
| D-03 period window | ❌ below the fold | `InsightsScreen.js` + `derive.js` | **no picture of these cards exists** |
| D-04 mood mix | ❌ below the fold | `InsightsScreen.js:134-149` | buildable without any design |
| D-05 one lock treatment | partial (`day-07` shows the swatch lock) | all four locked shapes' source | fix the Plus card first |
| D-06 paywall | ❌ none | `Paywall.js`, `PLUS_PERKS` | **start from your 5 hero cards already in the project** |
| D-07 member home | ❌ none | `PlusPerks.js`, `PlusBanner`, `ManageSubscription` | fix the Plus card first |
| D-08 member Shop | `day/night-07` ⚠️ stale | `Shop.js:41-46` | shot predates 4 shipped changes |
| D-09 ember `+` | in `day-07` chrome | `shopui.js:14` | IMP-119's fix is **unwalked** — do not redesign over it |
| D-10 You | ❌ none | `YouScreen.js` | no baseline will ever exist (7-shot cap) |
| D-11 zero states | ❌ none, uncapturable | the empty branch of each screen | |
| D-12 Home | `day/night-01` ✅ | — | notice cards are absent from the fixture |
| D-13 Keepsakes | `day/night-06` ✅ | `Achievements.js` | |
| D-14 WriteFlow | `day/night-02,03` ✅ | `WriteFlow.js:173-262` | the custom-mood form is below the fold |

**Not in the repo, but in the project:** the five Plus hero cards, the celebration screens and the updated
skies you designed there. They are the right starting point for D-06 — this file cannot see them, so check
their state yourself before asking for a redraw.

---

## The short answer

**Three things get worse the more the app is used** — that is the family your Insights complaint belongs
to, and it has three members, not one. **The Plus story is told by six surfaces that don't agree with each
other.** **Everything else is polish**, and the app is in good shape for it: the tokens, `Card`, `Row`,
`T` and the shadow scale are consistent everywhere, which is why the flaws below are all compositional
rather than cosmetic.

---

## Tier 1 — it degrades as the journal grows. Fix first.

These are not taste. Each one is measurably worse at 500 entries than at 5, and the app is built to be
kept for years.

### D-01 · Insights → "Consistency" draws every day since the first entry 🐛
**Baseline:** `day-05` / `night-05` ✅

**What happens.** [`buildLifetimeHeatmap`](../src/home/calendar.js#L68) emits **one row per calendar week
from your first entry to today, forever**, and [`LifetimeHeat`](../src/screens/InsightsScreen.js#L239)
renders every one of them inside the "Your record" card.

**The measurement.** On a 360dp phone at default font: content width 280dp, minus the 28dp month gutter
and a 4dp gap, leaves 248dp for seven cells and six gaps → **32dp per cell, 36dp per row**. A year is
~52 rows = **~1,870dp**, about **three screenfuls**. Two years is six. The hero number and the 2×2 totals
grid sit *above* it in the same card, so the more you write, the further the summary is pushed from
everything else.

**The tell that this is a design mistake, not a data one.** Reflections already has the bounded version of
the same component — [`ArchiveScreen`](../src/screens/ArchiveScreen.js#L48) titles its heat **"Last 5
weeks"**. Same family, one is framed and one is not.

**Ask Design for.** A consistency grid that is bounded by construction. The obvious shape is the
transpose: **7 weekday rows × N week columns, scrolling horizontally**, which puts a year in ~7 rows
(~250dp) instead of 52, plus a year/period switcher for what came before. Ask for the month labels to
move to the column axis, and for the `done / frozen / missed / empty` states and the legend to survive
the transpose — those four states are load-bearing and pinned by
[`heatCellStyle`](../src/screens/InsightsScreen.js#L217) (IMP-073 fixed real bugs in them; do not let a
design re-open borderWidth or the dashed outline).

### D-02 · Reflections → every entry ever, mounted at once 🐛
**Baseline:** `day-04` / `night-04` ✅

**What happens.** [`ArchiveScreen`](../src/screens/ArchiveScreen.js#L76) does `results.map(...)` inside a
plain `ScrollView`. No `FlatList`, no windowing, no pagination, no grouping. Every entry that matches the
filter becomes a mounted `Card`.

**The measurement.** The seeded `twoYears` journal WALK-08 used is **460 entries**. At ~110dp per card
that is **~50,000dp of scroll** and 460 live component trees, every one of them re-rendering when the
search text changes a character. This is the most extreme "lists everything" surface in the app — more so
than Insights, which is what you noticed first only because Insights is where you look.

**Ask Design for.** A browsing structure, not a longer list: **month sections with sticky headers**
("September 2026 · 22 kept"), a collapsed default beyond the current month, and a clear distinction
between *browsing* (no query) and *results* (a query is active — the count already exists in
`ArchiveFilters`). The per-entry card itself is good and does not need redrawing; what is missing is
everything above it. The `FlatList`/`SectionList` port is then an ordinary build task.

### D-03 · Insights answers only one question: "ever"
**Baseline:** `day-05` / `night-05` ✅

**What happens.** [`deriveInsights`](../src/insights/derive.js#L17) counts across **all** entries with no
window anywhere. Mood mix is lifetime. Weekly rhythm is lifetime. "Your record" is lifetime by name.

**Why it matters more than it sounds.** A screen whose every number is a running total **stops responding
to the user**. After a year, one week of feeling different moves no bar perceptibly; "Tuesdays win" is a
verdict about a person's 2025, not their month. The tab is called *Insights* and its promise —
*"The record you're building"* — quietly becomes a monument instead.

**Ask Design for.** One period control at the top of **"Your patterns"** — `30 days · This year · All
time` — with "Your record" staying lifetime on purpose (it is the monument, and that is correct). Ask for
the empty/thin-data state of each card *under a narrow window*, because a 30-day view on a young journal
is the common case and it is the state the current design has never had to show.

### D-04 · Insights → the 11th mood's bar is invisible 🐛
**Baseline:** `day-05` / `night-05` ✅ — **but this one is a defect, buildable without a design**

**What happens.** Mood mix renders **every distinct mood ever logged**, and shades each bar
`opacity: 1 - i * 0.1` ([`InsightsScreen.js:144`](../src/screens/InsightsScreen.js#L144)). At index 10 the
opacity is **0**; beyond it, negative. There are 8 built-in moods and **no cap on custom ones**
(`MoodManager` counts them, nothing limits them), so a user with three custom feelings in regular use
renders a bar that cannot be seen.

**This is exactly IMP-118's shape** — a bar that is present in the data and invisible on screen, sitting
beside a label that says it is the biggest thing on the card. The pairings list next door does not have
the bug: it `slice(0, 6)`s first ([`DeeperInsights.js:137`](../src/screens/DeeperInsights.js#L137)).

**Ask Design for.** A top-N with an honest remainder ("+4 more feelings"), and a shading rule that is
bounded by construction rather than by index — e.g. clamp at a floor, or key the opacity to the value
rather than the row number. **Scope the clamp as an IMP now regardless of the design** — it is a
two-character fix and the design can land later.

---

## Tier 2 — the Plus story. Six surfaces, no agreement.

The functionality is finished and proven on hardware. What is missing is that **being a member does not
look like anything.** Six places touch Plus and each invented its own language:

| Surface | What it is | The Plus language it uses |
| --- | --- | --- |
| [`Paywall.js`](../src/screens/Paywall.js) | the sell | `BigSun`, a pill, 5 check-rows, 2 plan cards |
| [`PlusBanner`](../src/shopui.js#L44) (You + Shop) | sell / status | gradient card → plain bordered card |
| [`PlusPerks.js`](../src/screens/PlusPerks.js) | "What's in Plus" sheet | `Sun` circle per line |
| [`ManageSubscription`](../src/screens/PlusFlow.js#L365) | membership admin | rows + danger button |
| [`DeeperInsights`](../src/screens/DeeperInsights.js#L26) locked card | upsell in place | full card + "Unlock with Plus" pill |
| You rows (Annual Recap, Save as PDF) | upsell in place | a small `Plus` chip on a `Row` |

### D-05 · Four different ways to say "this is Plus"
A tiny chip on a You row; a full card with its own CTA in Insights; a dark circle with a `Sun` over a
palette swatch ([`Shop.js:144`](../src/screens/Shop.js#L144)); and `OnThisDayCard`'s own locked shape.
**Ask Design for one lock treatment** in two sizes (inline row, and full card) and apply it everywhere.
This is the single highest-value Plus request because it touches five screens at once.

### D-06 · The paywall sells five equal checkmarks
[`PLUS_PERKS`](../src/data.js) renders as five identical `Check` rows — a feature list, not a promise, and
nothing on it shows the *thing itself*. Note this is already half-solved off-repo: **you designed five
Plus hero cards in Claude Design and they were never used** (they were Phase-10b pre-work when
`PLUS_ENABLED` was false — it has been `true` since 2026-09-05). **Start this request from those cards**
rather than from a blank page.
⚠️ Every line in `PLUS_PERKS` is currently honest — IMP-110 removed the streak-insurance claim and IMP-116
rewrote the "unlocked forever" line to "yours while you're a member". **A design may not re-promise
either.**

### D-07 · There is no member home
Once `plus` is true, "What's in Plus" is still a **sales sheet shown to someone who already bought**, and
the only member-specific surface is *Manage subscription* — which is about billing, not about the
membership. Nothing anywhere answers "what do I actually have?": candles held, palettes and skies in use,
recaps unlocked, renewal date, the +3-candle renewal perk.
**Ask Design for a "Your Plus" screen** that `PlusPerks` becomes when `plus` is true — same entry point,
inverted content: what is yours and in use, not what is for sale.

### D-08 · Under Plus, the Shop becomes a list of things that are free
IMP-108 made a member own every palette and sky — correctly — so [`palState`](../src/screens/Shop.js#L41)
returns `owned` for all of them and the whole screen loses its price signal at once. A member's Shop is
now a grid of tiles that all say the same thing. **Ask Design for the member state of the Shop**
specifically: what a shelf looks like when everything on it is included.

### D-09 · The `+` that cannot add anything
[`EmberPill`](../src/shopui.js#L14) always renders a filled `+` button. With `EMBER_PACKS_ENABLED` false
it opens nothing — it toasts *"Embers also gather on their own"*
([`RitualsApp.js:296`](../src/RitualsApp.js#L296)). That is an honest message behind a control that
promises an action it cannot perform, on the app's most-tapped pill.
**Either** hide the `+` while the flag is off (a one-line build task, no design needed) **or** ask Design
for a pill that reads as a balance rather than a button. ⚠️ The `+` glyph's centring is
[IMP-119](build-log.md) and is **owed a device walk** — do not let a redesign land on top of an unproven
fix.

---

## Tier 3 — polish. Real, but nothing breaks.

### D-10 · You → six sections, ~20 rows, one shape
**No baseline — paste [`YouScreen.js`](../src/screens/YouScreen.js).** Everything from "Daily reminder" to
"Reset all data" is the same `Row`: same 20dp accent icon, same chevron, same weight. Destructive,
informational, navigational and toggle rows are visually identical. Two of them are **dead**: *Save as PDF*
is `onPress={() => {}}` for a member and *About Daily Rituals* is `onPress={() => {}}` for everyone — both
are [IMP-022](build-log.md), deferred. **Ask for row *kinds*** (toggle / navigate / explain / destructive),
and decide the two dead rows' fate in the same pass.

### D-11 · The zero states have never been designed
**No baselines, and none can be captured** (`npm run shots` hard-fails past 7 — do not re-propose the
capture pipeline; it was scoped and deleted the same day on your call). Paste source. The Insights empty
state is the clearest case: it says the same thing twice —
*"...the shape of your days will appear here"* then *"...the whole shape of your record will appear
here"* ([`InsightsScreen.js:43-48`](../src/screens/InsightsScreen.js#L43)). A first-week user sees only
these states, and they are the least-designed screens in the app.

### D-12 · Home's lower half is a stack with no hierarchy
**Baseline:** `day-01` / `night-01` ✅. The streak hero is strong; below it sit up to six cards of equal
weight (freeze notice, on-this-day, recap, today's CTA, quests, week strip) plus the Keepsakes rail.
**Today's reflection — the reason the app exists — is the fourth card down** on a day with notices. Ask
for a priority rule, not a reshuffle.

### D-13 · Keepsakes are "tiered" in the comment only
**Baseline:** `day-06` / `night-06` ✅. [`Achievements.js`](../src/screens/Achievements.js) renders one
flat list with earned and unearned interleaved; the tiers named in its own header comment are invisible.
Also the app's own naming splits: the screen says **Keepsakes**, the file and the data say
**achievements**.

### D-14 · WriteFlow step 3 carries a whole form
**Baseline:** `day-02` / `night-02` ✅ (write), `day-03` / `night-03` ✅ (moods). "Name your own" is a
two-step emoji-picker-plus-text-field nested inside the mood step
([`WriteFlow.js:173-262`](../src/screens/WriteFlow.js#L173)) — a settings screen inside the daily ritual's
last beat. It works (IMP-066 numbered it), but it is the heaviest thing in the lightest flow.

---

## Not in scope — do not ask for these

- **`RayFan` and `NightRays` are frozen.** A design that redraws them cannot ship. `BigSun`/`BigMoon` may
  be replaced; `NightSky` and `DARK_THEME` were deleted and must not come back.
- **Nothing under `src/billing/`.** Design is not enablement — `EMBER_PACKS_ENABLED` stays `false` until
  you flip it, and no design may assume the packs are visible.
- **No new baseline-capture pipeline.** Settled 2026-09-05.
- **Keepsakes is deferred, not dropped** — it stays in the app and is Play screenshot 06.

## Suggested order

1. **D-01** (Insights consistency) — your original complaint, and the request already queued.
2. **D-02** (Reflections) — same disease, worse, and it has a baseline.
3. **D-05** (one lock treatment) — cheapest Plus win, touches five screens.
4. **D-03** (a period window for Insights) — bigger; do it after D-01 settles the grid.
5. **D-07** (a member home) + **D-06** (the paywall, from your existing hero cards).
6. Tier 3 as appetite allows.

**Buildable now without any design:** D-04's opacity clamp, D-09's `+`, and a decision on D-10's two dead
rows. Say the word and I will scope them as IMP rows.
