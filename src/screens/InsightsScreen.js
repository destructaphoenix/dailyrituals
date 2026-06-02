// InsightsScreen.js — stats, mood mix and weekday rhythm. New tab.
// Numbers are illustrative sample data; wire to your store to make them live.

import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { ChartIcon } from '../icons';
import { moodEmoji } from '../data';

const STATS = [
  { label: 'Current streak', value: '4', unit: 'days' },
  { label: 'Longest streak', value: '21', unit: 'days' },
  { label: 'Days kept', value: '47', unit: 'total' },
  { label: 'This month', value: '12', unit: 'entries' },
];

const MOOD_MIX = [
  { m: 'Tender', n: 9 },
  { m: 'Proud', n: 7 },
  { m: 'Grateful', n: 6 },
  { m: 'Restless', n: 5 },
  { m: 'Tired', n: 4 },
  { m: 'Hopeful', n: 3 },
];

// entries written on each weekday (Mon..Sun)
const RHYTHM = [
  { l: 'M', n: 6 }, { l: 'T', n: 5 }, { l: 'W', n: 7 }, { l: 'T', n: 6 },
  { l: 'F', n: 8 }, { l: 'S', n: 9 }, { l: 'S', n: 7 },
];

export default function InsightsScreen({ copy }) {
  const t = useTheme();
  const c = t.colors;
  const moodMax = Math.max(...MOOD_MIX.map((x) => x.n));
  const rhythmMax = Math.max(...RHYTHM.map((x) => x.n));

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
          <View style={{ gap: 13 }}>
            {MOOD_MIX.map((x, i) => (
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
        </Card>
      </View>

      {/* weekday rhythm */}
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <T d w={700} color={c.ink} style={{ fontSize: 17 }}>Weekly rhythm</T>
            <T w={700} color={c.muted} style={{ fontSize: 12.5 }}>Saturdays win</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 8 }}>
            {RHYTHM.map((d, i) => {
              const peak = d.n === rhythmMax;
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
