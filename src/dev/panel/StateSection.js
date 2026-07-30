// src/dev/panel/StateSection.js
// DEV-ONLY. Every persisted + settings key from buildState.js, reachable from
// a real control (IMP-032 Parts A + E) — Part A only wired the pure knob
// layer; this is where every knob in that table gets an actual UI control.
// Apply/Reset both write a recovery copy FIRST and only proceed if that
// succeeds — mirroring runConfirmedImport's guarantee (backup/importFlow.js)
// so the harness is never the one tool that can silently eat a real journal.
import React, { useState } from 'react';
import { View, Pressable, Alert, Text } from 'react-native';
import { useTheme } from '../../theme';
import { T } from '../../ui';
import { buildState } from '../buildState';
import { SCENARIOS_LIST } from '../scenarios';
import { SHOP_PALETTES, SHOP_SKIES } from '../../data';
import { Stepper, Toggle, Segmented, TextField } from './controls';
import * as backupIO from '../../backup/io';
import { createBackup } from '../../backup/backup';
import { SENTINEL } from '../sentinel';

export const DEV_ID = `${SENTINEL}/panel/StateSection`;

const todayKey = () => new Date().toISOString().slice(0, 10);

const DEFAULT_KNOBS = {
  streak: 3, entryCount: 3, gaps: 'none', done: true, plus: false,
  embers: 0, palette: 'goldenhour', sky: 'classic', ownAll: false,
  tone: 'gentle', freezes: 0, xp: undefined,
  mode: 'day', name: '', endOffset: 0, lastBackupAt: 0,
  subCanceled: false, plan: undefined,
  reminderEnabled: false, reminderHour: 20, reminderMinute: 30,
  storePurchase: 'success', storeRestore: 'empty',
  headlineFont: 'Quicksand', roundness: 1, textLength: 'short',
};

// Module-level memo (never persisted) — survives closing the modal so ~25
// controls don't reset every time the harness is reopened.
let lastKnobs = DEFAULT_KNOBS;

const wrapHour = (v) => ((v % 24) + 24) % 24;
const wrapMinute = (v) => ((v % 60) + 60) % 60;

function SectionLabel({ children }) {
  const c = useTheme().colors;
  return <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 20, marginBottom: 4 }}>{children}</T>;
}

export default function StateSection({ onLoadState, onResetFresh, getSlice, appVersion }) {
  const c = useTheme().colors;
  const [knobs, setKnobs] = useState(lastKnobs);
  const set = (patch) => setKnobs((k) => {
    const next = { ...k, ...patch };
    lastKnobs = next;
    return next;
  });

  // Recovery copy FIRST, destructive action only if that write succeeds.
  const withRecoveryCopy = async (action) => {
    try {
      await backupIO.writeRecovery(JSON.stringify(createBackup(getSlice(), { appVersion })));
    } catch (e) {
      Alert.alert("Couldn't apply", 'The safety recovery copy failed to save, so nothing was changed.');
      return;
    }
    action();
  };

  const confirmApply = () => Alert.alert(
    'Load this state?',
    'This replaces your current journal on this device. A recovery copy is saved first.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Apply', style: 'destructive', onPress: () => withRecoveryCopy(() => onLoadState(buildState(knobs, todayKey()))) },
    ]
  );

  const confirmReset = () => Alert.alert(
    'Reset to fresh?',
    'This erases your current journal on this device and starts clean. A recovery copy is saved first.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => withRecoveryCopy(onResetFresh) },
    ]
  );

  return (
    <View>
      <SectionLabel>Scenarios</SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
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

      <SectionLabel>Journal</SectionLabel>
      <Segmented label="Mode" value={knobs.mode} options={['day', 'night']} onChange={(mode) => set({ mode })} />
      <TextField label="Name" value={knobs.name} onChange={(name) => set({ name })} placeholder="(none)" />
      <Stepper label="Streak" value={knobs.streak} onChange={(v) => set({ streak: v })} />
      <Stepper label="Entries" value={knobs.entryCount} onChange={(v) => set({ entryCount: v })} />
      <Stepper label="End offset (days ago)" value={knobs.endOffset} onChange={(v) => set({ endOffset: v })} />
      <Segmented label="Gaps (skull days)" value={knobs.gaps} options={['none', 'one', 'scattered']} onChange={(gaps) => set({ gaps })} />
      <Toggle label="Done today" value={knobs.done} onChange={(v) => set({ done: v })} />
      <Segmented label="Entry text length" value={knobs.textLength} options={['short', 'long']} onChange={(textLength) => set({ textLength })} />

      <SectionLabel>Progress / economy</SectionLabel>
      <Stepper label="XP (0 = derive)" value={knobs.xp ?? 0} step={50} onChange={(v) => set({ xp: v === 0 ? undefined : v })} />
      <Stepper label="Embers" value={knobs.embers} step={50} onChange={(v) => set({ embers: v })} />
      <Stepper label="Freezes" value={knobs.freezes} onChange={(v) => set({ freezes: v })} />
      <Toggle label="Plus" value={knobs.plus} onChange={(v) => set({ plus: v })} />
      <Segmented
        label="Plan"
        value={knobs.plan}
        options={[{ value: undefined, label: 'auto' }, { value: 'monthly', label: 'monthly' }, { value: 'yearly', label: 'yearly' }]}
        onChange={(plan) => set({ plan })}
      />
      <Toggle label="Subscription canceled" value={knobs.subCanceled} onChange={(v) => set({ subCanceled: v })} />

      <SectionLabel>Cosmetics</SectionLabel>
      <Toggle label="Own all cosmetics" value={knobs.ownAll} onChange={(v) => set({ ownAll: v })} />
      <Segmented label="Palette" value={knobs.palette} options={SHOP_PALETTES.map((p) => ({ value: p.id, label: p.name }))} onChange={(palette) => set({ palette })} />
      <Segmented label="Sky" value={knobs.sky} options={SHOP_SKIES.map((s) => ({ value: s.id, label: s.name }))} onChange={(sky) => set({ sky })} />
      <Segmented label="Tone" value={knobs.tone} options={['gentle', 'playful']} onChange={(tone) => set({ tone })} />

      <SectionLabel>Appearance</SectionLabel>
      <Segmented label="Headline font" value={knobs.headlineFont} options={['Baloo 2', 'Quicksand', 'Fredoka']} onChange={(headlineFont) => set({ headlineFont })} />
      <Stepper
        label="Roundness"
        value={knobs.roundness}
        step={0.2}
        min={0.6}
        onChange={(v) => set({ roundness: Math.round(Math.min(1.4, Math.max(0.6, v)) * 10) / 10 })}
      />

      <SectionLabel>Reminder</SectionLabel>
      <Toggle label="Enabled" value={knobs.reminderEnabled} onChange={(v) => set({ reminderEnabled: v })} />
      <Stepper label="Hour" value={knobs.reminderHour} onChange={(v) => set({ reminderHour: wrapHour(v) })} />
      <Stepper label="Minute" value={knobs.reminderMinute} onChange={(v) => set({ reminderMinute: wrapMinute(v) })} />

      <SectionLabel>Store simulation</SectionLabel>
      <Segmented label="Purchase result" value={knobs.storePurchase} options={['success', 'cancel', 'failed', 'network', 'owned']} onChange={(storePurchase) => set({ storePurchase })} />
      <Segmented label="Restore result" value={knobs.storeRestore} options={['empty', 'found']} onChange={(storeRestore) => set({ storeRestore })} />

      <SectionLabel>Backup</SectionLabel>
      <Stepper label="Last backup (days ago, -1 = never)" value={knobs.lastBackupAt} min={-1} onChange={(v) => set({ lastBackupAt: v })} />

      <Pressable onPress={confirmApply} style={{ backgroundColor: c.accentDeep, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 24 }}>
        <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Apply</Text>
      </Pressable>
      <Pressable onPress={confirmReset} style={{ paddingVertical: 14, alignItems: 'center', marginTop: 8 }}>
        <T w={700} color={c.red} style={{ fontSize: 15 }}>Reset to fresh</T>
      </Pressable>
    </View>
  );
}
