module.exports = {
  expo: {
    name: 'Daily Rituals',
    slug: 'daily-rituals',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#f9f7f4',
    },
    runtimeVersion: { policy: 'fingerprint' },
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
      versionCode: 5,
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
      termsUrl: process.env.TERMS_URL || '',
      privacyUrl: process.env.PRIVACY_URL || '',
      eas: { projectId: '1a0f9b15-cb1a-4cec-9577-3cd66e9f1d36' },
    },
  },
};
