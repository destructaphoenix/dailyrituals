# Design — Streamlined Release Pipeline

> **Status:** approved (2026-06-07). Next: implementation plan via writing-plans.
> **Goal:** remove the owner from the mechanics of releasing. Cosmetic / OTA-qualified
> changes ship with a single approval tap and nothing else from the owner. Changes that
> need a full native build are prepared end-to-end by the agent ecosystem (Opus + Sonnet)
> and built/submitted by CI, leaving the owner only the Play Console steps Google forces a
> human to perform.

---

## 1. Context

Daily Rituals is a free Android app (Expo / React Native, JavaScript) currently in Play
**closed testing** (12×14 gate). It is built by **Opus** (planning) and **Sonnet**
(execution) across many short chats, coordinated through `PROGRESS.md` (cross-chat memory)
and `DEVGUIDE.md` (the chat prompts). The owner is a solo dev who currently runs every
`eas` command by hand and has to remember the OTA-vs-build rules.

Key existing facts the pipeline must respect:

- **`runtimeVersion.policy = appVersion`** (= the `version` string). Chosen because
  `fingerprint` is non-deterministic between the owner's Windows machine and EAS's Linux
  servers (it embeds absolute paths + CRLF-hashed `node_modules`). Consequence: there is
  **no automatic guard** stopping an OTA from landing on a native-incompatible build — the
  pipeline must supply that guard manually (see §4).
- **OTA only reaches builds ≥ versionCode 5 / version 1.0.0** (v4 predates `expo-updates`).
  v5 is the OTA baseline.
- **Signing:** production `.aab` MUST be signed with the EAS server-side keystore
  `M7r91j0b83` (upload cert SHA1 `21:88:52:36:B7:CB:5C:9F:09:86:CD:09:F9:D7:60:A9:EE:51:40:BB`).
  Never auto-generate a keystore. The keystore lives on EAS, never in git/GitHub.
- **`android/` is gitignored** and never goes to GitHub. EAS regenerates native code via
  prebuild at build time. OTA does not touch native code at all.
- Channel ↔ branch: production builds listen on channel `production`; `eas update --branch
  production` serves them.
- Repo: `https://github.com/destructaphoenix/dailyrituals`. No CI today.

## 2. Goals / Non-goals

**Goals**
- Cosmetic/OTA changes reach testers with one approval tap from the owner, no commands.
- Full builds: agents do 100% of the codebase work; CI builds + submits to the testing
  track; owner only does Play's human-gated steps.
- The OTA-vs-build decision and the version-bump discipline are encoded into the agents and
  enforced by CI — not the owner's memory.
- Fail safe: a mislabeled change can never publish as a broken OTA.

**Non-goals (Google forces these to stay manual — out of scope for automation)**
- Closed-testing → production promotion and the 12×14 gate.
- Store-listing / data-safety / content-rating edits.
- Production review submission.
- iOS (Phase 11, blocked on Mac/Apple Dev).

## 3. Locked decisions (from brainstorming, 2026-06-07)

| Decision | Choice |
| --- | --- |
| Automation host | **GitHub Actions** (cloud CI) |
| OTA release approval | **One-tap approval** via a GitHub "production" environment with the owner as required reviewer |
| Build release approval | **One-tap approval** (same gate) — builds are higher-stakes than OTA |
| Build automation depth | **Build + auto-submit** to the closed-testing track; owner handles Play gates only |
| Trigger | **Explicit `Release-Lane:` commit trailer** — NOT every push. Normal per-task commits ship nothing. |
| Secrets | `EXPO_TOKEN` + `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` as encrypted GitHub secrets. Keystore stays on EAS. |
| Notifications | GitHub-native (email + GitHub mobile app) |

## 4. Architecture

### 4.1 Trigger — intentional releases via commit trailer
Agents commit per task as today; those commits do **not** trigger a release. A release
fires only when a shippable unit is finished and the agent ends with a trailer:

- `Release-Lane: ota` — JS-only change
- `Release-Lane: build` — native change (agent has already bumped versions per §4.4)

The agent then pushes to `main`. The release workflow is filtered to act **only** on the
HEAD commit carrying a `Release-Lane:` trailer. Mid-task WIP can be pushed freely without
triggering the approval flow.

### 4.2 Classification + safety backstop
On a triggering push, the workflow:
1. Reads the declared lane from the trailer.
2. Independently diffs the changed files against a **native-affecting path set**:
   `app.config.js`, `package.json`, `package-lock.json`, `assets/**`, `eas.json`,
   `babel.config.js`, and the plugins list.
3. Reconciles:
   - trailer `ota` **and** no native paths changed → proceed OTA lane.
   - trailer `build` → proceed build lane.
   - trailer `ota` **but** native paths changed → **STOP + alert the owner** (mismatch).
     A broken OTA can never ship; the fix is to re-tag as `build`.

This backstop is the manual replacement for the lost `fingerprint` auto-guard.

### 4.3 The two lanes

**OTA lane**
```
checkout → npm ci → npm test (53-test gate)
        → [wait: one-tap approval, production environment]
        → eas update --branch production --message "<commit subject>"
```
Runs entirely on the GitHub Linux runner (OTA bundles JS only; no native build). Live on
testers' next app launch. Rollback exposed as a separate manual `workflow_dispatch`
("rollback OTA") that runs `eas update:rollback`.

**Build lane**
```
checkout → npm ci → npm test
        → [wait: one-tap approval, production environment]
        → eas build -p android --profile production   (runs on EAS cloud, keystore M7r91j0b83)
        → eas submit -p android --profile production   (uploads .aab to the closed-testing track)
        → notify owner (build + submit result)
```
`eas build`/`eas submit` are kicked off from the runner via `EXPO_TOKEN`; the actual
compile happens on EAS. Submit uses `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`. The
`eas.json` submit profile's `track` is set to the testers' closed-testing track.

### 4.4 Agent rules — the "do the needful" half
A **Release rules** block is added to `PROGRESS.md` (and referenced from `DEVGUIDE.md`) so
every Opus/Sonnet chat reads and obeys it:

- Each task carries a lane tag (already the convention in the IMP backlog) — kept.
- **Build lane:** the agent runs a deterministic bump helper so it cannot fumble the math:
  - `npm run bump:build` → `android.versionCode += 1`
  - `npm run bump:native` → `version` patch += 1 **and** `android.versionCode += 1`
    (use whenever native runtime changes, so OTA stays scoped to compatible builds)
- The agent ends shippable work with the `Release-Lane:` trailer and pushes.
- The agent updates `PROGRESS.md` ship-lane note + "Last session note" as today.

The bump helpers are small Node scripts that edit `app.config.js` in place (single source
of truth for `version`/`versionCode`).

### 4.5 Components & boundaries
- `.github/workflows/release.yml` — the trailer-triggered classify → gate → deploy workflow
  (both lanes; branches internally on the resolved lane).
- `.github/workflows/rollback-ota.yml` — manual `workflow_dispatch` wrapping
  `eas update:rollback`.
- `scripts/bump-build.mjs` + `scripts/bump-native.mjs` (or one script with a flag) — version
  bumpers; wired as `npm run bump:build` / `npm run bump:native`.
- `eas.json` — submit profile `track` pointed at the closed-testing track.
- `PROGRESS.md` "Release rules" block + `DEVGUIDE.md` reference — agent-facing contract.
- GitHub secrets `EXPO_TOKEN`, `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`; GitHub "production"
  environment with owner as required reviewer.

Each piece is independently understandable: the workflow only orchestrates; the bump
scripts only edit versions; the PROGRESS rules only tell agents what to do; secrets/env are
configuration.

## 5. Secrets & one-time owner setup (dashboards, not code)
1. Create an `EXPO_TOKEN` (robot/access token) at expo.dev → add to GitHub repo secrets.
2. Add the Google Play service-account JSON contents as `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
   in GitHub repo secrets.
3. Create a GitHub **"production" environment** with **the owner as a required reviewer**
   (this is the one-tap approval gate for both lanes).

The keystore is NOT a GitHub secret — it stays on EAS as `M7r91j0b83`.

## 6. Testing the pipeline itself
- Bump scripts: unit-test the version-edit logic (input app.config → expected
  version/versionCode), since a wrong bump breaks releases. TDD per house style.
- Classification logic: if non-trivial, extract the native-path-set decision into a tested
  pure helper the workflow calls; otherwise keep it as a transparent shell step with a
  documented path list.
- Dry-run validation: first real OTA goes out as a deliberate trivial change so the
  end-to-end (trailer → tests → approval → `eas update` → device receives it) is observed
  once before relying on it.
- `npm test` stays the green gate (currently 53/53) and must remain so.

## 7. Risks & mitigations
- **Auto-OTA ships a bad-but-tests-pass change.** Mitigated by: the one-tap approval gate
  (human still sees it ships), the test gate, and one-button rollback.
- **Agent mislabels lane.** Mitigated by the §4.2 path backstop (fails safe to "stop").
- **Play service-account secret is sensitive.** Accepted; encrypted GitHub secret, scoped to
  the actions runner, revocable; keystore remains separate on EAS.
- **Closed-testing clock.** In-place updates (OTA or new build) do not reset the 12×14
  clock; only a true uninstall does. Pipeline never uninstalls.

## 8. Open questions
None. All forks resolved in brainstorming (2026-06-07).
