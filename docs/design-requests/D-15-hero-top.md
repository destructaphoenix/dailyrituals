# D-15 · The hero card's top third — Claude Design request

> **This whole file is the request.** Select all, paste into Claude Design, send. Generated from the real
> files **2026-09-14**. Queue row: [`docs/design-queue.md`](../design-queue.md) → D-15.
>
> ✅ **This screen is already in the project — open `screens/home-day.html` and `screens/home-night.html`
> first.** They are not screenshots. They are **rendered from the app's shipped code** (`react-native-web`,
> IMP-135), from the same 210-day "Sam" fixture the Play listing uses, and each card shows **both hero
> grounds** — the classic rays and the video sky on its poster. Regenerating them is a command, so they
> cannot drift from the app the way a capture does.
>
> ⚠️ **They are a layout render, not a photograph.** Shadows and real font metrics differ from a phone, and
> the video hero shows its poster rather than playing. Trust the geometry; do not trust the shadow.
>
> The old baseline screenshots were deleted on 2026-09-14 because the app had outrun them. The source
> blocks at the end of this file are still the authority on *why* the numbers are what they are.

---

## The ask, in one sentence

**The most-looked-at rectangle in this app is 38% empty, and nobody has ever decided what that space is
for. Decide it.**

Take as much latitude as the problem deserves. This is not a bug report with a preferred fix attached — it
is the opposite. What follows is measurement, and then the field is yours.

## What is true today

The streak hero is a **336dp** card at the top of Home. Its contents are anchored at two points and nothing
lives between the top edge and the first of them:

| Band | Card-y | What is in it |
| --- | --- | --- |
| **top** | **0 → 127** | **nothing** — the rays, or video footage, and no content whatsoever |
| numeral block | 127 → 252 | the streak numeral (82dp line), "day streak", a one-line subtitle |
| spacer | 252 → ~281 | `flex: 1` |
| meta row | ~281 → 314 | `Lv 3 · Kindling`, `120 / 200 XP`, the progress bar |

The 127 is arithmetic, not an estimate: `HERO_FOCAL - paddingTop - NUMERAL_LINE / 2` = 168 − 26 − 41 = 101,
plus the box's own 26dp of padding.

## How it got that way — the part that makes this interesting

Until three days ago this card had **no fixed height**. It sized itself to its content, about 232dp, and the
sunburst behind it was composed for that: a 300dp disc hung 70dp off the top edge so you never saw where the
rays stopped, and the numeral sat at card-y 80 in the middle of the convergence.

Then the app learned to play **video skies** behind the numeral, and the card was pinned to **336dp** —
a height chosen for the video crop, not for this composition. The classic card had to adopt the same 336
so the page below does not jump when you switch skies. Four fixes followed (the numeral back on the focal,
the focal moved to the card's true centre, the rays given a reach that runs past every corner), and they
all worked: this card was walked on hardware on 2026-09-14 and **passed every step, both grounds, at max
font, in both modes.**

**So nothing here is broken.** The card grew 104dp for a reason that had nothing to do with its composition,
88 of those went to the top, and the result is correct, safe, shipped — and hollow.

## Three answers are legitimate. We do not know which is right.

1. **Fill it.** Something belongs up there. The obvious candidates are already on the screen (below).
2. **Use it.** The video sky *is* the point, and a sky needs sky. Make the card read as a piece of art with
   a caption at its foot — and then the classic (no-video) ground has to earn that space too, which is a
   real design problem rather than a cop-out.
3. **Restructure.** The card's relationship to the page is wrong, not its interior. Say so and show it.

**A fourth answer is allowed: the emptiness is already right, and here is the proof.** If that is the case,
say what the space is *doing* — breathing room is a decision, not an absence, and it should be able to
survive being pointed at.

## What is fair game — deliberately wide

Immediately **above** this card sits the page's own header: today's date, an ember-count pill, a day/night
toggle, and a large greeting ("Good evening, Sam."). **All of it can be absorbed, moved, re-ranked or
rethought.** Its source is below so you can see exactly what is there.

Below the card sit the week strip, the three daily rites, and up to four notice cards. A proposal that
changes what the *top of Home* is may reach into those as long as it says what it is doing.

You may also treat day and night, and classic-ground vs video-ground, as **four** compositions rather than
two — they already behave differently, and the app knows which one it is drawing.

## The three real constraints, and they are the only ones

1. **336dp is pinned.** It is the crop the sky clips are encoded against. Compose inside it; a proposal that
   needs a different height is a much larger conversation about re-encoding the video library.
2. **The rays are the brand and may not be redrawn** — but where they sit and how far they reach are now
   ordinary props (`focal`, `reach`, see the source), so **positioning and scaling them is yours**. Their
   geometry, spoke count, colour and 60s rotation are not.
3. **The candle row does not come back into this card.** It was deliberately moved out to the week strip
   because this card was carrying too much.

Everything else — type scale, hierarchy, what the numeral even is, whether "day streak" is the right label,
colour, motion, the shadow, the radius, what happens at streak 0 versus streak 400 — is open.

## This has to sell the app, not only serve it

Screenshot 01 of the Play listing **is this card**. It is the first thing a stranger sees, on a store page,
next to competitors, at thumbnail size, with about four seconds of attention. Design it as something that
survives being cropped, scaled down and put in an advertisement — not only as something that works on a
phone in the hand. **If the two goals conflict, say so and show both.**

## What to return

Whatever makes the case best. HTML/CSS in **day and night** is the house format and the spec is the
deliverable rather than code, but the shape of the answer is yours: one direction argued hard, or three
compared, or a sequence showing streak 1 → streak 400. Name colours in the app's token names
(`c.accent`, `c.accentSoft`, `c.accentDeep`, `c.ink`, `c.muted`, `c.border`, `t.radius.card`) so a build
chat can port it without guessing, and give real dp for anything you place — but do not let that flatten
the idea. **A vivid direction with three loose numbers is worth more here than a precise diagram of
something safe.**

---

## The source

### The hero's geometry — `src/screens/HomeScreen.js`

```jsx
// The streak hero's video sky (IMP-121 built the shell; IMP-122 wired it to
// the real sky manifest instead of one hardcoded fixture clip).
const HERO_HEIGHT = 336;

// Both hero shells are the same box — only the ground behind them differs.
// The height is pinned to the sky-clip crop (design-queue.md → "The frame"),
// so the classic card's content does not get to decide it (IMP-130).
const HERO_BOX = { flex: 1, paddingHorizontal: 22, paddingTop: 26, paddingBottom: 22, alignItems: 'center' };

// The sunburst's focal point. It was 80 from IMP-003 until now, which was the
// middle of a card that sized itself to its content (~232) -- the 300dp disc
// bled off the top and landed on the bottom edge. IMP-130 pinned the card to
// 336 for the sky crop and left the focal where it was, so the disc now hangs
// 70dp off the top and leaves a 106dp bare band underneath. IMP-131 put the
// numeral back ON that focal; it never asked whether the focal was still in the
// right place. It is the card's centre, and both the art and the numeral are
// derived from it here so they cannot drift apart again.
const HERO_FOCAL = HERO_HEIGHT / 2;

// How far the rays run. IMP-132 centred the disc and, in doing so, made its own
// outer boundary visible for the first time: a 300dp circle floating in a 350x336
// card shows a bare rim on all four sides and reads as empty. The sunburst was
// never meant to show where it ends -- before IMP-130 it bled off the top edge --
// so the reach is now derived from the card's own diagonal: far enough that the
// tips are always outside the card, at any rotation, on any phone width.
const HERO_PAD = 20;        // the hero wrapper's paddingHorizontal, both sides
const HERO_REACH_MARGIN = 1.08; // 8% past the corner, so no round cap ever lands on one
const heroReach = (windowWidth) =>
  Math.ceil(Math.hypot((windowWidth - HERO_PAD * 2) / 2, HERO_HEIGHT / 2) * HERO_REACH_MARGIN);
const NUMERAL_LINE = 82;
// Line heights below the numeral are explicit so the stack's height is known by
// construction rather than left to three RN defaults (IMP-131's estimates).
const HERO_LABEL_LINE = 20;
const HERO_SUB_LINE = 17;
const HERO_META_LINE = 18;
```

### What is drawn inside it — same file

```jsx
  // Shared between the video-sky and classic-art hero shells — unchanged in
  // every respect except what sits behind it (IMP-121).
  const heroInner = (
    <>
      <View testID="hero-numeral-block" style={{ zIndex: 1, alignItems: 'center', marginTop: HERO_FOCAL - HERO_BOX.paddingTop - NUMERAL_LINE / 2 }}>
        <T d w={800} color={c.accentDeep} style={[{ fontSize: 76, lineHeight: NUMERAL_LINE, includeFontPadding: false, textAlign: 'center' }, hero.numeralShadow]}>{streak}</T>
        <T d w={700} color={hero.title} style={[{ fontSize: 16, lineHeight: HERO_LABEL_LINE, marginTop: 2 }, hero.textShadow]}>day streak</T>
        <T w={600} color={hero.subtitle} style={[{ fontSize: 13, lineHeight: HERO_SUB_LINE, marginTop: 4 }, hero.textShadow]}>{streakSubtitle(streak)}</T>
      </View>
      <View testID="hero-spacer" style={{ flex: 1 }} />
      {/* No marginTop here: the spacer already separates this row, and with the
          numeral on the card's centre the old 22 was spending slack the stack
          no longer has. */}
      <View testID="hero-meta" style={{ zIndex: 1, width: '100%' }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 7 }}>
          <T d w={700} color={hero.meta} numberOfLines={1} style={[{ fontSize: 14, lineHeight: HERO_META_LINE, flexShrink: 1 }, hero.textShadow]}>Lv {level} · {levelName}</T>
          <T w={700} color={hero.metaDim} style={[{ fontSize: 12, lineHeight: HERO_META_LINE }, hero.textShadow]}>{xpToNext == null ? 'Max' : `${xpInto} / ${xpToNext} XP`}</T>
        </View>
        <ProgressBar value={xpToNext == null ? 100 : Math.min(100, (xpInto / xpToNext) * 100)} accent={videoSkyActive ? videoSky.accent : undefined} onVideo={videoSkyActive} />
      </View>
    </>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 4, paddingBottom: 26, gap: 14 }}
      showsVerticalScrollIndicator={false}
    >
```

### The two shells — same file

```jsx
      <View style={{ paddingHorizontal: 20 }}>
        {videoSkyActive ? (
          <Card testID="streak-hero" style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
            <SkyHero source={skyVideoSource(videoSky, mode)} poster={{ uri: videoSky.poster }}>
              <View testID="hero-box" style={HERO_BOX}>
                {heroInner}
              </View>
            </SkyHero>
          </Card>
        ) : (
          <Card testID="streak-hero" style={{ height: HERO_HEIGHT, overflow: 'hidden' }}>
            {mode === 'night' ? <NightRays focal={HERO_FOCAL} reach={reach} /> : <RayFan focal={HERO_FOCAL} reach={reach} />}
            <View testID="hero-box" style={HERO_BOX}>{heroInner}</View>
          </Card>
        )}
      </View>

      {/* candle spent notice (IMP-060) — outranks On this day: something */}
```

### The page header directly above it, which you may absorb — same file

```jsx
      <View style={{ paddingHorizontal: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <T w={600} color={c.muted} style={{ fontSize: 14, flex: 1 }}>{todayLabel()}</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <EmberPill embers={embers} plus={plus} onPress={onOpenShop} />
            <Pressable
              onPress={onToggleMode}
              accessibilityLabel={mode === 'night' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={({ pressed }) => [{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pressed ? 0.92 : 1 }] }]}
            >
              <Orb size={20} color={c.accentDeep} />
            </Pressable>
          </View>
        </View>
        <T d w={700} color={c.ink} numberOfLines={3} style={{ fontSize: 27, lineHeight: 32, marginTop: 2 }}>{userName ? `${hello}, ${userName}.` : `${hello}.`}</T>
      </View>
```

### The frozen artwork, and the two props that are not frozen — `src/art.js`

```jsx
export function RayFan({ size = 300, focal = 80, reach = size / 2 }) {
  const t = useTheme();
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 60000, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const d = reach * 2;
  const c = reach;
  const rays = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    rays.push(
      <Line key={i} x1={c} y1={c} x2={c + Math.cos(a) * c} y2={c + Math.sin(a) * c}
        stroke={t.colors.accent} strokeWidth={2} strokeLinecap="round" />
    );
  }
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: focal - reach, left: 0, right: 0, height: d, alignItems: 'center', opacity: 0.5 }}>
      <AView style={{ width: d, height: d, transform: [{ rotate }] }}>
        <Svg width={d} height={d} viewBox={`0 0 ${d} ${d}`} fill="none">{rays}</Svg>
      </AView>
    </View>
  );
}

// ── Night-v2 hero: rotating ray fan on black + soft central amber bloom (IMP-019 Round 4) ──
// Reuses the same golden sunburst as the day RayFan — proven premium brand —
// rendered on pure AMOLED black, with a warm amber bloom at the convergence so
```
