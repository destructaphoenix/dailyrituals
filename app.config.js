module.exports = {
  expo: {
    name: 'Daily Rituals',
    slug: 'daily-rituals',
    version: '1.0.3',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#f9f7f4',
    },
    // runtimeVersion drives OTA compatibility. We use `appVersion` (= the
    // `version` string above) rather than `fingerprint`: fingerprint embeds
    // machine-specific absolute paths + CRLF-hashed node_modules, so it
    // computes DIFFERENTLY on a Windows dev machine vs EAS's Linux build
    // servers — making locally-published OTA updates incompatible with EAS
    // builds. appVersion is OS-independent. Trade-off: the auto "refuse OTA to
    // native-incompatible builds" guard is gone, so YOU must bump `version`
    // whenever a build carries native changes (see "Update workflow" in
    // PROGRESS.md). Pure-JS OTA updates keep the same version.
    runtimeVersion: { policy: 'appVersion' },
    updates: {
      url: 'https://u.expo.dev/1a0f9b15-cb1a-4cec-9577-3cd66e9f1d36',
    },
    // SDK 54 defaults New Architecture ON. This app stays on Legacy Architecture
    // (decided, IMP-027) — API 36 compliance needs no New Arch, and migrating both
    // at once against the Aug-31 deadline is unnecessary risk. Explicit so
    // expo install --fix/prebuild can't silently flip it.
    //
    // This top-level `expo.newArchEnabled` is the canonical field in SDK 54. The
    // `expo-build-properties` android option of the same name is deprecated and is
    // intentionally NOT set below — one switch, one place, no ambiguity about which
    // wins. SDK 55 removes Legacy Architecture entirely; migrating is its own task.
    newArchEnabled: false,
    ios: { supportsTablet: false, bundleIdentifier: 'app.dailyrituals.mobile' },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#f9f7f4',
      },
      package: 'app.dailyrituals.mobile',
      versionCode: 9,
      // Android Auto Backup: user's local data (journal/streak/settings) backs
      // up to their own Google Drive and restores on a new/reinstalled device —
      // no accounts, no login. Explicit so it can't silently regress if Expo's
      // default ever changes. See IMP-006.
      allowBackup: true,
    },
    plugins: [
      'expo-dev-client',
      'expo-font',
      [
        'expo-build-properties',
        {
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 36,
            targetSdkVersion: 36,
            buildToolsVersion: '36.0.0',
          },
        },
      ],
    ],
    extra: {
      rcIosKey: process.env.RC_IOS_KEY || '',
      rcAndroidKey: process.env.RC_ANDROID_KEY || '',
      termsUrl: process.env.TERMS_URL || 'https://destructaphoenix.github.io/dailyrituals-website.github.io/terms.html',
      privacyUrl: process.env.PRIVACY_URL || 'https://destructaphoenix.github.io/dailyrituals-website.github.io/privacy.html',
      eas: { projectId: '1a0f9b15-cb1a-4cec-9577-3cd66e9f1d36' },
    },
  },
};
