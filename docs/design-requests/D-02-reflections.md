# D-02 · Reflections → every entry ever, mounted at once — Claude Design request

> **This whole file is the request.** Select all, paste into Claude Design, send. Nothing outside it is
> needed and nothing inside it should be summarised away — the source blocks below are what replace the
> repo links Claude Design cannot open. Generated from the real files **2026-09-14**; regenerate rather
> than hand-edit if the code moves. Queue row: [`docs/design-queue.md`](../design-queue.md) → D-02.
>
> ✅ **Unlike D-01, this row is genuinely un-designed.** The live Claude Design project holds no card for
> Reflections — not a direction, not a fragment. **This is a fresh request, not a port brief.**
>
> **Look at `day-04-reflections.png` / `night-04-reflections.png`** in the project's Screens group while
> reading this. ⚠️ **What that shot cannot tell you:** it was captured **with a query active** — it shows
> the filter bar's "210 matches" line and a single result card. **The browsing state — the screen a user
> actually opens, with no query at all — appears in no asset anywhere.** That state is most of this brief.

---

## The ask

Give the **Reflections** tab a **browsing structure**. Today it has none: it is a flat, unbounded,
reverse-chronological list of every entry that matches the filter, and with no filter that means *every
entry ever written*, all mounted at once.

**What is wrong today.** [`ArchiveScreen`](../../src/screens/ArchiveScreen.js) does `results.map(...)`
inside a plain `ScrollView`. No `FlatList`, no windowing, no pagination, no grouping, no sections — one
`Card` per entry, live, forever.

**The measurement**, on a 360dp phone at default font scale, against the seeded `twoYears` journal that
WALK-08 used (**460 entries**):

| | |
| --- | --- |
| card padding | 16dp top + 16dp bottom |
| weekday title | ~20dp (15pt) + 3dp margin |
| snippet line | 2 lines x 19.5dp = **39dp** (`numberOfLines={2}`, always exactly two when the text is long) |
| mood chips row | 8dp margin + ~22dp pill |
| **one card, with moods** | **~124dp** · without moods ~102dp |
| gap between cards | 12dp |
| **460 entries** | ~460 x 136 = **~62,000dp** — roughly **85 screenfuls** |
| mounted component trees | **460**, every one of them re-rendering on every keystroke in the search field |

⚠️ **The re-render half matters as much as the height.** `query` lives in `ArchiveScreen`'s own state, so
typing one character re-runs `searchEntries` and re-renders the whole mapped list. This is the most extreme
"lists everything" surface in the app — more so than Insights, which is only what the owner noticed first.

**The direction we believe in** (argue with it if you have a better one): **month sections with sticky
headers** — "September 2026 · 22 kept" — collapsed by default beyond the current month, and a visibly
different treatment for **browsing** (no query) versus **results** (a query is active). The per-entry card
itself is good and does **not** need redrawing; what is missing is everything above it.

**Why month sections and not something else:** the app's own date filter is already month-granular. The
From/To buttons open a **month picker** (`recentMonths(24)`, labels like "Mar 2026"), so a month-sectioned
list speaks the vocabulary the screen already taught the user. See the filter source below.

---

## The two states, and they are not the same screen

This is the core of the request. Today both states render identically — the same flat list, with a count
line appearing above it — and the difference between *reading back your life* and *finding one day* is
carried by nothing but that count.

| | **Browsing** — no query | **Results** — text, mood or date filter active |
| --- | --- | --- |
| what the user wants | to wander, to find roughly when | to land on specific days |
| how many rows | all of them (460+) | usually few, sometimes hundreds |
| today's screen | flat list, newest first | flat list, newest first, + "N matches" |
| what it needs | structure, collapse, a sense of scale | ranked/flat is fine — **but the match must be visible on the card** |

**Design both.** A structure that is right for browsing and wrong for results (or vice versa) is half an
answer. Say explicitly what a section header does when a filter is active — does it survive, does it count
matches, does everything expand?

---

## What must survive the redesign

These are not preferences — each is either shipped behaviour that a design can silently delete, or a bug
that was already found and fixed here.

1. **Newest first.** `searchEntries` sorts `dayKey` **descending** and the screen relies on it. Do not
   invert the order.
2. **The snippet line is the search feature's only visible result** (IMP-053, IMP-065). With a text query,
   the body line stops showing `entry.did` and instead quotes the **matched words**, prefixed by a label
   naming **which half of the day matched** (`did` / `wished`), with the match itself in `c.accentDeep`.
   A design that replaces the body line with a generic preview **deletes the feature**. It is two lines,
   clipped by `numberOfLines={2}`.
3. **The per-entry card's anatomy is shipped and correct — place it, do not redraw it:** a 46dp date
   column (day numeral 22pt `c.accentDeep`, uppercase month 11pt `c.muted`), weekday title 15pt `c.ink`,
   the snippet line, then mood chips.
4. **An entry can carry several moods** (IMP-037), so the chip row **wraps** — `flexWrap` with 6dp gaps.
   Do not design for exactly one chip, and do not design for a fixed row height.
5. **"Last 5 weeks" stays, and stays bounded.** That card is the *navigation* device and is the reason
   Insights was allowed to lose its lifetime grid (IMP-120). ⚠️ **Do not move a lifetime heatmap back
   here** — that is the defect that was just removed one tab over.
6. **Everything is inside ONE scroller today** — the title block, the filter bar, the "Last 5 weeks" card
   and the list. If sections become sticky, **say what pins and what scrolls away**: in a `SectionList`
   port all four of those become the list header, and the first sticky header would then sit under them.
7. **Two distinct zero states, both shipped, both must stay distinct:** *"Nothing here yet."* (empty
   journal — a different, warmer card) and *"Nothing matches that yet. Try fewer words, or a wider stretch
   of days."* (a filter is active and matched nothing). Copy is shipped; keep both or improve both.
8. **The whole card is the press target** and it opens that day's entry, with a 0.99 press scale. Keep a
   real, full-card target — a design that makes only the date or the title tappable shrinks it.
9. **The count line already exists** — `N match` / `N matches`, 12.5pt `c.muted`, rendered **only while a
   filter is active**, inside the filter bar. If a section header also counts, say how the two relate so
   the screen does not state the same number twice in two voices.
10. **Whatever structure comes back, its mounted-node count must not grow with the journal.** That is the
    entire point of the row: bounded by construction, not bounded by a longer scroll.

## What to return

An HTML/CSS preview in **both day and night**, plus a spec **written in token names** — `c.ink`, `c.muted`,
`c.surface`, `c.border`, `c.cream`, `c.accent`, `c.accentSoft`, `c.accentDeep`, `c.onAccent`,
`c.placeholder`, `t.radius.card`, `t.radius.btn` — never hex, never prose like "a gentle fade". Name the dp
of every gap, inset, header height and collapsed-row height. State the **sticky** behaviour explicitly.

The port to React Native (`FlatList` / `SectionList`) is a separate build task, so **the spec is the
deliverable, not code**.

⚠️ **Out of scope:** `RayFan` / `NightRays` (frozen — this screen does not use them), anything under
`src/billing/`, the Insights tab (D-01/D-03/D-04 are separate requests), and the mood-filter chip row's
scroll behaviour (it deliberately does **not** scroll to follow the selected chip — IMP-071 reversed
IMP-065 on purpose; do not re-open it).

---

## The source

### The screen — `src/screens/ArchiveScreen.js`

```jsx
export default function ArchiveScreen({ copy, mode, entries, onOpen, customMoods = [], customMoodEmoji = {}, frozenDays = [] }) {
  const t = useTheme();
  const c = t.colors;
  const [query, setQuery] = useState(EMPTY_QUERY);
  const heat = buildHeatmap(entries, new Date(), { frozenDays });
  const results = searchEntries(entries, query);
  const filtering = !!(query.text || query.moods.length || query.from || query.to);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 26, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 6 }}>
        <T d w={800} color={c.ink} style={{ fontSize: 24 }}>Reflections</T>
        <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 2 }}>{copy.arcSub}</T>
      </View>

      {entries.length > 0 && (
        <View style={{ paddingHorizontal: 20 }}>
          <ArchiveFilters
            text={query.text} moods={query.moods} from={query.from} to={query.to}
            onChange={setQuery} resultCount={results.length}
            customMoods={customMoods} customMoodEmoji={customMoodEmoji}
          />
        </View>
      )}

      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <T d w={700} color={c.ink} style={{ fontSize: 15 }}>Last 5 weeks</T>
            <T w={700} color={c.muted} style={{ fontSize: 12 }}>{entries.length} kept</T>
          </View>
          <Heat cells={heat} entries={entries} onOpen={onOpen} customMoodEmoji={customMoodEmoji} />
        </Card>
      </View>

      {entries.length === 0 ? (
        <View style={{ paddingHorizontal: 20 }}>
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <T d w={700} color={c.ink} style={{ fontSize: 16, textAlign: 'center' }}>Nothing here yet.</T>
            <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
              Every day you lay to rest is kept here for good — the words, the day, and how it felt. Write your
              first one and this page starts filling in.
            </T>
          </Card>
        </View>
      ) : filtering && results.length === 0 ? (
        <View style={{ paddingHorizontal: 20 }}>
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <T d w={700} color={c.ink} style={{ fontSize: 16, textAlign: 'center' }}>
              Nothing matches that yet. Try fewer words, or a wider stretch of days.
            </T>
          </Card>
        </View>
      ) : (
        <View style={{ paddingHorizontal: 20, gap: 12 }}>
          {results.map((e) => (
            <Pressable key={e.id} onPress={() => onOpen(e)}>
              {({ pressed }) => (
                <Card style={{ padding: 16, flexDirection: 'row', gap: 14, transform: [{ scale: pressed ? 0.99 : 1 }] }}>
                  <View style={{ width: 46, alignItems: 'center' }}>
                    <T d w={800} color={c.accentDeep} style={{ fontSize: 22, lineHeight: 22 }}>{e.day}</T>
                    <T w={800} color={c.muted} style={{ fontSize: 11, textTransform: 'uppercase', marginTop: 2 }}>{e.mon}</T>
                  </View>
                  <View style={{ flex: 1 }}>
                    <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 3 }}>{e.wd}</T>
                    <ResultLine entry={e} text={query.text} />
                    {e.moods && e.moods.length > 0 ? (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                        {e.moods.map((m) => (
                          <View key={m} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: c.accentSoft }}>
                            <Text style={{ fontSize: 12 }}>{moodEmoji(m, customMoodEmoji)}</Text>
                            <T w={800} color={c.accentDeep} style={{ fontSize: 11 }}>{m}</T>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </Card>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
```

### The body line, and why it is load-bearing — same file

```jsx
// The result card's body line. Browsing (no text query) or a match this module
// cannot locate in a single field renders exactly what it always did — the
// first two lines of `did`. With a locatable match it quotes the matched words
// instead, so a hit in `wished`, or deep in `did`, is visible on the card
// rather than only after opening the entry (IMP-053). The label names
// whichever half of the day matched (IMP-065).
export function ResultLine({ entry, text }) {
  const t = useTheme();
  const c = t.colors;
  const snip = text ? entrySnippet(entry, text) : null;
  const style = { fontSize: 13.5, lineHeight: 19.5 };
  if (!snip) {
    return <T w={400} color={c.muted} style={style} numberOfLines={2}>{entry.did}</T>;
  }
  // numberOfLines on the outer T clips the tail for free. The highlight is a
  // nested T: it is a thin Text wrapper that always sets its own fontFamily and
  // color, so it cannot inherit a half-style from the line around it.
  return (
    <T w={400} color={c.muted} style={style} numberOfLines={2}>
      <T w={800} color={c.muted} style={{ fontSize: 12 }}>{`${snip.field} · `}</T>
      {snip.truncatedStart ? '…' : ''}{snip.before}
      <T w={800} color={c.accentDeep} style={style}>{snip.match}</T>
      {snip.after}
    </T>
  );
}
```

### The filter bar that owns the query and the count — `src/screens/ArchiveFilters.js`

```jsx
  const active = !!(text || moods.length || from || to);

  return (
    <View style={{ gap: 10 }}>
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          style={{
            paddingVertical: 12, paddingLeft: 16, paddingRight: 44,
            borderRadius: t.radius.btn, borderWidth: 1.5,
            borderColor: c.border, backgroundColor: c.cream,
            fontFamily: t.body(400), fontSize: 15, color: c.ink,
          }}
          placeholder="Search your journal"
          placeholderTextColor={c.placeholder}
          value={text}
          onChangeText={(v) => onChange({ text: v, moods, from, to })}
        />
        {text ? (
          <Pressable
            onPress={() => onChange({ text: '', moods, from, to })}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={({ pressed }) => ({ position: 'absolute', right: 14, opacity: pressed ? 0.5 : 1 })}
          >
            <Close size={16} color={c.muted} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
        {orderMoodChips(allMoodChips(MOODS, customMoods), moods).map((m) => {
          const sel = moods.includes(m);
          return (
            <Pressable
              key={m}
              onPress={() => toggleMood(m)}
              accessibilityRole="button"
              accessibilityLabel={m}
              accessibilityState={{ selected: sel }}
              style={[
                { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1.5 },
                sel ? { backgroundColor: c.accent, borderColor: c.accent } : { backgroundColor: c.surface, borderColor: c.border },
              ]}
            >
              <Text style={{ fontSize: 13 }}>{moodEmoji(m, customMoodEmoji)}</Text>
              <T w={700} color={sel ? c.onAccent : c.ink} style={{ fontSize: 13 }}>{m}</T>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <DateButton label={boundLabel('From', from)} active={!!from} onPress={() => setPicker('from')} />
        <DateButton label={boundLabel('To', to)} active={!!to} onPress={() => setPicker('to')} />
      </View>

      {active && (
        <T w={600} color={c.muted} style={{ fontSize: 12.5 }}>
          {resultCount} {resultCount === 1 ? 'match' : 'matches'}
        </T>
      )}

      <MonthPicker visible={picker === 'from'} title="From" onSelect={(ym) => selectMonth('from', ym)} onClose={() => setPicker(null)} />
      <MonthPicker visible={picker === 'to'} title="To" onSelect={(ym) => selectMonth('to', ym)} onClose={() => setPicker(null)} />
    </View>
  );
```

### What the list is a list of — `src/insights/search.js`

```js
  const { text, moods, from, to } = query;
  const needle = text ? normalize(text) : '';
  const moodSet = moods && moods.length ? new Set(moods) : null;

  return (entries || [])
    .filter(Boolean)
    .filter((e) => {
      if (needle) {
        const haystack = normalize(`${e.did || ''} ${e.wished || ''}`);
        if (!haystack.includes(needle)) return false;
      }
      if (moodSet && !(e.moods || []).some((m) => moodSet.has(m))) return false;
      if (from && e.dayKey < from) return false;
      if (to && e.dayKey > to) return false;
      return true;
    })
    .sort((a, b) => (a.dayKey < b.dayKey ? 1 : a.dayKey > b.dayKey ? -1 : 0));
}
```
