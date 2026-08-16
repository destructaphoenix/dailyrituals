// InsightsScreen.js — "Your record" (lifetime stats) + "Your patterns" (mood/rhythm).

import React from 'react';
import { View, ScrollView, Text, Pressable, useWindowDimensions } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { ChartIcon } from '../icons';
import { moodEmoji } from '../data';
import { deriveInsights } from '../insights/derive';
import { deriveLifetime } from '../insights/lifetime';
import { cellState, monthLabelsForRows, heatGutterWidth, HEAT_CELL_GAP } from '../insights/heatCells';
import { buildLifetimeHeatmap } from '../home/calendar';
import { entryForDayKey } from '../entries/find';
import { moodLabelWidth } from '../insights/moodMixLayout';
import DeeperInsights from './DeeperInsights';

export default function InsightsScreen({ copy, entries = [], streak = 0, xp = 0, plus = false, plusEnabled = false, onOpenPaywall = () => {}, onOpen = () => {}, customMoodEmoji = {}, frozenDays = [] }) {
  const t = useTheme();
  const c = t.colors;
  const { fontScale } = useWindowDimensions();
  const labelW = moodLabelWidth(fontScale);

  const data = deriveInsights(entries, streak);

  if (data.empty) {
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 26, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingHorizontal: 20, paddingTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <T d w={800} color={c.ink} style={{ fontSize: 24 }}>Insights</T>
            <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 2 }}>The record you&rsquo;re building.</T>
          </View>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <ChartIcon size={22} color={c.accentDeep} />
          </View>
        </View>
        <View style={{ paddingHorizontal: 20 }}>
          <Card style={{ padding: 24, alignItems: 'center' }}>
            <T w={600} color={c.muted} style={{ fontSize: 15, textAlign: 'center', lineHeight: 22 }}>
              No insights yet — write your first reflection and the shape of your days will appear here.
            </T>
            <T w={600} color={c.muted} style={{ fontSize: 15, textAlign: 'center', lineHeight: 22, marginTop: 8 }}>
              Your moods, your steadiest weekday and the whole shape of your record will appear here as you write.
            </T>
          </Card>
        </View>
      </ScrollView>
    );
  }

  const { moodMix, moodEntryCount, rhythm, peakWeekday } = data;
  const moodMax = moodMix.length ? Math.max(...moodMix.map((x) => x.n)) : 1;
  const rhythmMax = Math.max(1, ...rhythm.map((x) => x.n));

  const life = deriveLifetime(entries, { xp, currentStreak: streak });
  const heat = buildLifetimeHeatmap(entries, new Date(), { frozenDays });
  const fmt = (n) => n.toLocaleString();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 26, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <T d w={800} color={c.ink} style={{ fontSize: 24 }}>Insights</T>
          <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 2 }}>The record you&rsquo;re building.</T>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <ChartIcon size={22} color={c.accentDeep} />
        </View>
      </View>

      {/* Your record — the legacy/cumulative story */}
      <View style={{ paddingHorizontal: 20 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 10, marginLeft: 2 }}>Your record</T>
        <Card style={{ padding: 20 }}>
          {/* hero number */}
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <T d w={800} color={c.accentDeep} style={{ fontSize: 56, lineHeight: 60 }}>{fmt(life.daysRemembered)}</T>
            <T w={700} color={c.ink} style={{ fontSize: 15, marginTop: 2 }}>days remembered</T>
            <T w={600} color={c.muted} style={{ fontSize: 12.5, marginTop: 4 }}>
              Lv {life.level} · {life.levelName}{life.activeSpan ? ` · ${life.activeSpan}` : ''} · {fmt(life.xpEarned)} XP
            </T>
          </View>

          {/* totals grid 2×2 */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              { label: 'Entries', value: fmt(life.totalEntries) },
              { label: 'Words', value: fmt(life.totalWords) },
              { label: 'Current streak', value: fmt(life.currentStreak) },
              { label: 'Longest streak', value: fmt(life.longestStreak) },
            ].map((s, i) => (
              <View key={s.label} style={{ width: '50%', paddingVertical: 10, paddingRight: i % 2 === 0 ? 8 : 0 }}>
                <T w={700} color={c.muted} style={{ fontSize: 11.5, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}</T>
                <T d w={800} color={c.ink} style={{ fontSize: 24, lineHeight: 28, marginTop: 3 }}>{s.value}</T>
              </View>
            ))}
          </View>

          {/* adaptive consistency heatmap */}
          {heat.length > 0 && (
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: c.border }}>
              <T w={700} color={c.muted} style={{ fontSize: 11.5, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 }}>Consistency</T>
              <LifetimeHeat rows={heat} entries={entries} onOpen={onOpen} />
            </View>
          )}
        </Card>
      </View>

      {/* Your patterns — the existing analytical cards */}
      <View style={{ paddingHorizontal: 20, marginBottom: -6 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginLeft: 2 }}>Your patterns</T>
      </View>

      {/* mood mix */}
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 18 }}>
          <T d w={700} color={c.ink} style={{ fontSize: 17 }}>Mood mix</T>
          {moodMix.length === 0 ? (
            <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 16 }}>No moods logged yet.</T>
          ) : (
            <>
              <T w={600} color={c.muted} style={{ fontSize: 12, marginTop: 2, marginBottom: 14 }}>
                across {moodEntryCount} reflections
              </T>
              <View style={{ gap: 13 }}>
                {moodMix.map((x, i) => (
                  <View key={x.m} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{ width: labelW, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                      <Text style={{ fontSize: 15 }}>{moodEmoji(x.m, customMoodEmoji)}</Text>
                      <T w={700} color={c.ink} numberOfLines={1} style={{ fontSize: 13.5, flexShrink: 1 }}>{x.m}</T>
                    </View>
                    <View style={{ flex: 1, height: 12, borderRadius: 999, backgroundColor: c.accentSoft, overflow: 'hidden' }}>
                      <View style={{
                        width: `${(x.n / moodMax) * 100}%`, height: '100%', borderRadius: 999,
                        backgroundColor: c.accent, opacity: 1 - i * 0.1,
                      }} />
                    </View>
                    <T w={700} color={c.muted} style={{ minWidth: 18, fontSize: 12.5, textAlign: 'right' }}>{x.n}</T>
                  </View>
                ))}
              </View>
            </>
          )}
        </Card>
      </View>

      {/* weekday rhythm */}
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <T d w={700} color={c.ink} style={{ fontSize: 17 }}>Weekly rhythm</T>
            {peakWeekday ? (
              <T w={700} color={c.muted} style={{ fontSize: 12.5 }}>{peakWeekday}s win</T>
            ) : null}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 8 }}>
            {rhythm.map((d, i) => {
              const peak = d.n === rhythmMax && d.n > 0;
              return (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                  <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end' }}>
                    <View style={{
                      height: `${(d.n / rhythmMax) * 100}%`,
                      borderRadius: 8,
                      backgroundColor: peak ? c.accent : c.accentSoft,
                      borderWidth: peak ? 0 : 1,
                      borderColor: c.border,
                    }} />
                  </View>
                  <T w={800} color={peak ? c.accentDeep : c.muted} style={{ fontSize: 11 }}>{d.l}</T>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      {/* Deeper — the analysis layer (IMP-047, PLUS_PERKS #5) */}
      {plus ? (
        <DeeperInsights entries={entries} onOpenPaywall={onOpenPaywall} customMoodEmoji={customMoodEmoji} />
      ) : plusEnabled ? (
        <DeeperInsights entries={entries} onOpenPaywall={onOpenPaywall} locked customMoodEmoji={customMoodEmoji} />
      ) : null}
    </ScrollView>
  );
}

// Three entries, and three is the ceiling: the card is 280dp wide on a 360dp
// phone (screen paddingHorizontal 20 + Card padding 20, both sides) and these
// three plus the indent measure ~250dp. A fourth ("not yet started", ~94dp) is a
// guaranteed wrap at any font scale — which is exactly what WALK-09 saw. That
// state is shown in-cell instead now; see heatCellStyle's `empty` branch.
// Do not re-add it here. (IMP-073)
export const LEGEND = [
  { state: 'done', label: 'kept' },
  { state: 'frozen', label: 'a candle kept it' },
  { state: 'missed', label: 'missed' },
];

// Geometry must NOT vary by cell state: Android strokes a rounded border half
// OUTSIDE the bounds, so a bordered cell occupies ~1dp more in each direction
// than an unbordered one and reads as a bigger block, breaking the grid rhythm.
// This comment predates IMP-073; the code did not keep the rule — `done` was the
// one state at borderWidth 0, so every kept day rendered slightly small. Every
// state now returns borderWidth: 1, and the ones that show no ring return a
// transparent one (the background paints beneath it, so nothing looks different —
// it only measures the same). Today is marked by an inset ring child instead.
export function heatCellStyle(state, c) {
  if (state === 'done') {
    return { backgroundColor: c.accent, borderWidth: 1, borderColor: 'transparent' };
  }
  if (state === 'frozen') {
    // Same fill as missed, ringed in accentDeep: a day that was held, not lost.
    return { backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentDeep };
  }
  if (state === 'missed') {
    return { backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.border };
  }
  if (state === 'empty') {
    // Days before the first entry. Deliberately the quietest thing on the grid,
    // and deliberately NOT in the legend (IMP-073): a faint blank tile in a grid
    // where filled means "kept" needs no key. The old dashed outline read as a
    // state to decode — and Android renders a dashed border with borderRadius
    // inconsistently anyway. Do not restore borderStyle here.
    return { backgroundColor: c.ghostBtn, borderWidth: 1, borderColor: 'transparent' };
  }
  return { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'transparent' };
}

function LifetimeHeat({ rows, entries, onOpen }) {
  const c = useTheme().colors;
  // LifetimeHeat is its own component, so it reads the scale itself rather than
  // taking a prop — InsightsScreen's own `fontScale` is not in scope here.
  const { fontScale } = useWindowDimensions();
  const gutter = heatGutterWidth(fontScale);
  const monthLabels = monthLabelsForRows(rows);
  return (
    <View>
      <View style={{ gap: HEAT_CELL_GAP }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', alignItems: 'center', gap: HEAT_CELL_GAP }}>
            <View style={{ width: gutter }}>
              <T w={700} color={c.muted} numberOfLines={1} ellipsizeMode="clip" style={{ fontSize: 9.5 }}>{monthLabels[ri]}</T>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', gap: HEAT_CELL_GAP }}>
              {row.map((cell, i) => {
                const state = cellState(cell);
                const pressable = state === 'done';
                const cellStyle = {
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 4,
                  ...heatCellStyle(state, c),
                };
                const ring = state === 'done' && cell.today ? (
                  <View
                    pointerEvents="none"
                    accessibilityElementsHidden
                    importantForAccessibility="no-hide-descendants"
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: 2,
                      right: 2,
                      bottom: 2,
                      borderRadius: 2,
                      borderWidth: 1.5,
                      borderColor: c.accentDeep,
                    }}
                  />
                ) : null;
                if (!pressable) {
                  return <View key={i} style={cellStyle}>{ring}</View>;
                }
                const label = `${cell.dayKey}, ${(cell.moods || []).join(', ') || 'no mood recorded'}`;
                return (
                  <Pressable
                    key={i}
                    hitSlop={3}
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    onPress={() => {
                      const e = entryForDayKey(entries, cell.dayKey);
                      if (e) onOpen(e);
                    }}
                    style={({ pressed }) => [cellStyle, { transform: [{ scale: pressed ? 0.92 : 1 }] }]}
                  >
                    {ring}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 8, marginTop: 12, paddingLeft: gutter + HEAT_CELL_GAP }}>
        {LEGEND.map((l) => (
          <View key={l.state} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 3, ...heatCellStyle(l.state, c) }} />
            <T w={600} color={c.muted} style={{ fontSize: 11 }}>{l.label}</T>
          </View>
        ))}
      </View>
    </View>
  );
}
