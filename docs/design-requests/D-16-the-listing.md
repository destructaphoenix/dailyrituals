# D-16 · The Play listing — Claude Design request

> **This whole file is the request.** Select all, paste into Claude Design, send. Generated **2026-09-14**.
> Queue row: [`docs/design-queue.md`](../design-queue.md) → D-16.
>
> ⚠️ **This one is not an app screen.** Everything else in the queue is about the product working better.
> This is about a stranger deciding, in about four seconds, on a store page, next to competitors, whether
> to install it at all.

---

## The ask

**Design the store listing as a piece of persuasion, not as seven screenshots with captions on them.**

Seven 1080×1920 frames, in a fixed order, of which Play shows the first three or four prominently and most
people never swipe past. Today they exist, they are competent, and they were assembled as a *capture task*
— one shot per screen, in screen order, with a caption written to describe what is in the picture. Nobody
has ever asked what the seven frames are supposed to *do* in sequence.

## What is there now, and why it cannot stay

The seven assets in `store/play/` were produced on **2026-08-16/17**. Since that morning:

| Frame | Its caption today | What has happened to it |
| --- | --- | --- |
| `01-today` | *"One question a day. / That's the whole ritual."* | 🔴 The hero card was **rebuilt five times** — it now plays **video skies** behind the streak numeral, and the card in this picture no longer exists in the app. |
| `05-insights` | *"Your year, / one square at a time."* | 🔴 The screen shows a lifetime grid that was **deleted from the app**, and the caption is a description of the deleted thing. |
| `07-shop` | *"A garden that grows / as your record does."* | 🔴 17 commits of change: candle cap, kept labels, tier tags, ember pill. |
| `02`, `03`, `04`, `06` | — | Still broadly true, still a picture of a version that shipped a month ago. |

**The listing is advertising an app that no longer exists.** Re-capturing is mechanical and already filed
as a separate task — but re-capturing the *same seven compositions* just refreshes a listing nobody
designed. **This row is the design that should happen before the shutter opens.**

## The three things we know are missing

1. **The best thing in the app is not in the listing at all.** The video skies — a full-bleed animated sky
   behind the streak numeral, which is also the paid feature — landed after these shots were taken. The
   listing sells a journal with a nice sunburst. The app is now a journal you *watch*.
2. **Night mode never appears.** The whole set is day mode. The app's dark theme is true black with an
   amber bloom and it is arguably the more striking of the two.
3. **The captions describe rather than sell.** They name what is in each frame. None of them say what the
   product is for, why it is different, or what happens if you keep it for a year — which is the only
   reason this app exists.

## What to return — and this is the widest brief in the queue

**The story first.** Seven frames, in order: what is each one *for*? What does frame 1 have to accomplish
that frame 4 does not? Where does the paid feature appear, and does it appear as a feature or as a
temptation? What is the last frame for — most listings waste it.

**Then the frame design itself.** The current template is a phone screenshot on a flat cream field with a
two-line headline above it. That template is not sacred. Full-bleed, edge-cropped, diagonal, stacked
devices, no device at all, motion-implying compositions, a frame that is pure type — all fair. Consider
that frames 1–3 are seen as a **row of thumbnails** before anyone taps: they should work as a triptych at
small size, not only individually.

**And the copy.** Rewrite all seven headlines and subheads. The existing ones are in the source below; treat
them as a starting position to argue with, not a constraint.

**If you want to go further:** the 1024×500 feature graphic, the short description, what a 15-second promo
video would show, and how the same system extends to an ad or a social post. All welcome, none required.

## The only hard constraints

1. **1080×1920 per frame, seven frames, and the order is the listing order.** Play's own geometry.
2. **The screenshots must be honest.** Every pixel of app UI has to be something the app really renders —
   no mocked-up features, no invented screens, no numbers the app cannot produce. The frame around it is
   yours; what is inside the phone is a photograph.
3. **The rays are the brand** (they may be positioned and scaled, never redrawn), and the app's typefaces
   are **Fredoka** for headlines and **Baloo 2** for body — the listing already uses them and it is how the
   store page and the product read as one thing.

Everything else — palette, layout, whether a device frame appears at all, whether frames share a background
or escalate — is open.

## How this gets built afterwards

The seven frames are assembled by a script from raw captures: `.maestro/store-shots.yaml` drives the app on
a device and takes the raw screens, then `scripts/shots.js` composes each one onto the canvas defined in
`scripts/shots.config.js` (below). **So a returned design becomes real by editing that config and that
compositor** — headline, subhead, canvas, colours and the frame drawing all live there. Design as if the
compositor can be rewritten, because it can; just say what it needs to do.

---

## The source

### The listing's current definition — `scripts/shots.config.js`

```js
// scripts/shots.config.js — what gets captured, and what each shot says.
// Order IS the Play listing order: Play shows the first 3–4 most prominently.
module.exports = {
  canvas: { w: 1080, h: 1920 },
  // Straight from theme.js day palette + the splash background.
  colors: { bg: '#f9f7f4', ink: '#292524', accent: '#f59e0b', accentDeep: '#d97706' },
  fonts: {
    headline: 'node_modules/@expo-google-fonts/fredoka/Fredoka_600SemiBold.ttf',
    body:     'node_modules/@expo-google-fonts/baloo-2/Baloo2_500Medium.ttf',
  },
  shots: [
    { id: '01-today',       headline: 'One question a day.',          sub: "That's the whole ritual." },
    { id: '02-write',       headline: 'What you did.',                sub: 'What you wished for.' },
    { id: '03-moods',       headline: 'Name how it felt —',           sub: 'in your own words.' },
    { id: '04-reflections', headline: 'Every day you kept,',          sub: 'searchable.' },
    { id: '05-insights',    headline: 'Your year,',                   sub: 'one square at a time.' },
    { id: '06-achievements',headline: 'Proof you kept going.',        sub: 'Even the days you almost didn\'t.' },
    { id: '07-shop',        headline: 'A garden that grows',          sub: 'as your record does.' },
  ],
};
```

### How the raw captures happen — `.maestro/store-shots.yaml` (excerpt)

The flow loads a dev fixture — a **210-day streak, "Sam", 2,400 embers** — so the pictures show a heavy,
lived-in account rather than an empty app. That fixture is a design decision you may also argue with: it is
the only account any prospective user ever sees, and it shows them someone who has already succeeded.

```yaml
- tapOn: "Today"
- takeScreenshot: store/raw/01-today
- tapOn: "Write today's entry"
- takeScreenshot: store/raw/02-write
- tapOn: "Next"             # did -> wished
- tapOn: "Next"             # wished -> moods
- takeScreenshot: store/raw/03-moods
```
