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

## 🔭 READ FIRST — most of Tier 1 and Tier 2 is ALREADY DESIGNED

**Corrected 2026-09-11, after reading the live Claude Design project** (`7bf44d09…`) rather than the
repo's copy of it. The project holds **26 cards, not the 13 this repo generates.** Thirteen of them exist
only there, and several answer queue rows that the rest of this file still describes as open work.

| In the project | Queue rows it already answers |
| --- | --- |
| **`screens/insights-redesign.html`** — "Two directions, day + night" | **D-01 and D-03.** It explicitly retires the lifetime heatmap ("*Reflections keeps it as a navigation device*") for month-by-month calendars using `c.heat0–heat3`, **and** adds time scoping (`This year · 2025 · All time`). Direction **A** opens on a shareable keepsake poster; **B** is a typographic almanac with no card chrome. It also proposes milestones, themes and per-rite completion. |
| **`screens/plus-home.html`** — 9 directions, day + night, with motion notes | **D-05**, much of **D-07**, and it reshapes **D-12**. Three problems × three directions: member identity at the hero, the locked teaser (redacted peek / dark invitation / one-offer-two-rows), and the unlocked perk. Every direction is already specced in token names. |
| **`screens/shop-plus-skins.html`** | **D-08** — the unlock tag, five Plus palettes, six sky previews. |
| **`screens/celebration.html`**, **`screens/home-plus-skies.html`** | Not queue rows — new surfaces. |
| **`art/`** — 7 animated Plus heroes (Aurora, Tideline, Meteorfall, Sakura Fuji, Fernlight, Local Line, Event Horizon) with `.mp4` assets | **Not a queue row and not a small port.** The app's `SkyPreview` draws static gradients; these are live video heroes. Treat as a product decision with native weight (playback, asset size, battery), not a design task. |
| **`art/brand/`** | The shipped brand/Play assets. |

**So the bottleneck is not design — it is porting.** The rows below still describe the *defects* accurately,
and the invariants each one lists are still what a port must honour. **What changes is the ask:** for D-01,
D-03, D-05, D-07 and D-08 the next step is **"choose a direction and scope an `IMP`"**, not "write a
request". Only the rows with no card in the project (**D-02 Reflections, D-04 mood mix, D-10 You,
D-11 zero states, D-13 Keepsakes, D-14 WriteFlow**) are genuinely un-designed.

⚠️ **Direction A vs B on Insights is the owner's call and nobody else's** — they are different products
(a shareable artefact vs. a reading surface), not two drafts of one.

---

## ⚠️ Before you paste a row into Claude Design — read this

**A row of this file is not a request.** It is written for the repo: every piece of evidence in it is a
`../src/...` link that Claude Design cannot open. Pasting one verbatim hands it a case it cannot see.
Each request needs, in the message itself: **the ask**, **the screen's actual source**, **the token
names**, and **the constraints that are already pinned** (see each row).

📋 **Ready-to-paste packets live in [`docs/design-requests/`](design-requests/)** — one file per row,
select-all-and-send, with the source blocks pulled from the real files so they cannot drift.
**[D-01 is written](design-requests/D-01-insights-consistency.md).** Ask and I will write the next one;
they are generated from source, so a row whose code has moved should be regenerated rather than edited.

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

### ✅ The Plus card was wrong — fixed 2026-09-11, but it still has to be re-pushed

`design-system/components/plus.html` had carried **four** stale claims. All four are corrected in
[`scripts/gen-design-system.js`](../scripts/gen-design-system.js) and the card is regenerated:

| The card said | The truth it now states |
| --- | --- |
| *"`PLUS_ENABLED` is `false` and stays false"* | `true` since 2026-09-05 — the rule is **hands-off, not off**, and the card says so. |
| banner copy *"Keep every day you write / Deeper insights, unlimited restores, and every palette."* | IMP-090's shipped copy: **"Every palette, sky & candle." / "Plus your graveyard kept forever."** + the "See Plus ›" CTA. |
| member card *"Member · renews soon"* | `Member · renews <real date>`, with IMP-082's rule stated: **never invent one**; an unknown date means the row says only `Member`. |
| three price tags the app does not render (`🔒 Plus`, `✓ Owned`, `◆ 420` alone) | **all four real `PalTag` states**, including `Applied` — a bare label with **no pill**, which the card had omitted entirely and which is exactly what D-05 is about. |

🔒 **It cannot rot again.** [`__tests__/scripts/genDesignSystem.test.js`](../__tests__/scripts/genDesignSystem.test.js)
asserts every string on the card is still present in `src/shopui.js`, and that the four retired claims stay
retired. All five checks were verified red against the previous generator before the fix landed.

✅ **Pushed to the live project 2026-09-11** via `DesignSync` after the owner ran `/design-login` —
`components/plus.html` plus both `screens/baseline-*.html` (the caption fixes). The project now shows the
corrected card; nothing else in it was touched.

### Row-by-row: what exists, what you must paste

| Row | Baseline | Also paste | Note |
| --- | --- | --- | --- |
| D-01 Insights grid | `day/night-05` ✅ — shows the defect | `calendar.js:68`, `heatCellStyle`, `heatCells.js` | the 4 states are not in the shot |
| D-02 Reflections | `day/night-04` ✅ — shows "210 matches" + one card | `ArchiveScreen.js` | the shot is *with* a query active |
| D-03 period window | ❌ below the fold | `InsightsScreen.js` + `derive.js` | **no picture of these cards exists** |
| D-04 mood mix | ❌ below the fold | `InsightsScreen.js:134-149` | buildable without any design |
| D-05 one lock treatment | partial (`day-07` shows the swatch lock) | all four locked shapes' source | re-push the Plus card first |
| D-06 paywall | ❌ none | `Paywall.js`, `PLUS_PERKS` | **start from your 5 hero cards already in the project** |
| D-07 member home | ❌ none | `PlusPerks.js`, `PlusBanner`, `ManageSubscription` | re-push the Plus card first |
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

## 🌌 Plus skies — what to generate, and when a sky needs two clips

> **Delivery is settled** — `.mp4`/H.264, 720p, 6–10s, downloaded per sky, `expo-video` + `expo-file-system`.
> Locked in [`playbook.md`](playbook.md) → "Plus skies". **This section is the art direction only.**

### The frame — measured from the hero box, not guessed

The hero art is full-bleed in the streak card: **the card's full width × 336dp tall** (the design cards'
own figure). Width is fluid and height is fixed, so **the box changes aspect with the device**:

| Device | Card | Box in px | Box aspect |
| --- | --- | --- | --- |
| small phone (320dp @2×) | 280dp | 560 × 672 | 0.83 |
| common 1080p (360dp @3×) | 320dp | 960 × 1008 | 0.95 |
| Pixel-class (411dp @2.625×) | 371dp | 974 × 882 | 1.10 |
| large phone (432dp @3×) | 392dp | 1176 × 1008 | 1.17 |
| 1440p flagship (411dp @3.5×) | 371dp | **1298 × 1176** | 1.10 |

**So the box is near-square — 0.83 to 1.17 — and the worst case to cover without upscaling is 1298×1176.**

**Generate square.** Under `cover`, how much of the source survives the crop:

| Source | Narrow box | Wide box |
| --- | --- | --- |
| **1:1** | **83%** | **86%** |
| 4:3 | 63% | 88% |
| 9:16 portrait | 68% | 48% |
| 16:9 landscape | 47% | 66% |

A 16:9 clip throws away half the frame you paid to generate, and every byte of it still ships.

> ### The numbers
>
> **1280 × 1280, 1:1 · 6–10s · 30fps · H.264 High · ~2.5–3 Mbps · no audio → ~2.5–3.5MB**
>
> 1440×1440 if the generator offers it and the file stays under ~4MB. **1080×1080 is the floor** — it
> upscales ~1.09× on a 1440p flagship, which is invisible on footage under a scrim.

**Two safe zones, both binding:**

- **Crop margin.** Up to 17% of width (narrow devices) or 14% of height (wide ones) is cropped away.
  Keep anything essential inside a **centred 83% × 86%** region — nothing that matters in the outer ~8%.
- **The numeral's quiet centre.** The streak number sits mid-frame and the bottom **~28%** (96 of 336dp)
  sits under a scrim. Keep the central region low-contrast and low-detail; put the motion in the top
  third, the edges, or out of focus.

**The encode**, once a clip is chosen:

```sh
ffmpeg -i in.mp4 \
  -vf "scale=1280:1280:force_original_aspect_ratio=increase,crop=1280:1280,fps=30" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 21 -maxrate 3M -bufsize 6M \
  -g 60 -keyint_min 60 -sc_threshold 0 \
  -an -movflags +faststart out.mp4
```

`-an` drops the audio track — nothing here has sound, and a silent track still costs bytes and can trip
autoplay policies. `+faststart` moves the index to the front, which matters because these are downloaded.
`-g 60` with `-sc_threshold 0` gives a keyframe every 2s, so the half-offset crossfade loop can seek
cleanly. **Use `crop`, not `pad`** — the black bars `pad` adds would be baked into the file.

⚠️ **Crop position is per sky.** The design cards already chose the focal band for each existing clip
(`50% 68%` Aurora, `50% 46%` Fernlight, `50% 38%` Sakura Fuji, `50% 50%` Tideline). Bake that into the
`crop` above with an explicit offset rather than centring blindly.

### The loop rule

A clip loops seamlessly when its motion is **statistically stationary** (any frame could be any other —
drifting motes, shimmer, particle fields) or **cyclic by construction** (one full rotation, one full
swing). It cannot loop when the motion **accumulates** (snow piling up in frame), **traverses** (something
crosses and leaves), or has a **beginning, middle and end** (a wave breaking, a firework).

**So do not generate:** anything moving through frame (this is why `Local Line` cannot be saved as a
loop), waves that break, petals that land, snow that settles, fireworks — and **sunrise or sunset**, which
is progressive by definition. That last one stings, given the palette is called Golden Hour, but the light
changing and never returning is exactly what a loop cannot do.

**Second criterion, equally binding: keep the centre quiet.** The streak numeral sits in the middle of the
hero. Put the motion at the edges, the top, or in the depth of field. A busy, high-contrast centre makes
the number unreadable no matter how good the scrim is.

### Does a sky need two clips? It depends on the subject, not on policy

**The hard requirement:** every purchasable sky must render correctly in **both** app modes. A daylit clip
behind a night UI is broken, and falling back to the default sky punishes someone who paid.

**That is not the same as needing two files:**

- **Lit by the sun → two clips.** Its whole look depends on daylight, so the night version is a different
  shoot, not a filter. Beaches, blossom, meadows, forest floors.
- **Makes its own light → one clip.** Fire, stars, aurora, fireflies, caustics, a black hole. These read
  correctly in both modes because the scrim and the numeral adapt around them, not the art.
  `Event Horizon` already works this way.

⚠️ **Do not grade one clip into the other.** On footage, a tint-and-exposure pass reads as a filter, not
as a time of day. Two shoots or one clip — not one clip pretending.

💡 **A one-clip sky is half the bytes and half the generation work.** Build those first.

### Candidates that loop by nature

**One clip, both modes:**

| Sky | Why it loops | Why it belongs here |
| --- | --- | --- |
| **Emberfall** — sparks rising from a fire below frame | particles, stationary | the app's currency is **Embers**; nothing else ties the art to the economy this directly |
| **Candle** — a single flame in the dark | flicker is stationary | a candle **is** the streak-freeze metaphor — `Shop.js` already sells them |
| **Starfield** — slow rotation | one revolution is an exact loop | the quietest possible hero; the numeral sits in empty sky |
| **Fireflies** — blinking points over dark grass | random blinking, stationary | |
| **Caustics** — refracted water-light on a dark floor | endless shimmer | mesmerising at hero scale, tiny to encode |
| **Lighthouse** — one sweep of the beam | one revolution = one loop | gives a slow, breathing pulse rather than constant motion |

**Two clips, day and night:**

| Sky | Why it loops | Note |
| --- | --- | --- |
| **Dust in a sunbeam** (night: the same room, lamplit) | motes drift, nothing accumulates | Golden Hour made literal — the closest of all of these to the app's own palette |
| **Rain on glass** | droplets run continuously | the most "end of the day" image in the list |
| **Snowfall** — framed **above** the ground | stationary only if nothing settles in frame | crop matters more here than anywhere else |
| **Fog over hills** | drifts, never clears | |
| **Grass or wheat in wind** | sway is cyclic | |

### The existing six, re-read against this rule

| Existing | Verdict |
| --- | --- |
| `Event Horizon` | ✅ already one clip, both modes — the model for the rest |
| `Aurora` | **should probably be one clip, not two.** An aurora is not a daylight phenomenon; the day variant is the weaker idea and it costs a file, a generation and a download |
| `Fernlight`, `Sakura Fuji`, `Tideline` | daylight-defined → keep both modes |
| `Meteorfall` | drawn, so it is the odd one out of a set that must match. **Regenerate as footage** — a meteor shower is stationary and loops well |
| `Local Line` | ⛔ **cannot loop** — the train traverses. Either drop it, or reshoot as a held shot where the *light* moves and the train does not |

### The 36-idea sweep — 2026-09-12

A list of 36 subjects was put up for the hero. All 36 are judged below. Three filters do the work, and
only the first one is new:

1. **The loop rule** (above) — stationary or cyclic.
2. **The quiet centre** (above) — the streak numeral owns the middle.
3. 🆕 **Field, not object.** Every one of the existing six is a *field*: weather, light, particles,
   distance. A field has no silhouette, so it crops to 720×1280 at any framing and sits *behind* the
   numeral as ground. A single recognisable object — a watch, a record, a pendulum, a cup — puts a second
   subject in the frame, competes with the numeral for the eye, and does not survive a portrait crop.
   It is also the same argument the delivery decision already made: the set must look like one set.

⚠️ **A visible mechanism shows the seam.** Gears, a second hand, a pendulum and an orrery all carry their
own clock. Loop an 8s clip of one and the viewer sees the hand jump backwards — a seam that a particle
field never has. An orrery is worse: a true loop needs every orbit to share a period, which real orbits
do not. Cyclic on paper is not the same as loopable.

**Build these first — one clip, self-lit, quiet centre, and each one earns its place:**

| Sky | Verdict |
| --- | --- |
| **Emberfall** | ✅ **the strongest idea in the list.** Motion enters from the bottom edge and dies before the middle, so the centre is quiet by construction — and it is the only subject that names the app's own currency |
| **Fireflies** | ✅ "sparse points near the edges" *is* the quiet-centre rule, already obeyed |
| **Star Rotation** | ✅ exact cyclic loop, emptiest possible centre. Same family as the existing `Meteorfall` regen — ship one or the other first, not both |
| **Candlelight** | ✅ off-centre flame, stationary flicker, and the candle is already merchandise in `Shop.js` |
| **City Window at Night** | ✅ **this is the fix for `Local Line`.** "Bokeh shimmer, no cars traversing the frame" is exactly the held shot where the light moves and the vehicle does not |
| **Snow Globe** | ✅ suspended particles that never settle — it solves the accumulation problem that makes plain snowfall a two-clip, crop-sensitive risk |
| **Japanese Lanterns** | ✅ self-lit, sways in place, and visually unlike anything in the set |
| **Moonlit Clouds** | ✅ drift around a fixed point; night-defined, so one clip, on the `Aurora` precedent. Keep the moon out of the middle third |
| **Lighthouse** | ✅ already a candidate. One caveat: the beam must sweep the **upper** frame, or it strobes across the numeral once a cycle |
| **Crystal Refractions** | ✅ "highlights shifting around the borders" obeys the centre rule by construction. Weakest *idea* of the ten — it risks reading as a screensaver rather than a place |

**Two clips, and worth the second file:**

| Sky | Verdict |
| --- | --- |
| **Dust in Sunlight** | ✅ already the pick of the two-clip set — Golden Hour made literal |
| **Rain on Glass** | ✅ "centre kept clear" was specified unprompted; it is the most end-of-day image available |
| **Golden Wheat** | ✅ "oscillating rather than sweeping" is the right instinct — close-up stalks, no camera move |
| **Underwater Sun Rays** | 🟡 loops fine, but daylight-defined, so it costs two shoots to land in a crowded water family (below). Build it only if none of the one-clip water ideas is chosen |

**Already owned — do not generate:**

| Idea | Because |
| --- | --- |
| **Northern Lights** | this is `Aurora`. It does confirm the verdict above: one clip, night only |
| **Black Hole Accretion Disk** | this is `Event Horizon`, which is already the model for the set |
| **Fireplace Glow** | the same image as Emberfall with the fire in frame. Pick Emberfall — the currency tie is free |
| **Aquarium Light** / **Pool Caustics** / **Bioluminescent Water** / **Deep-Sea Glow** | four framings of `Caustics` and `Fireflies`. **Generate one** — a dark floor under low-contrast shimmer — and drop the other three; a shop of near-identical water tiles makes all of them look cheap |
| **Library Lamp** | the night half of **Dust in Sunlight**. Use it as that clip, not as its own sky |

**Rejected — and the reason is the rule, not taste:**

| Idea | Fails on |
| --- | --- |
| **Record Player**, **Mechanical Watch**, **Clock Pendulum**, **Orrery**, **Kinetic Sculpture** | *field, not object* — and all five show the seam ⚠️. The three timepieces also put a clock in a habit app, which reads as a deadline, not a ritual |
| **Coffee Steam**, **Velvet Curtains**, **Floating Silk**, **Wind Chimes** | *field, not object*. Silk and curtains also move through the middle of the frame; wind-chime sway is aperiodic, so it never closes a loop |
| **Ceiling Fan Shadows** | the shadow sweeps the centre once per revolution, straight across the numeral — and being sun-cast it costs two clips to do it |
| **Marble Fountain Ripples** | the ripples originate dead centre and expand outward through the numeral. The one subject here whose motion is *aimed* at the quiet zone |
| **Neon Sign Flicker** | a sign carries **text**. A second set of glyphs behind the streak numeral, in one language, on a screen that is mostly a number |
| **Incense Smoke** | salvageable, not rejected — the column is the problem, not the smoke. Only viable framed hard to one side, and even then the rising column reads as traversal at the top of frame |
| **Planet Rotation** | loops perfectly, but the disc fills the centre and it sits one step from `Event Horizon`. Park it until the set is larger |

**What the sweep changes:** nothing in the delivery decision, and nothing in the existing six beyond
confirming `Aurora` → one clip and handing `Local Line` a replacement it can actually be
(**City Window at Night**). It adds five new one-clip candidates — City Window, Snow Globe, Japanese
Lanterns, Moonlit Clouds, Crystal Refractions — to the six already listed, which is enough one-clip
subjects to fill the shop without generating a single daylight pair.

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
