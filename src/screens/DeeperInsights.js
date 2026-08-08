// DeeperInsights.js — "Deeper" section on the Insights tab (IMP-047, PLUS_PERKS #5).
// Mood by weekday, by season, and which moods travel together — over IMP-037's
// mood arrays. Presentational: reuses InsightsScreen's existing bar shapes.

import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { Sun } from '../icons';
import { moodEmoji } from '../data';
import { moodByWeekday, moodByMonth, moodPairings, hasEnoughFor } from '../insights/deeper';

const NOT_ENOUGH = 'Not enough days yet — this fills in as you write.';

export default function DeeperInsights({ entries = [], onOpenPaywall, locked = false }) {
  const t = useTheme();
  const c = t.colors;

  if (locked) {
    return (
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Sun size={14} color={c.accentDeep} />
            </View>
            <T d w={700} color={c.ink} style={{ fontSize: 17 }}>Deeper</T>
          </View>
          <T w={600} color={c.muted} style={{ fontSize: 13.5, lineHeight: 19, marginBottom: 14 }}>
            Moods by weekday, by season, and which ones show up together — over your own history.
          </T>
          <Pressable
            onPress={onOpenPaywall}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              paddingVertical: 10, borderRadius: 999, backgroundColor: c.accentSoft, opacity: pressed ? 0.7 : 1,
            })}
          >
            <Sun size={13} color={c.accentDeep} />
            <T w={800} color={c.accentDeep} style={{ fontSize: 13 }}>Unlock with Plus</T>
          </Pressable>
        </Card>
      </View>
    );
  }

  const weekday = moodByWeekday(entries);
  const months = moodByMonth(entries).filter((m) => m.total > 0);
  const pairings = moodPairings(entries);

  const weekdayReady = hasEnoughFor('weekday', entries);
  const monthReady = hasEnoughFor('month', entries);
  const pairingsReady = hasEnoughFor('pairings', entries);

  const weekdayMax = Math.max(1, ...weekday.map((b) => b.n));
  const pairMax = pairings.length ? Math.max(...pairings.map((p) => p.n)) : 1;

  return (
    <>
      <View style={{ paddingHorizontal: 20, marginBottom: -6 }}>
        <T d w={700} color={c.ink} style={{ fontSize: 15, marginLeft: 2 }}>Deeper</T>
      </View>

      {/* mood by weekday */}
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 18 }}>
          <T d w={700} color={c.ink} style={{ fontSize: 17 }}>Moods by weekday</T>
          {!weekdayReady ? (
            <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 16 }}>{NOT_ENOUGH}</T>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, gap: 8, marginTop: 16 }}>
              {weekday.map((d, i) => (
                <View key={i} style={{ flex: 1, alignItems: 'center', gap: 8 }}>
                  <View style={{ flex: 1, width: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <View style={{
                      height: `${(d.n / weekdayMax) * 100}%`,
                      width: '100%',
                      borderRadius: 8,
                      backgroundColor: d.top ? c.accent : c.accentSoft,
                      borderWidth: d.top ? 0 : 1,
                      borderColor: c.border,
                    }} />
                  </View>
                  <Text style={{ fontSize: 13 }}>{d.top ? moodEmoji(d.top) : ''}</Text>
                  <T w={800} color={c.muted} style={{ fontSize: 11 }}>{d.l}</T>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>

      {/* mood by season (month) */}
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 18 }}>
          <T d w={700} color={c.ink} style={{ fontSize: 17 }}>Moods by season</T>
          {!monthReady ? (
            <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 16 }}>{NOT_ENOUGH}</T>
          ) : (
            <View style={{ gap: 10, marginTop: 14 }}>
              {months.map((m) => (
                <View key={m.month} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <T w={700} color={c.ink} style={{ width: 84, fontSize: 13 }}>{m.month}</T>
                  <T w={600} color={c.muted} numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
                    {m.moods.slice(0, 3).map((x) => `${moodEmoji(x.m)} ${x.m}`).join('  ·  ')}
                  </T>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>

      {/* mood pairings */}
      <View style={{ paddingHorizontal: 20 }}>
        <Card style={{ padding: 18 }}>
          <T d w={700} color={c.ink} style={{ fontSize: 17 }}>Moods that travel together</T>
          {!pairingsReady ? (
            <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 16 }}>{NOT_ENOUGH}</T>
          ) : (
            <View style={{ gap: 13, marginTop: 14 }}>
              {pairings.slice(0, 6).map((p, i) => (
                <View key={`${p.a}|${p.b}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ minWidth: 120, flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <Text style={{ fontSize: 14 }}>{moodEmoji(p.a)}</Text>
                    <T w={700} color={c.ink} numberOfLines={1} style={{ fontSize: 13, flexShrink: 1 }}>{p.a} + {p.b}</T>
                    <Text style={{ fontSize: 14 }}>{moodEmoji(p.b)}</Text>
                  </View>
                  <View style={{ flex: 1, height: 12, borderRadius: 999, backgroundColor: c.accentSoft, overflow: 'hidden' }}>
                    <View style={{
                      width: `${(p.n / pairMax) * 100}%`, height: '100%', borderRadius: 999,
                      backgroundColor: c.accent, opacity: 1 - i * 0.08,
                    }} />
                  </View>
                  <T w={700} color={c.muted} style={{ minWidth: 18, fontSize: 12.5, textAlign: 'right' }}>{p.n}</T>
                </View>
              ))}
            </View>
          )}
        </Card>
      </View>
    </>
  );
}
