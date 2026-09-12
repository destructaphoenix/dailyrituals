# Unported design work — the inventory, and what is actually backed up

> **Why this folder exists.** On 2026-09-11 the owner planned to prune the Claude Design project
> (`7bf44d09-f93a-42d2-a8b6-d412d671cf60`) and keep only what they want to build. **Fourteen of its 26
> cards exist nowhere else** — this repo generates the other twelve from `scripts/gen-design-system.js`.
> Deleting an unmirrored card destroys the only copy.
>
> ⚠️ **This folder is NOT yet a complete backup.** Read "What is and is not safe to delete" below before
> deleting anything.

## What is and is not safe to delete

| | |
| --- | --- |
| ✅ **Safe** | `components/*`, `tokens/*`, `frozen/rays.html`, `screens/baseline-*.html` — all regenerate with `node scripts/gen-design-system.js`. |
| ✅ **Safe** | `screens/day-0*.png` / `night-0*.png` — the 7×2 baselines are committed in `design-system/screens/`. |
| ✅ **Backed up here** | `insights-redesign.html`, `emberfield.html`, `starfall.html` — copied byte-exact. Their `assets/*.mp4` `src` attributes are dead here; the cards are kept for their spec, not to play. |
| 🔴 **NOT backed up** | the other 11 project-only cards below, **every `.mp4` in `art/assets/`, and every original in `uploads/`**. |

**The `.mp4` files are the sharpest risk.** They are original footage — Aurora, Tideline, Fernlight,
Sakura Fuji, Local Line, Event Horizon — and nothing in this repo, in git, or in any build contains them.
They cannot travel through the `DesignSync` read path either. **Do not delete an art card until the
footage is somewhere else.**

**The real fix is the GitHub connection.** `docs/playbook.md` already notes it: the pane's GitHub sync was
blocked only because the branch was unpublished, and `main` has carried `design-system/` since 2026-09-08.
Wiring it mirrors the whole project — HTML, PNG and MP4 — exactly and continuously, which is a better
backup than anything copied by hand. **That is the one thing worth doing before a prune.**

## The 14 project-only cards

### Screens — the ones that answer queue rows

| Card | Covers | State |
| --- | --- | --- |
| `screens/insights-redesign.html` | **D-01 + D-03** | ✅ mirrored here |
| `screens/plus-home.html` | **D-05**, much of **D-07**, reshapes **D-12** | 🔴 project only |
| `screens/shop-plus-skins.html` | **D-08** | 🔴 project only |
| `screens/celebration.html` | not a queue row — the ritual-complete screen | 🔴 project only |
| `screens/home-plus-skies.html` | not a queue row — animated skies on Home | 🔴 project only |

**`insights-redesign.html`** — two directions, day and night. Both retire the lifetime grid: *"The
lifetime heatmap leaves. Reflections keeps it as a navigation device. Insights gets a month-by-month
calendar instead: seven small months, tappable, using `c.heat0–heat3`."* Adds time scoping
(`This year · 2025 · All time`), milestones, themes, per-rite completion, and a rotating daily read.
**A** opens on a shareable keepsake poster; **B** is a typographic almanac with no card chrome.

**`plus-home.html`** — nine directions in three groups, day and night, each with token names and motion
notes. (1) member identity at the streak hero: straddle badge · member ribbon · lit card. (2) the locked
teaser: redacted peek · dark invitation · one-offer-two-rows. (3) the unlocked perk: ray-lit header ·
member footer · owned region. Its own closing note suggests the sets: `1A+2A+3B` least invasive,
`1B+2B+3A` leans on the Plus dark surface, `1C+2C+3C` treats Plus as one framed region.

**`shop-plus-skins.html`** — settles the Plus unlock tag (dark chip, `t.radius.sm`, never a pill), five
Plus palettes each taken from its hero art's own triad, six sky tiles that play the hero's clip at 58×58
with per-hero `object-position`, and a detail sheet that *is* the hero card. Its one open question is the
cost of six live clips in a list.

### Plus art — 7 heroes, and the footage lives only in the project

`art/aurora-veil.html` · `art/tideline.html` · `art/tideline-hero.html` · `art/meteorfall.html` ·
`art/sakura-fuji.html` · `art/fernlight.html` · `art/local-line.html` · `art/event-horizon.html` ·
**`art/emberfield.html`** ✅ · **`art/starfall.html`** ✅ — the two newest, both mirrored here 2026-09-12.
`screens/home-aurora.html` also appeared since this inventory and is 🔴 project only.

⚠️ **`uploads/` is the real master shelf.** `art/assets/*.mp4` are working copies; the originals the owner
uploaded (`Add_moving_cherry_blossoms_of.mp4`, `now_a_night_version_of_this_vi.mp4`, and the rest) sit in
`uploads/` and are the only ungraded, uncropped source that exists. **A prune that clears `uploads/` is
unrecoverable** — the design cards' crops are non-destructive CSS, so the upload *is* the negative.

Full-bleed animated streak heroes with per-sky XP-bar colours. **The app has nothing like this** —
`SkyPreview` ([`src/shopui.js`](../../src/shopui.js)) draws static gradients, and `SHOP_SKIES` knows five
static kinds. Porting these is a product decision with native weight (video playback, bundle size,
battery), not a design task. **Meteorfall is the exception: it is drawn in CSS, so it has no footage
dependency and is the cheapest of the seven to port.**

### Brand

`art/brand/brand.html` — wordmark, app icons, favicons, social and store assets. The PNGs it frames are
also in `art/brand/` in the project; the shipped app icon is already in the repo under `assets/`.

---

_Inventory written 2026-09-11. If the GitHub sync is wired, delete this file — the sync supersedes it._
