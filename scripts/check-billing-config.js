// check-billing-config.js — release preflight for the paid Plus surface.
//
// WHY: src/billing/index.js falls back to the SIMULATION whenever no RevenueCat
// key is present. That fallback is correct for Expo Go and web, but catastrophic
// in a production build: the paywall would show, fake a successful purchase, and
// grant Plus for free — with no crash and no error to notice.
//
// `.env` is git-ignored, so it does NOT reach EAS Build. Unless RC_ANDROID_KEY is
// supplied as an EAS environment variable, a cloud build resolves it to '' and
// silently ships the simulation. This script makes that combination a hard build
// failure instead of a shipped one. Run it before `eas build`.

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = path.join('src', 'billing', 'config.js');
const PLAY_KEY_PREFIX = 'goog_';

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

function main() {
  const file = path.resolve(__dirname, '..', CONFIG_FILE);
  const plusEnabled = parsePlusEnabled(fs.readFileSync(file, 'utf8'));
  const result = billingPreflight({ plusEnabled, androidKey: process.env.RC_ANDROID_KEY });

  if (result.ok) {
    console.log(`billing-preflight: OK — ${result.reason}`);
    return;
  }

  console.error(`\nbilling-preflight: FAILED\n\n  ${result.reason}\n`);
  process.exit(1);
}

if (require.main === module) main();

module.exports = { parsePlusEnabled, billingPreflight, CONFIG_FILE, PLAY_KEY_PREFIX };
