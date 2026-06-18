# Annual Recap — "Your YYYY" Time Capsule — Design

**Date:** 2026-06-14
**Status:** design approved (brainstorm) — pending spec review → plan
**Roadmap:** this is **legacy roadmap item C (Annual Recap / Time Capsule)**, pulled forward. Follows IMP-020 (Backup, D) and IMP-021 (Lifetime Progress, A+B), both code-complete.

---

## 1. Context & goal

The Insights tab has a daily "Consistency" heatmap (`buildLifetimeHeatmap`, rendered flat-amber by `LifetimeHeat`). The owner observed two problems with it as a *shareable* surface:

1. A daily GitHub-style grid is a **developer-dashboard aesthetic** — nobody posts it to social media.
2. At daily granularity for a long-term user it grows huge and **duplicates the Reflections tab** (which already lists entries day-by-day).

**Goal:** build a **Wrapped-style annual recap** the user is proud to share. The "richer heatmap" the owner asked for graduates into *one card inside the recap* (an annual **Mood map**), so the daily grid no longer needs to carry the shareability burden, and Reflections stays the day-to-day browser.

This resolves the original heatmap question by **reframing it as a feature**, not a restyle.

---

## 2. Locked decisions (from brainstorm)

| Decision | Choice |
| --- | --- |
| Artifact | Multi-card, swipeable Wrapped-style **story**; each card individually shareable as an image |
| Cadence / trigger | **Annual**, **calendar-year** anchor, **late-December reveal** ("Your 2026"); stays open through January (see §6) |
| Visual language | **Ivory & Ink** — neutral warm-charcoal background, ivory text, **no chrome accent color**; the **mood-dot colors are the only saturation** |
| Card sequence | 6 cards: Cover → Days remembered → Mood map → Defining mood → Streak + words → Shareable summary |
| Access | **Free to view & share** for everyone; shareable summary carries a small "made with Daily Rituals" mark |
| Share tech | `react-native-view-shot` capture → PNG → `expo-sharing` (new native module → **BUILD lane**) |
| In-app Consistency heatmap | **Leave as-is** for now; the recap is where "rich" lives. (Optional tiny follow-up: mood-tint it.) |

---

## 3. User-facing behavior

- **Entry point:** a "Your 2026 ✨" banner/card appears (on Home, above the fold) **only when the recap is available** (see §6). Tapping it opens the recap.
- **The recap** is a full-screen modal with a **horizontal pager** of 6 cards. Swipe to advance; a small progress indicator (●○○○○○) shows position.
- **Each card** has a "Share" affordance that captures *that card* as a PNG and opens the OS share sheet.
- **Dismiss** returns to the app. The banner remains while the reveal window is open so the user can revisit.

---

## 4. The six cards (content + data source)

All numbers come from `deriveRecap(entries, year)` (§7) — no new stat math is invented; existing helpers are reused.

1. **Cover** — "Your 2026 — A year you chose to remember." Ember-free ivory glow opener. *(no data)*
2. **Days remembered (hero)** — big serif count of days journaled in the year. Source: `daysRemembered`.
3. **Mood map** — the year as a constellation of mood-colored dots, one per journaled day, laid out chronologically. **This is the "rich heatmap".** Source: `moodByDay[]`.
4. **Defining mood** — "Grateful was your year — 41% of days," plus 2nd/3rd runners-up. Source: `topMoods[]` (mood, count, pct).
5. **Streak + words** — "31 days without missing" (longest streak in the year) + "18,400 words kept." Source: `longestStreak`, `totalWords`, `mostFaithfulMonth`.
6. **Shareable summary** — all-in-one card: days · streak · words · top mood + the user's name/handle + "made with Daily Rituals." **The card most users will post.**

> Card list is **data-driven** via `src/recap/cards.js` so reordering/dropping a card later is a one-line change, not a UI rewrite.

---

## 5. Visual language — "Ivory & Ink"

- **Background:** `radial-gradient(circle at 50% 30%, #16151a 0%, #0b0a0d 72%)` — neutral warm-charcoal (not amber-tinted).
- **Text:** primary ivory `#f4efe4`; secondary `#cfc7b6`; wordmark `#e8e2d4`. **No accent color in the chrome.**
- **Headline numbers:** the app's display/serif treatment (the `T d` display font), large.
- **Mood-dot palette** — the *only* saturated color, keyed to the real `MOODS` set in `data.js`. Tuned to read on the dark background (final values tuned in implementation; amber is permitted here as one mood hue only, never as chrome):

  | Mood | Hue |
  | --- | --- |
  | Grateful | `#e9b44c` (gold) |
  | Restless | `#e8825a` (coral) |
  | Proud | `#b48ef0` (violet) |
  | Tender | `#e89bb0` (rose) |
  | Tired | `#9aa3b2` (slate) |
  | Hopeful | `#5eb6a6` (teal) |
  | Heavy | `#5f7fd1` (indigo) |
  | Light | `#ece08f` (pale gold) |
  | *(unknown / no mood)* | dim ivory `#3a3833` |

- Cards must render legibly in **both** app themes; the recap is **self-contained dark** regardless of the user's light/dark setting (it's an artifact, not a screen that follows theme).

---

## 6. Reveal / availability logic

Pure function `isRecapAvailable(today, entries)` in `src/recap/availability.js`:

1. **Determine recap year** from `today`:
   - month is **December** → recap year = current year.
   - month is **January** → recap year = previous year (covers the natural late-Dec→Jan sharing window).
   - otherwise → `null` (not available).
2. If a recap year is determined **and** the count of entries within that calendar year ≥ `MIN_RECAP_ENTRIES` → available.

Constants (tunable, one place):
- `RECAP_REVEAL_MONTHS = [11, 0]` (December, January — 0-indexed).
- `MIN_RECAP_ENTRIES = 7` — a near-empty year shouldn't produce a sad recap. (~a week's worth; tune later.)

**Edge cases handled:**
- **Thin year** (entries ≥ 7 but sparse): recap renders; Mood map simply has few lit dots.
- **Empty / below-threshold year:** banner never appears; no recap.
- **Year boundary:** `deriveRecap` filters strictly to the recap year, so December-vs-January reveal both summarize the correct year.
- **Leap year:** day math uses existing `dateKeys` helpers (no hardcoded 365).
- **Expo Go (no native view-shot):** recap still *views*; the Share action shows the typed `nativeUnavailable` toast instead of crashing (same pattern as `src/backup/io.js`).

---

## 7. Data model — `deriveRecap(entries, year)` (pure)

Returns:

```
{
  year,
  daysRemembered,        // count of journaled days in `year`
  totalWords,            // sum of word counts of entry text (`did`) in `year`
  moodByDay,             // [{ dayKey, mood }] chronological, journaled days in `year`
  topMoods,              // [{ mood, count, pct }] sorted desc (for Defining mood)
  longestStreak,         // longest consecutive run of journaled days within `year`
  mostFaithfulMonth,     // { monthIndex, count } — month with the most entries
}
```

**Reuse (no duplication):** `longestConsecutiveRun`, `dayKey` helpers, `DAY_MS` from `src/insights/dateKeys.js`; mood-tally logic from `deriveInsights`/`derive.js`; `indexByDay` from `src/home/calendar.js`; level/XP not needed here. This is the **single tested boundary**, mirroring `src/backup/` and `src/insights/lifetime.js`.

---

## 8. Architecture / file plan

**Pure core (unit-tested):**
- `src/recap/deriveRecap.js` — the data model above.
- `src/recap/availability.js` — `isRecapAvailable` + reveal constants.
- `src/recap/cards.js` — builds the ordered card-descriptor list from the model.
- `src/recap/moodColors.js` — `MOOD_COLORS` map + fallback.

**Native (thin):**
- `src/recap/share.js` — `shareCard(ref)` = `react-native-view-shot` `captureRef` → `Sharing.shareAsync`. Lazy-require + typed `nativeUnavailable` (copy the `src/backup/io.js` pattern).

**UI (presentational):**
- `src/screens/RecapScreen.js` — the modal pager + progress dots + per-card share button.
- `src/recap/cards/*.js` — `CoverCard`, `DaysHeroCard`, `MoodMapCard`, `DefiningMoodCard`, `StreakWordsCard`, `SummaryCard`. Fed by props only.
- A small **entry-point banner** component, wired in `RitualsApp.js` (state) + rendered on `HomeScreen`.

**Tests:** `__tests__/recap/deriveRecap.test.js`, `availability.test.js`, `cards.test.js`, `moodColors.test.js`.

---

## 9. Out of scope (deferred — keep v1 focused)

- **Past-year archive / true "Time Capsule" list** of prior recaps — v1 is the current reveal year only.
- **Plus bonus cards / watermark removal** — access is fully free in v1.
- **"A line you wrote" entry-highlight card** — privacy + selection complexity; revisit later.
- **Animation/transition polish** beyond basic paging.
- **In-app Consistency heatmap mood-tint** — separate optional follow-up, not part of this feature.
- **iOS build/test** — Android first (iOS is blocked on Mac/EAS per existing project constraints). Code stays cross-platform RN.

---

## 10. Ship lane & sequencing

- **BUILD lane** (new `react-native-view-shot` native module). Rides a dev build alongside the other pending BUILD items (IMP-006 / IMP-020 / IMP-022). No `Release-Lane` trailer until the owner says ship.
- Likely filed as **IMP-024** in `PROGRESS.md` (it's larger than a typical IMP — effectively roadmap C — so it gets this spec + a written implementation plan rather than an inline-only scope).
- **Reveal timing note:** the feature can be built and shipped any time; it simply stays dormant (banner hidden) until a December/January reveal window. This is testable year-round by injecting `today` into the pure `isRecapAvailable`.

---

## 11. Testing plan (highlights)

- `deriveRecap`: days remembered; total words; top moods + percentages; longest streak; most faithful month; `moodByDay` ordering; **strict year filtering** (entries outside `year` excluded); empty year; single entry; leap year.
- `availability`: December → current year (≥ threshold true); January → previous year; other months → not available; below threshold → false; empty entries → false.
- `cards`: correct ordered descriptors + count from a given model.
- `moodColors`: every `MOODS` value maps to a color; unknown/no mood → fallback.
- Native `share.js` is the thin untested boundary (manual smoke test on a real build).
