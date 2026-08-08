// screens/RestoreOffer.js — IMP-033: offers a quarantined OS-restored backup
// once onboarding is done, instead of imposing it. Presentational only —
// RitualsApp owns visibility + the actions (see restoreQuarantine.js for the
// pure decisions this reads: preferredSource, pendingRestoreInventory).
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme';
import { T, PrimaryButton, GhostButton } from '../ui';
import { Restore } from '../icons';
import { formatBackupDate } from '../persistence/restoreDetect';
import { preferredSource, pendingRestoreInventory } from '../persistence/restoreQuarantine';

export default function RestoreOffer({ stash, onLoad, onRestoreFile, onKeepFreshStart }) {
  const t = useTheme();
  const c = t.colors;
  if (!stash) return null;

  const dateLabel = formatBackupDate(stash.lastSavedAt);
  const inventory = pendingRestoreInventory(stash);
  const fileIsNewer = preferredSource({ lastSavedAt: stash.lastSavedAt, lastBackupAt: stash.lastBackupAt }) === 'file';
  const exportDateLabel = stash.lastBackupAt ? formatBackupDate(new Date(stash.lastBackupAt).getTime()) : '';

  const scrim = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 32, alignItems: 'center', justifyContent: 'center', padding: 30, backgroundColor: c.scrim };
  const card = [{ width: '100%', maxWidth: 360, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: t.radius.card, padding: 26, alignItems: 'center' }, t.shadow(30, '#000', 0.45)];

  return (
    <View style={scrim}>
      <View style={card}>
        <View style={[{ width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 18, backgroundColor: c.accentSoft }]}>
          <Restore size={26} color={c.accentDeep} />
        </View>
        <T d w={800} color={c.ink} style={{ fontSize: 22, lineHeight: 26, textAlign: 'center' }}>We found your journal.</T>
        <T w={600} color={c.muted} style={{ fontSize: 14.5, lineHeight: 21, textAlign: 'center', marginTop: 9 }}>
          {dateLabel
            ? `Your journal was backed up to your Google account on ${dateLabel}. You can load it now.`
            : 'Your journal was backed up to your Google account. You can load it now.'}
        </T>

        <View style={{ width: '100%', gap: 7, marginTop: 16 }}>
          <Warning c={c} text="It replaces everything you've just set up — your name, theme, and anything written since installing." />
          <Warning c={c} text={dateLabel
            ? `It's from ${dateLabel} — anything written after that isn't in it.`
            : "It's from an earlier backup — anything written after that isn't in it."} />
          {!!inventory && (
            <Warning c={c} text={`Includes ${inventory} — these can't be recovered again if you skip this now.`} />
          )}
          {fileIsNewer && (
            <Warning c={c} strong text={`You also exported a file on ${exportDateLabel}, which is newer.`} />
          )}
        </View>

        <View style={{ width: '100%', gap: 9, marginTop: 20 }}>
          {fileIsNewer ? (
            <>
              <PrimaryButton label="Restore from a file" onPress={onRestoreFile} />
              <GhostButton label="Load my Google backup" onPress={onLoad} />
            </>
          ) : (
            <>
              <PrimaryButton label="Load my journal" onPress={onLoad} />
              <GhostButton label="Restore from a file" onPress={onRestoreFile} />
            </>
          )}
          <GhostButton label="Keep this fresh start" onPress={onKeepFreshStart} />
        </View>
      </View>
    </View>
  );
}

function Warning({ c, text, strong }) {
  return (
    <T w={strong ? 700 : 600} color={strong ? c.accentDeep : c.muted} style={{ fontSize: 13, lineHeight: 19 }}>
      • {text}
    </T>
  );
}
