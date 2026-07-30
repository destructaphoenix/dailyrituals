// src/dev/DevPanel.js
// DEV-ONLY shell — collapsible sections only; the actual controls live in
// src/dev/panel/*.js. Reached only via a __DEV__-guarded require in
// RitualsApp, so this whole file (and its imports) is stripped from release
// bundles. SENTINEL is the marker the verification step greps for — it must
// be ABSENT from prod bundles. Every dev module's DEV_ID is imported and
// rendered in the footer below: rendering (not just exporting) is what stops
// the minifier dropping an unreferenced constant, so the grep covers every
// dev module, not just this one.
import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTheme } from '../theme';
import { T } from '../ui';
import { SENTINEL } from './sentinel';
import { DEV_ID as BUILD_STATE_ID } from './buildState';
import { DEV_ID as GENERATE_ENTRIES_ID } from './generateEntries';
import { DEV_ID as SCENARIOS_ID } from './scenarios';
import { DEV_ID as NOTIFY_PROBE_ID } from './notifyProbe';
import { DEV_ID as INSPECT_NOTIFY_ID } from './inspectNotify';
import { DEV_ID as INSPECT_ID } from './inspect';
import { DEV_ID as CONTROLS_ID } from './panel/controls';
import StateSection, { DEV_ID as STATE_SECTION_ID } from './panel/StateSection';
import NotifySection, { DEV_ID as NOTIFY_SECTION_ID } from './panel/NotifySection';
import InspectSection, { DEV_ID as INSPECT_SECTION_ID } from './panel/InspectSection';
import LaunchSection, { DEV_ID as LAUNCH_SECTION_ID } from './panel/LaunchSection';

export const DEV_ID = `${SENTINEL}/DevPanel`;

const MODULE_IDS = [
  DEV_ID, BUILD_STATE_ID, GENERATE_ENTRIES_ID, SCENARIOS_ID, NOTIFY_PROBE_ID,
  INSPECT_NOTIFY_ID, INSPECT_ID, CONTROLS_ID, STATE_SECTION_ID, NOTIFY_SECTION_ID,
  INSPECT_SECTION_ID, LAUNCH_SECTION_ID,
];

function Collapsible({ title, defaultOpen = false, children }) {
  const c = useTheme().colors;
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={{ marginBottom: 8, borderRadius: 12, borderWidth: 1, borderColor: c.border }}>
      <Pressable onPress={() => setOpen((o) => !o)} style={{ paddingVertical: 12, paddingHorizontal: 14 }}>
        <T w={800} color={c.ink} style={{ fontSize: 15 }}>{open ? '▾ ' : '▸ '}{title}</T>
      </Pressable>
      {open && <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>{children}</View>}
    </View>
  );
}

export default function DevPanel({
  onLoadState, onResetFresh, onClose, settings, setSettings, onRearmReminders, wroteToday,
  getSlice, appVersion, onOpenCelebration, onOpenAchievements, onOpenShop, onOpenGetEmbers,
  onOpenReminder, onShowToast, onOpenReading, onOpenRestoreNotice, plusFlow, insets,
}) {
  const c = useTheme().colors;
  // Closes the harness before opening whatever was launched — RN Modals are
  // separate native windows, so an overlay opened underneath a still-open
  // full-screen Dev Modal would be invisible until this one closes.
  const launch = (fn) => (...args) => { onClose(); if (fn) fn(...args); };

  return (
    <View testID={SENTINEL} style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
        <T d w={800} color={c.ink} style={{ fontSize: 22 }}>Dev Harness</T>
        <Pressable onPress={onClose} hitSlop={12}><T w={800} color={c.accentDeep} style={{ fontSize: 16 }}>Close</T></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <Collapsible title="State" defaultOpen>
          <StateSection onLoadState={onLoadState} onResetFresh={onResetFresh} getSlice={getSlice} appVersion={appVersion} />
        </Collapsible>

        {settings && setSettings && (
          <Collapsible title="Notifications">
            <NotifySection settings={settings} setSettings={setSettings} onRearmReminders={onRearmReminders} wroteToday={wroteToday} />
          </Collapsible>
        )}

        <Collapsible title="Inspector">
          <InspectSection getSlice={getSlice} />
        </Collapsible>

        <Collapsible title="Launch overlays">
          <LaunchSection
            onOpenCelebration={launch(onOpenCelebration)}
            onOpenAchievements={launch(onOpenAchievements)}
            onOpenShop={launch(onOpenShop)}
            onOpenGetEmbers={launch(onOpenGetEmbers)}
            onOpenReminder={launch(onOpenReminder)}
            onShowToast={launch(onShowToast)}
            onOpenReading={launch(onOpenReading)}
            onOpenRestoreNotice={launch(onOpenRestoreNotice)}
            plusFlow={plusFlow}
            insets={insets}
          />
        </Collapsible>

        <T color={c.muted} style={{ fontSize: 9, marginTop: 12, textAlign: 'center' }}>
          {MODULE_IDS.join(' · ')}
        </T>
      </ScrollView>
    </View>
  );
}
