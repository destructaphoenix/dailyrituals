// src/dev/panel/InspectSection.js
// DEV-ONLY. Read-only truth (IMP-032 Part C): inspectState(slice) rows are
// computed through the SAME real helpers the app uses, plus impure device
// facts that can't be simulated (native font-scale, OTA channel/runtimeVersion)
// but are at least visible here. Export writes the current slice to a JSON
// file via IMP-020's own backupIO wrapper — read-only, no paste-in (non-goal).
import React from 'react';
import { View, Pressable, Platform, PixelRatio, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { useTheme } from '../../theme';
import { T } from '../../ui';
import { inspectState } from '../inspect';
import { MAX_FONT_SCALE, CHROME_FONT_SCALE } from '../../ui/textScale';
import * as backupIO from '../../backup/io';
import { SENTINEL } from '../sentinel';

export const DEV_ID = `${SENTINEL}/panel/InspectSection`;

const todayKey = () => new Date().toISOString().slice(0, 10);

function SectionLabel({ children }) {
  const c = useTheme().colors;
  return <T w={800} color={c.muted} style={{ fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 20, marginBottom: 4 }}>{children}</T>;
}

function Row({ label, value }) {
  const c = useTheme().colors;
  const text = value === null || value === undefined
    ? '—'
    : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, gap: 8 }}>
      <T color={c.muted} style={{ fontSize: 12, flex: 1 }}>{label}</T>
      <T color={c.ink} style={{ fontSize: 12, flex: 1, textAlign: 'right' }}>{text}</T>
    </View>
  );
}

export default function InspectSection({ getSlice, onExported }) {
  const c = useTheme().colors;
  const dims = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const rows = inspectState(getSlice(), todayKey());
  const groups = [...new Set(rows.map((r) => r.group))];

  const doExport = async () => {
    try {
      await backupIO.exportFile('devstate.json', JSON.stringify(getSlice()));
      if (onExported) onExported(true);
    } catch (e) {
      if (onExported) onExported(false);
    }
  };

  return (
    <View>
      <SectionLabel>Device facts</SectionLabel>
      <Row label="Platform" value={`${Platform.OS} ${Platform.Version}`} />
      <Row label="Font scale" value={PixelRatio.getFontScale()} />
      <Row label="Font scale cap (body / chrome)" value={`${MAX_FONT_SCALE} / ${CHROME_FONT_SCALE}`} />
      <Row label="Window" value={`${Math.round(dims.width)}×${Math.round(dims.height)}`} />
      <Row label="Safe area insets" value={insets} />
      <Row label="App version" value={Constants.expoConfig?.version} />
      <Row label="Native app version" value={Application.nativeApplicationVersion} />
      <Row label="Native build version" value={Application.nativeBuildVersion} />
      <Row label="OTA runtimeVersion" value={Updates.runtimeVersion} />
      <Row label="OTA channel" value={Updates.channel} />
      <Row label="OTA updateId" value={Updates.updateId} />
      <Row label="Embedded launch (no OTA applied)" value={Updates.isEmbeddedLaunch} />

      {groups.map((g) => (
        <View key={g}>
          <SectionLabel>{g}</SectionLabel>
          {rows.filter((r) => r.group === g).map((r) => (
            <Row key={`${g}-${r.label}`} label={r.label} value={r.value} />
          ))}
        </View>
      ))}

      <Pressable onPress={doExport} style={{ paddingVertical: 14, alignItems: 'center', marginTop: 12 }}>
        <T w={700} color={c.accentDeep} style={{ fontSize: 15 }}>Export current state</T>
      </Pressable>
    </View>
  );
}
