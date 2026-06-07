# Streamlined Release Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship cosmetic/OTA changes to testers with a single owner approval tap and nothing else, and make full builds prepared entirely by the agents + built/submitted by CI — so the owner only touches Play's human-gated steps.

**Architecture:** GitHub Actions watches `main`. A push only releases if its HEAD commit carries a `Release-Lane: ota|build` trailer. A classify job runs the test gate and an OTA safety backstop, then a deploy job gated behind a GitHub "production" environment (one-tap approval) runs `eas update` (OTA) or `eas build --auto-submit` (build). Agents own version bumps via deterministic `npm run bump:*` scripts and the lane trailer; the owner does a one-time secrets/environment setup.

**Tech Stack:** GitHub Actions, EAS CLI (`eas update` / `eas build` / `eas submit`), `expo/expo-github-action`, Node 20, Jest (jest-expo), Node CommonJS bump scripts.

**Spec:** [`docs/superpowers/specs/2026-06-07-streamlined-release-pipeline-design.md`](../specs/2026-06-07-streamlined-release-pipeline-design.md)

---

## File structure

| File | Responsibility |
| --- | --- |
| `scripts/bumpVersionCore.js` (create) | Pure function `bumpConfigText(text, mode)` — returns app.config.js text with bumped versionCode (+version on native). Unit-tested. |
| `scripts/bump-version.js` (create) | CLI wrapper: read `app.config.js`, call core, write back. Wired to `npm run bump:build` / `bump:native`. |
| `__tests__/scripts/bumpVersion.test.js` (create) | Tests for `bumpConfigText`. |
| `package.json` (modify) | Add `bump:build` / `bump:native` scripts. |
| `app.config.js` (modify) | Public legal-URL fallbacks so OTA published from CI keeps the links working. |
| `eas.json` (modify) | Submit profile `track` = the closed-testing track. |
| `.github/workflows/release.yml` (create) | Trailer-triggered classify → test gate → OTA-backstop → approval-gated deploy (both lanes). |
| `.github/workflows/rollback-ota.yml` (create) | Manual `workflow_dispatch` running `eas update:rollback`. |
| `PROGRESS.md` (modify) | "Release rules" block — the agent-facing contract. |
| `DEVGUIDE.md` (modify) | Pointer to the Release rules. |

---

## Task 1: Version bump core (pure, TDD)

**Files:**
- Create: `scripts/bumpVersionCore.js`
- Test: `__tests__/scripts/bumpVersion.test.js`

- [ ] **Step 1: Write the failing test**

```js
// __tests__/scripts/bumpVersion.test.js
const { bumpConfigText } = require('../../scripts/bumpVersionCore');

const SAMPLE = [
  "module.exports = {",
  "  expo: {",
  "    version: '1.0.0',",
  "    android: {",
  "      package: 'app.dailyrituals.mobile',",
  "      versionCode: 5,",
  "    },",
  "  },",
  "};",
  "",
].join('\n');

describe('bumpConfigText', () => {
  test("build mode bumps versionCode only", () => {
    const out = bumpConfigText(SAMPLE, 'build');
    expect(out).toContain('versionCode: 6');
    expect(out).toContain("version: '1.0.0'"); // unchanged
  });

  test("native mode bumps versionCode AND version patch", () => {
    const out = bumpConfigText(SAMPLE, 'native');
    expect(out).toContain('versionCode: 6');
    expect(out).toContain("version: '1.0.1'");
  });

  test("preserves the rest of the file verbatim", () => {
    const out = bumpConfigText(SAMPLE, 'build');
    expect(out).toContain("package: 'app.dailyrituals.mobile'");
    expect(out).toContain('module.exports = {');
  });

  test("throws on unknown mode", () => {
    expect(() => bumpConfigText(SAMPLE, 'wat')).toThrow(/mode/i);
  });

  test("throws when versionCode is missing", () => {
    expect(() => bumpConfigText("module.exports = {};", 'build')).toThrow(/versionCode/i);
  });

  test("throws on native when semver version is missing", () => {
    const noVer = "module.exports = { expo: { android: { versionCode: 5 } } };";
    expect(() => bumpConfigText(noVer, 'native')).toThrow(/version/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- bumpVersion`
Expected: FAIL — `Cannot find module '../../scripts/bumpVersionCore'`.

- [ ] **Step 3: Write the minimal implementation**

```js
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- bumpVersion`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/bumpVersionCore.js __tests__/scripts/bumpVersion.test.js
git commit -m "feat(release): pure version-bump core for app.config.js"
```

---

## Task 2: Version bump CLI + npm scripts

**Files:**
- Create: `scripts/bump-version.js`
- Modify: `package.json` (scripts block)

- [ ] **Step 1: Write the CLI**

```js
// scripts/bump-version.js
// Usage: node scripts/bump-version.js build|native
// Edits app.config.js in place. Agents call this via npm run bump:build / bump:native.
'use strict';

const fs = require('fs');
const path = require('path');
const { bumpConfigText } = require('./bumpVersionCore');

const mode = process.argv[2];
const file = path.join(__dirname, '..', 'app.config.js');

const text = fs.readFileSync(file, 'utf8');
const next = bumpConfigText(text, mode); // throws on bad mode / missing fields
fs.writeFileSync(file, next);

const changed = next
  .split('\n')
  .filter((l) => /(^|\s)version:\s*'|versionCode:\s*\d/.test(l))
  .map((l) => l.trim())
  .join('  |  ');
console.log(`bump (${mode}) ok → ${changed}`);
```

- [ ] **Step 2: Add npm scripts**

In `package.json`, inside `"scripts"`, add these two entries (after `"test"`):

```json
    "bump:build": "node scripts/bump-version.js build",
    "bump:native": "node scripts/bump-version.js native",
```

- [ ] **Step 3: Verify the CLI works, then undo the change**

Run: `npm run bump:build`
Expected: prints `bump (build) ok → version: '1.0.0'  |  versionCode: 6` and `app.config.js` now shows `versionCode: 6`.

Restore the file so this setup task doesn't actually bump the live number:

Run: `git checkout app.config.js`
Expected: `versionCode` back to `5`.

- [ ] **Step 4: Commit**

```bash
git add scripts/bump-version.js package.json
git commit -m "feat(release): bump CLI + npm run bump:build/native"
```

---

## Task 3: Make app.config.js OTA-safe (legal URL fallbacks)

**Why:** When CI runs `eas update`, `app.config.js` re-evaluates `process.env` with no `.env` present, so `process.env.TERMS_URL`/`PRIVACY_URL` are undefined and the published OTA would carry empty legal links — breaking the live Terms/Privacy buttons. These URLs are public (already live on GitHub Pages), so safe to hardcode as fallbacks. `rcAndroidKey` stays env-only (it is publishable but the owner deliberately keeps it out of git; with `PLUS_ENABLED=false` an empty value is harmless — revisit at Phase 10b).

**Files:**
- Modify: `app.config.js` (the `extra` block)

- [ ] **Step 1: Add the URL fallbacks**

Replace these two lines in the `extra` block:

```js
      termsUrl: process.env.TERMS_URL || '',
      privacyUrl: process.env.PRIVACY_URL || '',
```

with:

```js
      termsUrl: process.env.TERMS_URL || 'https://destructaphoenix.github.io/dailyrituals-website.github.io/terms.html',
      privacyUrl: process.env.PRIVACY_URL || 'https://destructaphoenix.github.io/dailyrituals-website.github.io/privacy.html',
```

- [ ] **Step 2: Verify the evaluated config has the URLs without a .env**

Run: `node -e "const c=require('./app.config.js'); console.log(c.expo.extra.termsUrl, '|', c.expo.extra.privacyUrl)"`
Expected: prints the two `https://destructaphoenix.github.io/...` URLs (the live ones — your local `.env` may already supply identical values; either way they must be non-empty).

- [ ] **Step 3: Confirm tests still green**

Run: `npm test`
Expected: PASS — 53 tests (unchanged).

- [ ] **Step 4: Commit**

```bash
git add app.config.js
git commit -m "fix(config): hardcode public legal-URL fallbacks so CI-published OTA keeps links working"
```

---

## Task 4: Point the EAS submit profile at the closed-testing track

**Why:** Build-lane releases auto-submit via `eas build --auto-submit`, which uses the submit profile's `track`. It is currently `internal`, but the 12×14 testers are on the **closed-testing** track. Auto-submit must target that track or testers won't receive the build.

**Files:**
- Modify: `eas.json`

- [ ] **Step 1: Track name (confirmed by owner)**

The owner confirmed the closed-testing track shows as **"Closed testing – Alpha"** in Play Console, i.e. the track identifier is `alpha`. Use that literal value below.

- [ ] **Step 2: Set the track**

In `eas.json`, change the submit profile's track from `"internal"` to `"alpha"`:

```json
  "submit": {
    "production": { "android": { "serviceAccountKeyPath": "./play-service-account.json", "track": "alpha" } }
  }
```

- [ ] **Step 3: Commit**

```bash
git add eas.json
git commit -m "build(release): submit to the closed-testing track for auto-submit"
```

---

## Task 5: The release workflow

**Files:**
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Write the workflow**

```yaml
# .github/workflows/release.yml
# Releases only when the HEAD commit carries a "Release-Lane: ota|build" trailer.
# Pushes without it are no-ops (safe for WIP). See docs/superpowers/specs/2026-06-07-...
name: Release

on:
  push:
    branches: [main]

jobs:
  classify:
    runs-on: ubuntu-latest
    outputs:
      lane: ${{ steps.detect.outputs.lane }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # need full history for the before..after diff

      - id: detect
        name: Detect Release-Lane trailer
        run: |
          LANE=$(git log -1 --pretty=%B | grep -ioP '^Release-Lane:\s*\K(ota|build)' | head -1 || true)
          echo "Detected lane: '${LANE}'"
          echo "lane=${LANE}" >> "$GITHUB_OUTPUT"

      - name: OTA native-change backstop
        if: steps.detect.outputs.lane == 'ota'
        run: |
          BEFORE='${{ github.event.before }}'
          if [ -z "$BEFORE" ] || [ "$BEFORE" = "0000000000000000000000000000000000000000" ]; then
            BEFORE=$(git rev-parse HEAD~1)
          fi
          CHANGED=$(git diff --name-only "$BEFORE" '${{ github.event.after }}')
          echo "Changed files:"; echo "$CHANGED"
          if echo "$CHANGED" | grep -E '^(app\.config\.js|package\.json|package-lock\.json|eas\.json|babel\.config\.js|assets/)'; then
            echo "::error::Release-Lane is 'ota' but native-affecting files changed. Re-tag the commit as 'Release-Lane: build'."
            exit 1
          fi

      - uses: actions/setup-node@v4
        if: steps.detect.outputs.lane != ''
        with:
          node-version: 20
          cache: npm

      - name: Install deps
        if: steps.detect.outputs.lane != ''
        run: npm ci

      - name: Test gate
        if: steps.detect.outputs.lane != ''
        run: npm test

  ota:
    needs: classify
    if: needs.classify.outputs.lane == 'ota'
    runs-on: ubuntu-latest
    environment: production # one-tap approval gate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Publish OTA
        run: |
          MSG=$(git log -1 --pretty=%s)
          eas update --branch production --message "$MSG" --non-interactive

  build:
    needs: classify
    if: needs.classify.outputs.lane == 'build'
    runs-on: ubuntu-latest
    environment: production # one-tap approval gate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Write Play service account
        env:
          SA_JSON: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON }}
        run: printf '%s' "$SA_JSON" > play-service-account.json
      - name: Build + auto-submit to closed testing
        run: eas build -p android --profile production --auto-submit --non-interactive
```

- [ ] **Step 2: Lint the YAML locally (syntax sanity)**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('.github/workflows/release.yml','utf8');if(!/Release-Lane/.test(s)||!/environment: production/.test(s))throw new Error('release.yml missing key content');console.log('release.yml looks structurally complete')"`
Expected: prints `release.yml looks structurally complete`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci(release): trailer-triggered OTA + build pipeline with approval gate"
```

> Note: pushing this commit does NOT trigger a release (no `Release-Lane:` trailer → classify no-ops). The workflow only becomes active for future trailer-carrying commits once it is on `main`.

---

## Task 6: The rollback workflow

**Files:**
- Create: `.github/workflows/rollback-ota.yml`

- [ ] **Step 1: Write the workflow**

```yaml
# .github/workflows/rollback-ota.yml
# Manual button (Actions tab → Run workflow) to revert the production branch's
# latest OTA. Gated behind the same approval environment.
name: Rollback OTA

on:
  workflow_dispatch:

jobs:
  rollback:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Roll back the production branch
        run: eas update:rollback --branch production --non-interactive
```

> If `eas update:rollback` rejects `--non-interactive` for your CLI version, the fallback is to re-publish the last good commit: check out that commit and run `eas update --branch production --message "rollback to <sha>"`. Confirm the exact flag during the first rollback test.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/rollback-ota.yml
git commit -m "ci(release): manual OTA rollback workflow"
```

---

## Task 7: Encode the agent release rules

**Files:**
- Modify: `PROGRESS.md` (add a "Release rules" section near the "Update workflow" section)
- Modify: `DEVGUIDE.md` (add a pointer)

- [ ] **Step 1: Add the Release rules block to PROGRESS.md**

Add this section in `PROGRESS.md` immediately **above** the `## 🚀 Update workflow (post-launch)` heading:

```markdown
## 🤖 Release rules (Opus/Sonnet — how shipping works now)

Shipping is automated (GitHub Actions + one-tap owner approval). **Agents NEVER run `eas` commands and never hand-edit version numbers.** To ship a finished, shippable change:

1. **Pick the lane:**
   - **OTA** — only files under `src/` changed (JS / UI / copy / logic).
   - **BUILD** — any native-affecting file changed: `app.config.js`, `package.json`, `package-lock.json`, `eas.json`, `babel.config.js`, `assets/`, or a new native dep / permission / SDK / target.
2. **BUILD lane only — bump versions with the scripts (never by hand):**
   - `npm run bump:build` — native/config change that is runtime-compatible → `versionCode +1`.
   - `npm run bump:native` — native change affecting runtime/OTA compatibility → `version` patch +1 **and** `versionCode +1`. **When unsure, use `bump:native`** (safer; scopes OTA to compatible builds).
3. **Tag the final commit** of the shippable unit with the trailer as the last line(s) of the commit message, exactly:
   - `Release-Lane: ota`  — or —  `Release-Lane: build`
   (Putting it on the PROGRESS.md closeout commit is fine; CI reads the trailer from HEAD and diffs the whole push.)
4. **Push `main`.** CI runs the test gate, then waits for the owner's one-tap approval, then ships: OTA (`eas update`) or build + auto-submit to closed testing.
5. **No trailer = nothing ships** — safe for work-in-progress pushes.

Guardrails: a commit tagged `ota` that touched native files is auto-rejected by CI's backstop (re-tag as `build`). OTA reaches testers on **v5+** only. Rollback: owner runs the **Rollback OTA** workflow (Actions tab). Owner one-time setup (tokens/secrets/approval environment) is in the pipeline plan, Task 8.
```

- [ ] **Step 2: Add the DEVGUIDE pointer**

In `DEVGUIDE.md`, add this line at the end of the "The one rule that makes this work" section (after the two numbered non-negotiables):

```markdown
3. **Shipping is automated** — when a change is ready to ship, follow the **"🤖 Release rules"** section in `PROGRESS.md` (pick lane → `npm run bump:*` if build → `Release-Lane:` trailer → push). Never run `eas` by hand.
```

- [ ] **Step 3: Commit**

```bash
git add PROGRESS.md DEVGUIDE.md
git commit -m "docs(release): encode agent release rules (lane, bump scripts, trailer)"
```

---

## Task 8: One-time owner setup (manual — no code)

> The owner performs these in dashboards. Code Tasks 1–7 do not depend on them, but the shakedown (Task 9) does. Walk the owner through each; check off when confirmed done.

- [ ] **Step 1: Create an Expo access token**
  expo.dev → Account → **Access Tokens** → create one named `github-ci`. Copy it.

- [ ] **Step 2: Add GitHub repo secrets**
  GitHub repo → Settings → Secrets and variables → **Actions** → New repository secret:
  - `EXPO_TOKEN` = the token from Step 1.
  - `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` = the full contents of the Play service-account JSON (the same file used locally as `play-service-account.json`). Paste the raw JSON as the value.

- [ ] **Step 3: Create the approval environment**
  GitHub repo → Settings → **Environments** → New environment named exactly `production` → enable **Required reviewers** → add the owner's GitHub account → save. (This is the one-tap approval gate both deploy jobs wait on.)

- [ ] **Step 4: Confirm EAS credentials are intact**
  Confirm `eas credentials` shows the Android production keystore as `M7r91j0b83` (upload cert SHA1 `21:88:52:36:B7:CB:5C:9F:09:86:CD:09:F9:D7:60:A9:EE:51:40:BB`). CI does not create or change credentials; `eas build` uses this server-side keystore. Never auto-generate.

---

## Task 9: Shakedown — prove the chain end-to-end

> Do this once, after Task 8, before relying on the pipeline. Use a deliberately trivial OTA so a failure is harmless. (The first *real* feature ship is IMP-008, handled separately.)

- [ ] **Step 1: Make a trivial JS-only change**
  Edit a user-invisible code comment in any `src/` file (e.g. add a line `// release pipeline shakedown` at the top of `src/RitualsApp.js`).

- [ ] **Step 2: Commit with the OTA trailer**

```bash
git add src/RitualsApp.js
git commit -m "chore: release pipeline shakedown

Release-Lane: ota"
```

- [ ] **Step 3: Push and watch**

```bash
git push origin main
```
Expected sequence in the GitHub **Actions** tab:
1. `Release` workflow starts; `classify` detects `lane=ota`, backstop passes (no native files), `npm test` passes.
2. The `ota` job appears as **Waiting** for the `production` environment review.

- [ ] **Step 4: Approve**
  In the run (or the GitHub mobile app notification), click **Review deployments** → approve `production`. The `ota` job runs `eas update --branch production`.
  Expected: job succeeds; the update appears in the EAS dashboard under branch `production`.

- [ ] **Step 5: Confirm on a device**
  On a tester device running v5+, cold-start the app twice (expo-updates downloads on first launch, applies on the next). Confirm no crash. (The comment change is invisible — success = the update is fetched, visible in the EAS dashboard's "recent deployments" for that device's runtimeVersion `1.0.0`.)

- [ ] **Step 6: Test rollback (optional but recommended)**
  Actions tab → **Rollback OTA** → Run workflow → approve. Confirm it completes. If `--non-interactive` errors, note the working rollback command in PROGRESS.md per Task 6's fallback.

- [ ] **Step 7: Record outcome in PROGRESS.md**
  Write a dated "Last session note": pipeline live, shakedown OTA shipped + (rolled back), and that IMP-008 is the next (first real) ship. Commit (no trailer needed — this is documentation).

---

## Self-review notes (author)

- **Spec coverage:** trigger via trailer (Task 5), classification + backstop (Task 5), OTA lane (Task 5), build lane + auto-submit (Tasks 4–5), agent bump scripts + rules (Tasks 1–2, 7), secrets/environment (Task 8), notifications = GitHub-native (inherent), rollback (Task 6), shakedown §6 (Task 9). The OTA-config correctness gap (legal URLs) is covered by Task 3 (not in spec — added during planning).
- **Owner-confirmed value:** the closed-testing track name (Task 4 Step 1) — the only value that must come from the owner at execution time.
- **Future note (not this plan):** when Plus is enabled (Phase 10b), `rcAndroidKey` must be supplied to CI (EAS env var or GitHub secret exported before `eas update`/`eas build`), or OTA will publish an empty RC key.
