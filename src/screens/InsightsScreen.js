// InsightsScreen.js — stats, mood mix and weekday rhythm derived from real entries.

import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { ChartIcon } from '../icons';
import { moodEmoji } from '../data';
import { deriveInsights } from '../insights/derive';

export default function InsightsScreen({ copy, entries = [], streak = 0 }) {
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
            <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 2 }}>The shape of your days so far.</T>
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
          </Card>
        </View>
      </ScrollView>
    );
  }

  const { stats, moodMix, rhythm, peakWeekday } = data;
  const moodMax = moodMix.length ? Math.max(...moodMix.map((x) => x.n)) : 1;
  const rhythmMax = Math.max(1, ...rhythm.map((x) => x.n));

  const STATS = [
    { label: 'Current streak', value: String(stats.currentStreak), unit: 'days' },
    { label: 'Longest streak', value: String(stats.longestStreak), unit: 'days' },
    { label: 'Days kept', value: String(stats.daysKept), unit: 'total' },
    { label: 'This month', value: String(stats.thisMonth), unit: 'entries' },
  ];

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
          <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 2 }}>The shape of your days so far.</T>
        </View>
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <ChartIcon size={22} color={c.accentDeep} />
        </View>
      </View>

      {/* stat tiles 2×2 */}
      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {[STATS.slice(0, 2), STATS.slice(2, 4)].map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row', gap: 12 }}>
            {row.map((s) => (
              <Card key={s.label} style={{ flex: 1, padding: 16 }}>
                <T w={700} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.6, textTransform: 'uppercase' }}>{s.label}</T>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: 8 }}>
                  <T d w={800} color={c.accentDeep} style={{ fontSize: 34, lineHeight: 36 }}>{s.value}</T>
                  <T w={700} color={c.muted} style={{ fontSize: 13 }}>{s.unit}</T>
                </View>
              </Card>
            ))}
          </View>
        ))}
      </View>

      {/* mood mix */}
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 18 }}>
          <T d w={700} color={c.ink} style={{ fontSize: 17, marginBottom: 16 }}>Mood mix</T>
          {moodMix.length === 0 ? (
            <T w={600} color={c.muted} style={{ fontSize: 14 }}>No moods logged yet.</T>
          ) : (
            <View style={{ gap: 13 }}>
              {moodMix.map((x, i) => (
                <View key={x.m} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 84, flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    <Text style={{ fontSize: 15 }}>{moodEmoji(x.m)}</Text>
                    <T w={700} color={c.ink} style={{ fontSize: 13.5 }}>{x.m}</T>
                  </View>
                  <View style={{ flex: 1, height: 12, borderRadius: 999, backgroundColor: c.accentSoft, overflow: 'hidden' }}>
                    <View style={{
                      width: `${(x.n / moodMax) * 100}%`, height: '100%', borderRadius: 999,
                      backgroundColor: c.accent, opacity: 1 - i * 0.1,
                    }} />
                  </View>
                  <T w={700} color={c.muted} style={{ width: 18, fontSize: 12.5, textAlign: 'right' }}>{x.n}</T>
                </View>
              ))}
            </View>
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
    </ScrollView>
  );
}
