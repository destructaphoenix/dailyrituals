// src/dev/panel/NotifySection.js
// DEV-ONLY. The "Notifications" section of the dev harness (IMP-032 Part B):
// permission, the app's real reminder settings, actions, and — the actual
// point of this file — a diff between what schedule.js says *should* be
// pending (intent) and what expo-notifications says *is* pending (reality).
import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, Switch, Linking } from 'react-native';
import { useTheme } from '../../theme';
import { T } from '../../ui';
import * as notifyProbe from '../notifyProbe';
import { reminderCopy } from '../../content/reminders';
import { nextOccurrences, reminderRowValue, formatReminderTime } from '../../reminders/schedule';
import { describePending, diffIntendedVsPending } from '../inspectNotify';

function SectionLabel({ children }) {
  const c = useTheme().colors;
  return <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 20, marginBottom: 4 }}>{children}</T>;
}

function ActionRow({ label, hint, onPress, disabled }) {
  const c = useTheme().colors;
  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ paddingVertical: 8, opacity: disabled ? 0.4 : 1 }}>
      <T w={700} color={c.accentDeep} style={{ fontSize: 15 }}>{label}</T>
      {hint ? <T color={c.muted} style={{ fontSize: 11, marginTop: 2 }}>{hint}</T> : null}
    </Pressable>
  );
}

function ToggleRow({ label, value, onChange }) {
  const c = useTheme().colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15 }}>{label}</T>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
}

function StepRow({ label, value, onChange, wrap }) {
  const c = useTheme().colors;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
      <T w={700} color={c.ink} style={{ fontSize: 15 }}>{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Pressable onPress={() => onChange(wrap(value - 1))} hitSlop={10}><T w={800} color={c.accentDeep} style={{ fontSize: 22 }}>−</T></Pressable>
        <T w={700} color={c.ink} style={{ fontSize: 15, minWidth: 32, textAlign: 'center' }}>{String(value).padStart(2, '0')}</T>
        <Pressable onPress={() => onChange(wrap(value + 1))} hitSlop={10}><T w={800} color={c.accentDeep} style={{ fontSize: 22 }}>+</T></Pressable>
      </View>
    </View>
  );
}

const wrapHour = (v) => ((v % 24) + 24) % 24;
const wrapMinute = (v) => ((v % 60) + 60) % 60;

export default function NotifySection({ settings, setSettings, onRearmReminders, wroteToday = false }) {
  const c = useTheme().colors;
  const [permission, setPermission] = useState('undetermined');
  const [pending, setPending] = useState([]);
  const [busy, setBusy] = useState(false);

  // Never cache — re-read reality after every action, per the spec (rearmReminders
  // cancels-and-redoes on every foreground, so a stale read lies).
  const refresh = useCallback(async () => {
    const [perm, scheduled] = await Promise.all([notifyProbe.getPermission(), notifyProbe.listScheduled()]);
    setPermission(perm);
    setPending(describePending(scheduled, new Date()));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const run = useCallback(async (fn) => {
    setBusy(true);
    try { await fn(); } finally { await refresh(); setBusy(false); }
  }, [refresh]);

  const reminder = settings.reminder;
  const intended = reminder.enabled ? nextOccurrences(new Date(), reminder, { wroteToday, count: 7 }) : [];
  const diff = diffIntendedVsPending(intended, pending);

  return (
    <View>
      <SectionLabel>Notifications</SectionLabel>

      <ActionRow label={`Permission: ${permission}`} onPress={() => {}} disabled />
      {permission === 'undetermined' && (
        <ActionRow label="Request" onPress={() => run(() => notifyProbe.requestPermission())} disabled={busy} />
      )}
      <ActionRow label="Open OS settings" onPress={() => Linking.openSettings()} />

      <SectionLabel>Live reminder settings</SectionLabel>
      <ToggleRow
        label="Enabled"
        value={!!reminder.enabled}
        onChange={(v) => setSettings((s) => ({ ...s, reminder: { ...s.reminder, enabled: v } }))}
      />
      <StepRow
        label="Hour"
        value={reminder.hour}
        wrap={wrapHour}
        onChange={(h) => setSettings((s) => ({ ...s, reminder: { ...s.reminder, hour: h } }))}
      />
      <StepRow
        label="Minute"
        value={reminder.minute}
        wrap={wrapMinute}
        onChange={(m) => setSettings((s) => ({ ...s, reminder: { ...s.reminder, minute: m } }))}
      />

      <SectionLabel>Actions</SectionLabel>
      <ActionRow label="Re-arm now" onPress={() => run(onRearmReminders)} disabled={busy || !onRearmReminders} />
      <ActionRow label="Cancel all" onPress={() => run(() => notifyProbe.cancelAll())} disabled={busy} />
      <ActionRow
        label="Fire test in 10s"
        hint="rearmReminders cancels everything on the next foreground, and there's no setNotificationHandler yet, so foreground shows nothing — background the app within 10s to see it."
        onPress={() => run(() => notifyProbe.fireTestIn(10, reminderCopy(settings.tone)))}
        disabled={busy}
      />

      <SectionLabel>Intended vs pending</SectionLabel>
      <T color={c.ink} style={{ fontSize: 13 }}>
        matched {diff.matched.length} · missing {diff.missing.length} · extra {diff.extra.length}
      </T>
      {intended.map((d, i) => (
        <T key={`intended-${i}`} color={c.muted} style={{ fontSize: 12 }}>intended: {d.toISOString()}</T>
      ))}
      {pending.map((p, i) => (
        <T key={`pending-${i}`} color={c.muted} style={{ fontSize: 12 }}>pending: {p.inLabel} — {p.title}</T>
      ))}

      <SectionLabel>Row preview</SectionLabel>
      <T color={c.ink} style={{ fontSize: 13 }}>Off: {reminderRowValue({ enabled: false, hour: reminder.hour, minute: reminder.minute }, permission)}</T>
      <T color={c.ink} style={{ fontSize: 13 }}>
        Time ({formatReminderTime(reminder)}): {reminderRowValue({ enabled: true, hour: reminder.hour, minute: reminder.minute }, 'granted')}
      </T>
      <T color={c.ink} style={{ fontSize: 13 }}>Blocked: {reminderRowValue({ enabled: true, hour: reminder.hour, minute: reminder.minute }, 'denied')}</T>
    </View>
  );
}
