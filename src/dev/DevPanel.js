// src/dev/DevPanel.js
// DEV-ONLY. Reached only via a __DEV__-guarded require in RitualsApp, so this
// whole file (and its imports) is stripped from release bundles. SENTINEL is the
// marker the verification step greps for — it must be ABSENT from prod bundles.
import React, { useState } from 'react';
import { View, ScrollView, Pressable, Switch, Text } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { buildState } from './buildState';
import { SCENARIOS_LIST } from './scenarios';
import NotifySection from './panel/NotifySection';

const SENTINEL = 'DEV_HARNESS_SENTINEL_DO_NOT_SHIP';

const todayKey = () => new Date().toISOString().slice(0, 10);

const DEFAULT_KNOBS = {
  streak: 3, entryCount: 3, gaps: [], done: true, plus: false,
  embers: 0, palette: 'goldenhour', sky: 'classic', ownAll: false,
  tone: 'gentle', freezes: 0,
};

function Stepper({ label, value, onChange, step = 1 }) {
  const c = useTheme().colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15 }}>{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => onChange(Math.max(0, value - step))} hitSlop={10}>
          <T w={800} color={c.accentDeep} style={{ fontSize: 22 }}>−</T>
        </Pressable>
        <T w={700} color={c.ink} style={{ fontSize: 15, minWidth: 44, textAlign: 'center' }}>{value}</T>
        <Pressable onPress={() => onChange(value + step)} hitSlop={10}>
          <T w={800} color={c.accentDeep} style={{ fontSize: 22 }}>+</T>
        </Pressable>
      </View>
    </View>
  );
}

function Toggle({ label, value, onChange }) {
  const c = useTheme().colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15 }}>{label}</T>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

export default function DevPanel({ onLoadState, onResetFresh, onClose, settings, setSettings, onRearmReminders, wroteToday }) {
  const c = useTheme().colors;
  const [knobs, setKnobs] = useState(DEFAULT_KNOBS);
  const set = (patch) => setKnobs((k) => ({ ...k, ...patch }));

  return (
    <View testID={SENTINEL} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <T d w={800} color={c.ink} style={{ fontSize: 22 }}>Dev Harness</T>
        <Pressable onPress={onClose} hitSlop={12}><T w={800} color={c.accentDeep} style={{ fontSize: 16 }}>Close</T></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>Scenarios</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {SCENARIOS_LIST.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => set({ ...DEFAULT_KNOBS, ...s.knobs })}
              style={{ backgroundColor: c.accentSoft, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
            >
              <T w={700} color={c.accentDeep} style={{ fontSize: 13 }}>{s.label}</T>
            </Pressable>
          ))}
        </View>

        <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 4 }}>Knobs</T>
        <Stepper label="Streak" value={knobs.streak} onChange={(v) => set({ streak: v })} />
        <Stepper label="Entries" value={knobs.entryCount} onChange={(v) => set({ entryCount: v })} />
        <Stepper label="Embers" value={knobs.embers} step={50} onChange={(v) => set({ embers: v })} />
        <Stepper label="XP (0 = derive)" value={knobs.xp ?? 0} step={50} onChange={(v) => set({ xp: v === 0 ? undefined : v })} />
        <Stepper label="Freezes" value={knobs.freezes} onChange={(v) => set({ freezes: v })} />
        <Toggle label="Done today" value={knobs.done} onChange={(v) => set({ done: v })} />
        <Toggle label="Plus" value={knobs.plus} onChange={(v) => set({ plus: v })} />
        <Toggle label="Own all cosmetics" value={knobs.ownAll} onChange={(v) => set({ ownAll: v })} />

        <Pressable
          onPress={() => onLoadState(buildState(knobs, todayKey()))}
          style={{ backgroundColor: c.accentDeep, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 }}
        >
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Apply</Text>
        </Pressable>

        <Pressable onPress={onResetFresh} style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }}>
          <T w={700} color={c.red} style={{ fontSize: 15 }}>Reset to fresh</T>
        </Pressable>

        {settings && setSettings && (
          <NotifySection
            settings={settings}
            setSettings={setSettings}
            onRearmReminders={onRearmReminders}
            wroteToday={wroteToday}
          />
        )}
      </ScrollView>
    </View>
  );
}
