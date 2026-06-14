module.exports = {
  expo: {
    name: 'Daily Rituals',
    slug: 'daily-rituals',
    version: '1.0.1',
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
    ios: { supportsTablet: false, bundleIdentifier: 'app.dailyrituals.mobile' },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#f9f7f4',
      },
      package: 'app.dailyrituals.mobile',
      versionCode: 7,
      // Android Auto Backup: user's local data (journal/streak/settings) backs
      // up to their own Google Drive and restores on a new/reinstalled device —
      // no accounts, no login. Explicit so it can't silently regress if Expo's
      // default ever changes. See IMP-006.
      allowBackup: true,
    },
    plugins: [
      'expo-dev-client',
      [
        'expo-build-properties',
        {
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 35,
            targetSdkVersion: 35,
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
