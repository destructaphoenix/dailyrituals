// patch-permissions.js — postinstall patch for expo-modules-core.
//
// WHY: `PermissionsService.getPermissions()` force-unwraps `requestedPermissions`
// (`!!`), which is null on Android when the manifest declares no runtime
// permissions — crashing on first permission check. Still unfixed upstream as of
// expo-modules-core 3.0.30 (Expo SDK 54); verified against the pristine npm
// tarball, not the installed copy (the installed copy is what we rewrite, so it
// cannot answer the question). Re-verify on every SDK bump.
//
// This deliberately does NOT swallow failure. A silent no-op here ships an app
// that crashes on a permission check, so an unrecognised source file is a hard
// error (IMP-027).

const fs = require('fs');
const path = require('path');

const TARGET_FILE = path.join(
  'node_modules', 'expo-modules-core', 'android', 'src', 'main', 'java',
  'expo', 'modules', 'adapters', 'react', 'permissions', 'PermissionsService.kt'
);

const BUGGY = 'return requestedPermissions!!.contains(permission)';
const FIXED = 'return requestedPermissions?.contains(permission) ?: false';

// Pure decision function — exported for tests. Returns the outcome and the
// contents to write (null when there is nothing to write).
function planPatch(source) {
  if (source.includes(BUGGY)) {
    return { outcome: 'patched', contents: source.replace(BUGGY, FIXED) };
  }
  if (source.includes(FIXED)) {
    // Idempotent: a second run over an already-patched tree is a success, not a
    // failure. Keeps `npm install` re-runs quiet.
    return { outcome: 'already-patched', contents: null };
  }
  return { outcome: 'target-missing', contents: null };
}

function main() {
  const file = path.resolve(__dirname, '..', TARGET_FILE);

  if (!fs.existsSync(file)) {
    // Not an error: expo-modules-core is absent on a docs-only / CI-lite install.
    console.log('patch(permissions): expo-modules-core not installed — skipped');
    return;
  }

  const { outcome, contents } = planPatch(fs.readFileSync(file, 'utf8'));

  if (outcome === 'patched') {
    fs.writeFileSync(file, contents);
    console.log('patch(permissions): applied null-safety fix to PermissionsService.kt');
    return;
  }

  if (outcome === 'already-patched') {
    console.log('patch(permissions): already null-safe — nothing to do');
    return;
  }

  console.error(
    '\npatch(permissions): FAILED — neither the buggy nor the patched line was found in\n' +
    `  ${TARGET_FILE}\n\n` +
    'expo-modules-core changed this file. Do NOT ignore this: read the current source and\n' +
    'either update BUGGY/FIXED in scripts/patch-permissions.js, or delete this patch and its\n' +
    'postinstall hook if upstream has fixed the null-safety itself.\n'
  );
  process.exit(1);
}

if (require.main === module) main();

module.exports = { planPatch, BUGGY, FIXED, TARGET_FILE };
