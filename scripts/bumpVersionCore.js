// scripts/bumpVersionCore.js
// Pure helper: bump versionCode (+ version patch on 'native') inside the
// raw text of app.config.js, preserving all other formatting. Text-based on
// purpose — app.config.js is the single source of truth for both numbers and
// we must not reformat it. See docs/superpowers/specs/2026-06-07-streamlined-release-pipeline-design.md
'use strict';

const VERSION_CODE_RE = /(versionCode:\s*)(\d+)/;
const SEMVER_RE = /(version:\s*')(\d+)\.(\d+)\.(\d+)(')/;

function bumpConfigText(text, mode) {
  if (mode !== 'build' && mode !== 'native') {
    throw new Error(`Unknown bump mode: '${mode}' (expected 'build' or 'native')`);
  }
  if (!VERSION_CODE_RE.test(text)) {
    throw new Error('versionCode not found in app.config.js');
  }
  let out = text.replace(VERSION_CODE_RE, (_m, prefix, n) => `${prefix}${Number(n) + 1}`);
  if (mode === 'native') {
    if (!SEMVER_RE.test(out)) {
      throw new Error("semver version (version: 'x.y.z') not found in app.config.js");
    }
    out = out.replace(SEMVER_RE, (_m, p, major, minor, patch, q) =>
      `${p}${major}.${minor}.${Number(patch) + 1}${q}`);
  }
  return out;
}

module.exports = { bumpConfigText };
