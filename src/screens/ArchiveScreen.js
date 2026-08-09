// ArchiveScreen.js — reflections list + heatmap. Ported from ArchiveScreen.

import React, { useState } from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import { useTheme } from '../theme';
import { T, Card } from '../ui';
import { moodEmoji } from '../data';
import { buildHeatmap } from '../home/calendar';
import { searchEntries } from '../insights/search';
import { moodFace, hashKey } from '../entries/moodFace';
import { useMoodTick } from '../ui/useMoodTick';
import ArchiveFilters from './ArchiveFilters';
import TipCard from './TipCard';

const EMPTY_QUERY = { text: '', moods: [], from: null, to: null };

export default function ArchiveScreen({ copy, mode, entries, onOpen, tip, onDismissTip, customMoods = [], customMoodEmoji = {} }) {
  const t = useTheme();
  const c = t.colors;
  const [query, setQuery] = useState(EMPTY_QUERY);
  const heat = buildHeatmap(entries);
  const results = searchEntries(entries, query);
  const filtering = !!(query.text || query.moods.length || query.from || query.to);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 26, gap: 18 }}
      showsVerticalScrollIndicator={false}
    >
      {tip && (
        <View style={{ paddingHorizontal: 20 }}>
          <TipCard title={tip.title} body={tip.body} onDismiss={() => onDismissTip(tip.id)} />
        </View>
      )}

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
          <Heat cells={heat} customMoodEmoji={customMoodEmoji} />
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
                    <T w={400} color={c.muted} style={{ fontSize: 13.5, lineHeight: 19.5 }} numberOfLines={2}>{e.did}</T>
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

function Heat({ cells, customMoodEmoji = {} }) {
  const t = useTheme();
  const c = t.colors;
  const enabled = React.useMemo(() => cells.some((cell) => (cell.moods || []).length > 1), [cells]);
  const seed = cells.length ? hashKey(cells[cells.length - 1].dayKey) : 0;
  const tick = useMoodTick({ enabled, seed });
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
                    ? <Text style={{ fontSize: 19, lineHeight: 23 }}>{moodEmoji(moodFace(cell.moods, tick, cell.dayKey), customMoodEmoji)}</Text>
                    : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}
