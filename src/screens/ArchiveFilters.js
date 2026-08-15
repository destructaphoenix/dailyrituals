// src/screens/ArchiveFilters.js — presentational search/filter bar for the
// Reflections tab (IMP-035). Props in, callbacks out: ArchiveScreen owns the
// query state and feeds it to searchEntries(). No date-picker library — a
// month list inside the app's existing Modal + Pressable-row sheet shape.
import React, { useState, useRef } from 'react';
import { View, TextInput, ScrollView, Pressable, Modal, Text } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { MOODS, moodEmoji } from '../data';
import { Close } from '../icons';
import { orderMoodChips } from '../entries/moodChipOrder';

function pad2(n) { return String(n).padStart(2, '0'); }

function monthLabel(year, month) {
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function lastDayOfMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function recentMonths(count = 24) {
  const now = new Date();
  const months = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }
  return months;
}

function MonthRow({ label, color, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ paddingHorizontal: 20, paddingVertical: 14, opacity: pressed ? 0.6 : 1 })}>
      <T w={600} color={color} style={{ fontSize: 15.5 }}>{label}</T>
    </Pressable>
  );
}

function MonthPicker({ visible, title, onSelect, onClose }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable onPress={() => {}} style={{ backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 24 }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 }}>
            <T d w={800} color={c.ink} style={{ fontSize: 18 }}>{title}</T>
          </View>
          <ScrollView>
            <MonthRow label="Any time" color={c.muted} onPress={() => onSelect(null)} />
            {recentMonths().map(({ year, month }) => (
              <MonthRow key={`${year}-${month}`} label={monthLabel(year, month)} color={c.ink} onPress={() => onSelect({ year, month })} />
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function DateButton({ label, active, onPress }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { flex: 1, paddingVertical: 11, borderRadius: t.radius.btn, borderWidth: 1.5, alignItems: 'center', opacity: pressed ? 0.7 : 1 },
        active ? { backgroundColor: c.accentSoft, borderColor: c.accent } : { backgroundColor: c.surface, borderColor: c.border },
      ]}
    >
      <T w={700} color={active ? c.accentDeep : c.muted} style={{ fontSize: 13.5 }}>{label}</T>
    </Pressable>
  );
}

function boundLabel(prefix, key) {
  if (!key) return prefix;
  const [y, m] = key.split('-').map(Number);
  return `${prefix}: ${monthLabel(y, m)}`;
}

export default function ArchiveFilters({ text, moods, from, to, onChange, resultCount, customMoods = [], customMoodEmoji = {} }) {
  const t = useTheme();
  const c = t.colors;
  const [picker, setPicker] = useState(null); // 'from' | 'to' | null
  const chipScroll = useRef(null);

  const toggleMood = (m) => {
    const selecting = !moods.includes(m);
    const next = selecting ? [...moods, m] : moods.filter((x) => x !== m);
    onChange({ text, moods: next, from, to });
    // The chip just jumped to the front of the row. If it was picked from deep in
    // the scroll, not following it there reads as the chip disappearing.
    if (selecting) chipScroll.current?.scrollTo({ x: 0, animated: true });
  };

  const selectMonth = (bound, ym) => {
    setPicker(null);
    if (!ym) {
      onChange({ text, moods, from: bound === 'from' ? null : from, to: bound === 'to' ? null : to });
      return;
    }
    const key = bound === 'from'
      ? `${ym.year}-${pad2(ym.month)}-01`
      : `${ym.year}-${pad2(ym.month)}-${pad2(lastDayOfMonth(ym.year, ym.month))}`;
    onChange({ text, moods, from: bound === 'from' ? key : from, to: bound === 'to' ? key : to });
  };

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

      <ScrollView ref={chipScroll} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
        {orderMoodChips([...MOODS, ...customMoods], moods).map((m) => {
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
}
