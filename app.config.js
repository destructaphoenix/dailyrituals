module.exports = {
  expo: {
    name: 'Daily Rituals',
    slug: 'daily-rituals',
    version: '1.0.5',
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
      versionCode: 11,
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

            // R8 code+resource shrinking on release builds only (IMP-044).
            //
            // WHY: expo-dev-launcher's `DevLauncherExpoActivityConfigurator` was
            // shipping inside the production AAB — Play's static DEX scan flagged its
            // deprecated `Window.setStatusBarColor` call. The class lives in the
            // library's `src/main` sourceset, but its ONLY consumer
            // (`DevLauncherExpoAppLoader`) lives in `src/debug`, so it is already
            // 100% unreachable in release — dead bytecode, never executed. Without
            // shrinking, nothing removes it. R8 does, along with the rest of the
            // dev-client's Compose UI and its resources.
            //
            // There is no per-variant autolinking exclusion to reach for instead:
            // `expo-modules-autolinking` reads `exclude` only from package.json
            // (static JSON, cannot branch on build type) and gradle forwards it
            // verbatim. Shrinking is the supported lever.
            //
            // NOTE: this does NOT clear the other Play warnings. Those come from
            // React Native core (`StatusBarModule`, `WindowUtilKt`), which is live
            // code — and `expo/android/proguard-rules.pro` explicitly pins
            // `-keep class com.facebook.react.views.view.WindowUtilKt { *; }`.
            // They clear when RN migrates upstream, not before.
            //
            // Renamed upstream: `enableProguardInReleaseBuilds` is DEPRECATED in
            // expo-build-properties 1.0.10 — `enableMinifyInReleaseBuilds` is the
            // current key. Resource shrinking requires minify to be on.
            // To revert, set both to false; they are independent of each other
            // only in that direction (shrink cannot outlive minify).
            enableMinifyInReleaseBuilds: true,
            enableShrinkResourcesInReleaseBuilds: true,

            // Keep rules for the ONE real gap found by auditing every native dep.
            //
            // Covered already, verified — do not duplicate these here:
            //   react-native ............ AAR ships proguard.txt (@DoNotStrip keeps)
            //   revenuecat purchases .... AAR ships proguard.txt
            //                             (-keep com.revenuecat.** + kotlinx.serialization)
            //   expo, expo-modules-core,
            //   expo-updates, react-native-svg .. declare consumerProguardFiles
            //
            // NOT covered: expo-notifications ships android/proguard-rules.pro but
            // never declares `consumerProguardFiles`, so its keeps are silently
            // dropped. The expo module gradle plugin does not auto-wire them. That
            // would put IMP-031's daily reminders at risk of being stripped, so we
            // apply its own upstream rule ourselves, verbatim.
            extraProguardRules: [
              '-keep class expo.modules.notifications.** { *; }',
              //
              // Shrink, but do NOT rename. `-dontobfuscate` keeps R8's dead-code
              // removal — which is the entire point of IMP-044, and what drops the
              // dev launcher — while switching off the half that actually causes
              // regressions: renaming classes that something looks up by name at
              // runtime (reflection, serialization, manifest strings). Deliberately
              // trading a few % of DEX size for a much narrower blast radius on the
              // FIRST minified build of a live app.
              //
              // Bonus: production stack traces stay human-readable, so a Play crash
              // report needs no mapping-file retrace.
              //
              // Revisit only once a minified build has been device-walked clean.
              '-dontobfuscate',
            ].join('\n'),
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
