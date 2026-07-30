// App.js — entry point. Loads the Google fonts, provides safe-area context,
// and holds the live mode + settings state (the You tab drives them).

import React, { useState } from 'react';
import { View, ActivityIndicator, Platform } from 'react-native';
import { RC_KEYS } from './src/billing/config';
import { isBillingConfigured } from './src/billing';
import { loadState, saveState, clearState } from './src/persistence/storage';
import { hasCompletedOnboarding } from './src/persistence/onboarding';
import { isRestoredInstall } from './src/persistence/restoreDetect';
import * as Application from 'expo-application';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  Baloo2_500Medium, Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import {
  Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold,
} from '@expo-google-fonts/quicksand';
import {
  Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold,
} from '@expo-google-fonts/fredoka';
import {
  Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';

import RitualsApp from './src/RitualsApp';
import Onboarding from './src/screens/Onboarding';
import { DEFAULT_SETTINGS } from './src/theme';
import { mergeWithDefaults } from './src/persistence/state';

export default function App() {
  const [mode, setMode] = useState('day');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [onboarded, setOnboarded] = useState(false); // new users start in first-run
  const [startedPlus, setStartedPlus] = useState(false); // subscribed during onboarding
  const [hydrated, setHydrated] = useState(null); // null = still loading persisted state
  const [dataKey, setDataKey] = useState(0); // bump to remount RitualsApp with fresh state
  const [restoredFromMs, setRestoredFromMs] = useState(null); // set once when this launch looks like a restore (IMP-029)

  React.useEffect(() => {
    const platform = Platform.OS === 'android' ? 'android' : 'ios';
    if (isBillingConfigured(platform)) {
      const Purchases = require('react-native-purchases').default;
      Purchases.configure({ apiKey: platform === 'android' ? RC_KEYS.android : RC_KEYS.ios });
    }
    loadState().then(async (loaded) => {
      const s = loaded || {};
      setHydrated(s);
      if (s.mode) setMode(s.mode);
      // Shallow merge, not a raw assign: a persisted `settings` object predates
      // any settings key added since it was saved (e.g. `reminder`, IMP-031) and
      // would otherwise come back without it, crashing every read of that key.
      if (s.settings) setSettings(mergeWithDefaults(s.settings, DEFAULT_SETTINGS));
      // Show first-run onboarding only to genuinely new users. See
      // hasCompletedOnboarding — returning users (any persisted state, or the
      // explicit flag) skip it, so updates never re-onboard existing testers.
      if (hasCompletedOnboarding(loaded)) setOnboarded(true);
      // IMP-029: no lastSavedAt means this data predates the feature — stay silent.
      if (s.lastSavedAt) {
        try {
          const installedAt = await Application.getInstallationTimeAsync();
          if (isRestoredInstall({ lastSavedAt: s.lastSavedAt, installedAt: installedAt?.getTime() })) {
            setRestoredFromMs(s.lastSavedAt);
          }
        } catch (e) {
          // expo-application unavailable in this environment — no notice, no crash
        }
      }
    });
  }, []);

  const [fontsLoaded] = useFonts({
    Baloo2_500Medium, Baloo2_600SemiBold, Baloo2_700Bold, Baloo2_800ExtraBold,
    Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold,
    Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold,
    Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold,
  });

  if (!fontsLoaded || hydrated === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9f7f4' }}>
        <ActivityIndicator color="#d97706" />
      </View>
    );
  }

  const handleResetData = async () => {
    await clearState();
    setSettings(DEFAULT_SETTINGS);
    setMode('day');
    setStartedPlus(false);
    setHydrated({});
    setOnboarded(false);
  };

  const handleReplaceAllData = async (restoredSlice) => {
    await saveState(restoredSlice);
    setHydrated(restoredSlice);
    if (restoredSlice.settings) setSettings(mergeWithDefaults(restoredSlice.settings, DEFAULT_SETTINGS));
    setDataKey((k) => k + 1); // forces RitualsApp to re-init useState from the restored slice
  };

  // Re-stamps lastSavedAt to now (so the notice never reappears) and hides it.
  // hydrated is the full loaded slice, unchanged in content — only the stamp moves.
  const handleDismissRestoreNotice = () => {
    saveState(hydrated);
    setRestoredFromMs(null);
  };

  const dark = mode === 'night';

  // First-run / signup flow hands off to the live app on completion.
  if (!onboarded) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Onboarding settings={settings} setSettings={setSettings} onDone={(plus) => { setStartedPlus(!!plus); setOnboarded(true); }} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <RitualsApp
        key={dataKey}
        mode={mode}
        settings={settings}
        setSettings={setSettings}
        onToggleMode={() => setMode(dark ? 'day' : 'night')}
        initialPlus={startedPlus}
        initialState={hydrated}
        onResetData={handleResetData}
        onReplaceAllData={handleReplaceAllData}
        restoredFromMs={restoredFromMs}
        onDismissRestoreNotice={handleDismissRestoreNotice}
      />
    </SafeAreaProvider>
  );
}
