// check-billing-config.js — release preflight for the paid Plus surface.
//
// WHY: src/billing/index.js falls back to the SIMULATION whenever no RevenueCat
// key is present. That fallback is correct for Expo Go and web, but catastrophic
// in a production build: the paywall would show, fake a successful purchase, and
// grant Plus for free — with no crash and no error to notice.
//
// `.env` is git-ignored, so it does NOT reach EAS Build. Unless RC_ANDROID_KEY is
// supplied as an EAS environment variable, a cloud build resolves it to '' and
// silently ships the simulation. Run this before `eas build`.
//
// IMP-084 (2026-09-06) — what this script does NOT do, learned the hard way.
// v1.0.8 / vc14 shipped the simulation to Play `internal` with this preflight
// green throughout: `billingPreflight` reads process.env on the CI RUNNER, and
// the runner is not the machine that decides. A cloud build evaluates
// app.config.js on EAS's servers, which see only the variables bound through an
// eas.json profile `environment`. No profile declared one, so the key existed on
// EAS and never reached the build. `easEnvironmentPreflight` asserts that lever.
// Neither check can see EAS's own store — together they are a guard, not a proof.

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join('src', 'billing', 'config.js');
const PLAY_KEY_PREFIX = 'goog_';
const EAS_FILE = 'eas.json';
const BUILD_PROFILE = 'production';
const BUILD_ENVIRONMENT = 'production';

// Reads the flag out of the config source. Regex rather than import because the
// module pulls in expo-constants, which has no meaning in a bare node process.
// Anchored to the declaration so a mention in a comment cannot satisfy it.
function parsePlusEnabled(source) {
  const m = /^\s*export\s+const\s+PLUS_ENABLED\s*=\s*(true|false)\s*;?\s*$/m.exec(source);
  if (!m) {
    throw new Error(
      `Could not find an "export const PLUS_ENABLED = true|false" declaration in ${CONFIG_FILE}. ` +
      'Refusing to guess whether the paid surface ships.'
    );
  }
  return m[1] === 'true';
}

// Pure decision — exported for tests.
function billingPreflight({ plusEnabled, androidKey }) {
  if (!plusEnabled) {
    return { ok: true, reason: 'PLUS_ENABLED is false — no purchase surface ships. Nothing to check.' };
  }
  const key = String(androidKey || '').trim();
  if (!key) {
    return {
      ok: false,
      reason:
        'PLUS_ENABLED is true but RC_ANDROID_KEY is empty. This build would fall back to the ' +
        'purchase SIMULATION: the paywall would fake a successful purchase and grant Plus for free. ' +
        'Set RC_ANDROID_KEY as an EAS environment variable (`eas env:create`) — .env is git-ignored ' +
        'and never reaches EAS Build.',
    };
  }
  if (!key.startsWith(PLAY_KEY_PREFIX)) {
    return {
      ok: false,
      reason:
        `PLUS_ENABLED is true but RC_ANDROID_KEY does not start with "${PLAY_KEY_PREFIX}" — that is not a ` +
        'production RevenueCat Play key. A sandbox key will not charge real buyers.',
    };
  }
  return { ok: true, reason: 'PLUS_ENABLED is true and a production Play key is present.' };
}

// Pure decision — exported for tests. The CI runner cannot read EAS's variable
// store, so the most this can do is assert the binding that lets the store reach
// a cloud build at all. Without it, EAS resolves RC_ANDROID_KEY to '' and ships
// simService no matter what the runner's environment holds.
function easEnvironmentPreflight({ easJson }) {
  const profile = easJson && easJson.build && easJson.build[BUILD_PROFILE];
  if (!profile) {
    return {
      ok: false,
      reason:
        `eas.json has no "build.${BUILD_PROFILE}" profile. That is the profile store builds use; ` +
        'without it there is nothing to bind an EAS environment to.',
    };
  }
  const environment = profile.environment;
  if (environment !== BUILD_ENVIRONMENT) {
    return {
      ok: false,
      reason:
        `eas.json "build.${BUILD_PROFILE}" declares environment ${JSON.stringify(environment)}, ` +
        `expected "${BUILD_ENVIRONMENT}". EAS Build injects environment variables only for the ` +
        'environment a profile binds, so RC_ANDROID_KEY would resolve to \'\' on EAS\'s servers and ' +
        'the build would ship the purchase SIMULATION — exactly how v1.0.8 / vc14 shipped it.',
    };
  }
  return { ok: true, reason: `eas.json binds build.${BUILD_PROFILE} to the "${BUILD_ENVIRONMENT}" environment.` };
}

function main() {
  const file = path.resolve(__dirname, '..', CONFIG_FILE);
  const plusEnabled = parsePlusEnabled(fs.readFileSync(file, 'utf8'));
  const easJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', EAS_FILE), 'utf8'));

  // Both must pass: the runner check and the binding check guard different
  // machines, and vc14 proved the first one alone is not enough.
  const results = [
    billingPreflight({ plusEnabled, androidKey: process.env.RC_ANDROID_KEY }),
    plusEnabled
      ? easEnvironmentPreflight({ easJson })
      : { ok: true, reason: 'PLUS_ENABLED is false — no purchase surface ships. Nothing to bind.' },
  ];

  const failed = results.filter((r) => !r.ok);
  if (failed.length === 0) {
    results.forEach((r) => console.log(`billing-preflight: OK — ${r.reason}`));
    return;
  }

  console.error(`\nbilling-preflight: FAILED\n`);
  failed.forEach((r) => console.error(`  ${r.reason}\n`));
  process.exit(1);
}

if (require.main === module) main();

module.exports = {
  parsePlusEnabled,
  billingPreflight,
  easEnvironmentPreflight,
  CONFIG_FILE,
  EAS_FILE,
  PLAY_KEY_PREFIX,
  BUILD_PROFILE,
  BUILD_ENVIRONMENT,
};
