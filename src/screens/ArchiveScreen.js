// ArchiveScreen.js — reflections list + heatmap. Ported from ArchiveScreen.

import React from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { moodEmoji } from '../data';
import { buildHeatmap } from '../home/calendar';

export default function ArchiveScreen({ copy, gamify, mode, entries, onOpen }) {
  const t = useTheme();
  const c = t.colors;
  const heat = buildHeatmap(entries);

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

      {gamify && (
        <View style={{ paddingHorizontal: 20 }}>
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <T d w={700} color={c.ink} style={{ fontSize: 15 }}>Last 5 weeks</T>
              <T w={700} color={c.muted} style={{ fontSize: 12 }}>{entries.length} kept</T>
            </View>
            <Heat cells={heat} />
          </Card>
        </View>
      )}

      <View style={{ paddingHorizontal: 20, gap: 12 }}>
        {entries.map((e) => (
          <Pressable key={e.id} onPress={() => onOpen(e)}>
            {({ pressed }) => (
              <Card style={{ padding: 16, flexDirection: 'row', gap: 14, transform: [{ scale: pressed ? 0.99 : 1 }] }}>
                <View style={{ width: 46, alignItems: 'center' }}>
                  <T d w={800} color={c.accentDeep} style={{ fontSize: 22, lineHeight: 22 }}>{e.day}</T>
                  <T w={800} color={c.muted} style={{ fontSize: 11, textTransform: 'uppercase', marginTop: 2 }}>{e.mon}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T d w={700} color={c.ink} style={{ fontSize: 15, marginBottom: 3 }}>{e.wd}</T>
                  <T w={400} color={c.muted} style={{ fontSize: 13.5, lineHeight: 19.5 }} numberOfLines={2}>{e.did}</T>
                  {gamify && e.mood ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, marginTop: 8, paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, backgroundColor: c.accentSoft }}>
                      <Text style={{ fontSize: 12 }}>{moodEmoji(e.mood)}</Text>
                      <T w={800} color={c.accentDeep} style={{ fontSize: 11 }}>{e.mood}</T>
                    </View>
                  ) : null}
                </View>
              </Card>
            )}
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

function Heat({ cells }) {
  const t = useTheme();
  const c = t.colors;
  const rows = [];
  for (let r = 0; r < cells.length; r += 7) rows.push(cells.slice(r, r + 7));
  return (
    <View style={{ gap: 6 }}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 6 }}>
          {row.map((cell, i) => {
            const isBlank = cell.empty || cell.missed;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 1,
                  borderRadius: 11,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isBlank ? 'transparent' : c.accentSoft,
                  borderWidth: isBlank ? 1.5 : cell.today ? 2 : 0,
                  borderColor: isBlank ? c.border : c.accentDeep,
                  borderStyle: isBlank ? 'dashed' : 'solid',
                }}
              >
                {cell.missed
                  ? <Text style={{ fontSize: 19, lineHeight: 23 }}>💀</Text>
                  : !cell.empty
                    ? <Text style={{ fontSize: 19, lineHeight: 23 }}>{cell.emoji}</Text>
                    : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
