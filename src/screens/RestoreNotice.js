// screens/RestoreNotice.js — one-time notice for IMP-029: tells the user their
// data was restored from a Google Auto Backup and how old it is, with a
// one-tap route into the existing manual restore. Presentational only —
// RitualsApp owns visibility + the actions (see restoreDetect.js for detection).
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton, GhostButton } from '../ui';
import { Restore } from '../icons';
import { formatBackupDate } from '../persistence/restoreDetect';

export default function RestoreNotice({ restoredAtMs, onGotIt, onRestoreFile }) {
  const t = useTheme();
  const c = t.colors;
  if (!restoredAtMs) return null;
  const dateLabel = formatBackupDate(restoredAtMs);

  const scrim = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 32, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: c.scrim };
  const card = [{ width: '100%', maxWidth: 340, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: t.radius.card, padding: 26, alignItems: 'center' }, t.shadow(30, '#000', 0.45)];

  return (
    <View style={scrim}>
      <View style={card}>
        <View style={[{ width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 18, backgroundColor: c.accentSoft }]}>
          <Restore size={26} color={c.accentDeep} />
        </View>
        <T d w={800} color={c.ink} style={{ fontSize: 22, lineHeight: 26, textAlign: 'center' }}>Welcome back.</T>
        <T w={600} color={c.muted} style={{ fontSize: 14.5, lineHeight: 21, textAlign: 'center', marginTop: 9 }}>
          {dateLabel
            ? `Your journal was restored from your Google backup, saved ${dateLabel}. Anything written after that isn't here.`
            : "Your journal was restored from your Google backup. Anything written since isn't here."}
        </T>
        <View style={{ width: '100%', gap: 9, marginTop: 22 }}>
          <PrimaryButton label="Got it" onPress={onGotIt} />
          <GhostButton label="Restore from a file" onPress={onRestoreFile} />
        </View>
      </View>
    </View>
  );
}
