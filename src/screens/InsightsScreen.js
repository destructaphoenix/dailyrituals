// InsightsScreen.js — "Your record" (lifetime stats) + "Your patterns" (mood/rhythm).

import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { ChartIcon } from '../icons';
import { moodEmoji } from '../data';
import { deriveInsights } from '../insights/derive';
import { deriveLifetime } from '../insights/lifetime';
import { cellState, monthLabelsForRows } from '../insights/heatCells';
import { buildLifetimeHeatmap } from '../home/calendar';
import DeeperInsights from './DeeperInsights';

export default function InsightsScreen({ copy, entries = [], streak = 0, xp = 0, plus = false, plusEnabled = false, onOpenPaywall = () => {} }) {
  const t = useTheme();
  const c = t.colors;

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
  const heat = buildLifetimeHeatmap(entries);
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
              <LifetimeHeat rows={heat} />
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
                    <View style={{ minWidth: 84, flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                      <Text style={{ fontSize: 15 }}>{moodEmoji(x.m)}</Text>
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
        <DeeperInsights entries={entries} onOpenPaywall={onOpenPaywall} />
      ) : plusEnabled ? (
        <DeeperInsights entries={entries} onOpenPaywall={onOpenPaywall} locked />
      ) : null}
    </ScrollView>
  );
}

const LEGEND = [
  { state: 'done', label: 'kept' },
  { state: 'missed', label: 'missed' },
  { state: 'empty', label: 'not yet started' },
];

function heatCellStyle(state, c, today) {
  if (state === 'done') {
    return {
      backgroundColor: c.accent,
      borderWidth: today ? 2 : 0,
      borderColor: today ? c.accentDeep : 'transparent',
    };
  }
  if (state === 'missed') {
    return { backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.border };
  }
  if (state === 'empty') {
    return { backgroundColor: 'transparent', borderWidth: 1, borderColor: c.border, borderStyle: 'dashed' };
  }
  return { backgroundColor: 'transparent', borderWidth: 0, borderColor: 'transparent' };
}

function LifetimeHeat({ rows }) {
  const c = useTheme().colors;
  const monthLabels = monthLabelsForRows(rows);
  return (
    <View>
      <View style={{ gap: 4 }}>
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ width: 24 }}>
              <T w={700} color={c.muted} style={{ fontSize: 9.5 }}>{monthLabels[ri]}</T>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', gap: 4 }}>
              {row.map((cell, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 4,
                    ...heatCellStyle(cellState(cell), c, cell.today),
                  }}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 12, paddingLeft: 28 }}>
        {LEGEND.map((l) => (
          <View key={l.state} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 3, ...heatCellStyle(l.state, c, false) }} />
            <T w={600} color={c.muted} style={{ fontSize: 11 }}>{l.label}</T>
          </View>
        ))}
      </View>
    </View>
  );
}
