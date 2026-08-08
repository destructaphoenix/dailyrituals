// AnnualRecap.js — "your year, remembered" (IMP-046, PLUS_PERKS #4).
// Presentational: takes a built `recap` (src/recap/annualRecap.js) and
// renders it. One page per completed year — days, words, longest streak,
// top moods, busiest/quietest months, and the milestone timeline that
// IMP-021 deliberately deferred to "roadmap piece C". This is that piece.

import React from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { Chevron, Sun } from '../icons';
import { moodEmoji } from '../data';

const MONTHS_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Parse a 'YYYY-MM-DD' dayKey as a local date (avoids UTC off-by-one), same
// convention as insights/deeper.js.
function localDate(dayKey) {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function shortDate(dayKey) {
  const d = localDate(dayKey);
  return `${MONTHS_ABBR[d.getMonth()]} ${d.getDate()}`;
}

export default function AnnualRecap({ recap, onClose, insets }) {
  const t = useTheme();
  const c = t.colors;
  const fmt = (n) => n.toLocaleString();

  if (!recap) return null;

  const moodMax = recap.topMoods.length ? Math.max(...recap.topMoods.map((x) => x.n)) : 1;

  return (
    <View style={{ flex: 1, backgroundColor: c.cream, paddingTop: insets?.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 6 }}>
        <Pressable onPress={onClose} hitSlop={8}
          style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: c.ghostBtn, opacity: pressed ? 0.6 : 1 })}>
          <Chevron dir="left" size={22} color={c.ink} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: c.accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
          <Sun size={11} color={c.accentDeep} />
          <T w={800} color={c.accentDeep} style={{ fontSize: 12 }}>Plus</T>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 + (insets?.bottom || 0), gap: 18 }} showsVerticalScrollIndicator={false}>
        <View>
          <T d w={800} color={c.ink} style={{ fontSize: 26, marginTop: 6 }}>Your {recap.year}, remembered</T>
          <T w={600} color={c.muted} style={{ fontSize: 14, marginTop: 4, lineHeight: 20 }}>
            {shortDate(recap.firstEntry)} – {shortDate(recap.lastEntry)}
          </T>
        </View>

        {/* hero + totals */}
        <Card style={{ padding: 20 }}>
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <T d w={800} color={c.accentDeep} style={{ fontSize: 56, lineHeight: 60 }}>{fmt(recap.daysRemembered)}</T>
            <T w={700} color={c.ink} style={{ fontSize: 15, marginTop: 2 }}>days remembered</T>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              { label: 'Words', value: fmt(recap.totalWords) },
              { label: 'Longest streak', value: fmt(recap.longestStreak) },
              { label: 'Busiest month', value: recap.peakMonth },
              { label: 'Quietest month', value: recap.quietestMonth },
            ].map((s, i) => (
              <View key={s.label} style={{ width: '50%', paddingVertical: 10, paddingRight: i % 2 === 0 ? 8 : 0 }}>
                <T w={700} color={c.muted} style={{ fontSize: 11.5, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}</T>
                <T d w={800} color={c.ink} numberOfLines={1} style={{ fontSize: 22, lineHeight: 26, marginTop: 3 }}>{s.value}</T>
              </View>
            ))}
          </View>
        </Card>

        {/* top moods */}
        {recap.topMoods.length > 0 && (
          <Card style={{ padding: 18 }}>
            <T d w={700} color={c.ink} style={{ fontSize: 17, marginBottom: 14 }}>Top moods</T>
            <View style={{ gap: 13 }}>
              {recap.topMoods.map((x, i) => (
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
          </Card>
        )}

        {/* milestone timeline — where IMP-021's deferred timeline lives */}
        {recap.milestones.length > 0 && (
          <Card style={{ padding: 18 }}>
            <T d w={700} color={c.ink} style={{ fontSize: 17, marginBottom: 14 }}>The year, marked</T>
            <View style={{ gap: 14 }}>
              {recap.milestones.map((m, i) => (
                <View key={`${m.day}-${i}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.accent }} />
                  <T w={700} color={c.muted} style={{ width: 54, fontSize: 12.5 }}>{shortDate(m.day)}</T>
                  <T w={600} color={c.ink} numberOfLines={1} style={{ flex: 1, fontSize: 13.5 }}>{m.label}</T>
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
