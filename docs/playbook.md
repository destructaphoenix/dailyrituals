# Daily Rituals — Project Playbook (stable reference)

> **Not read every chat.** This is stable reference — open it only when you actually need it:
> shipping a change, touching the phase ladder (8 / 10b / 11), or checking signing / config / architecture.
> The live cursor is [`PROGRESS.md`](../PROGRESS.md); finished specs + old notes are in [`build-log.md`](build-log.md);
> how to drive a Sonnet chat is [`DEVGUIDE.md`](../DEVGUIDE.md).
> Full step-by-step build plan (per-task code): [`docs/superpowers/plans/2026-06-03-daily-rituals-expo-billing.md`](superpowers/plans/2026-06-03-daily-rituals-expo-billing.md).

---

## 🧭 Product thesis — why anyone would pay (written 2026-08-03)

The owner asked: *"What value does Daily Rituals add to a user's life that they would give us money? Even a dollar is money and it needs to be justified."* This section is the answer, and it should govern what gets built and what gets charged for.

**Nobody pays for a text box.** People pay a journal for exactly two things:
1. **Continuity** — the app is *the reason they kept going*. Streaks, embers, levels, the memorial-garden voice, the reminder. **Daily Rituals is strong here.**
2. **Retrieval** — the app *hands their past back to them*. Search, resurfacing, recap, keepsakes. **Daily Rituals has almost none of this.**

**Value in a journal accumulates — this is the central fact.** On day 1 the app is worth **$0 to anyone**; an empty journal has no value and no feature changes that. By day 30 it is "a streak I don't want to break." By day 400 it is "a record of my life I cannot replace." So:

- **The paying moment is not signup. It is month 2–3, when the user first has something to lose.**
- Therefore the **free tier must be good enough to carry someone to ~day 60**, or there is never a paying moment at all.
- Therefore the **paid tier should be things that are worthless on day 1 and priceless on day 400** — Annual Recap, "On this day", keepsake export, deeper insight. This is not a coincidence; it is why the "legacy" roadmap was always the right instinct.

**The uncomfortable finding (audited 2026-08-03).** The app is **all continuity and no retrieval**:
- **No search anywhere.** Zero. A user cannot find anything they have written.
- **Editing is today-only** — `canEdit={isEditableToday(reading, todayKey())}` ([`RitualsApp.js:489`](../src/RitualsApp.js#L489)). A typo from yesterday is permanent.
- **No delete.** A user cannot remove something they regret writing.

For a journal this means **the archive is write-only** — words go in and cannot come back out. That is a category-level failure, not a polish gap, and it is precisely the "basic and fundamental" work to do before any design work. It also **blocks the paid thesis**: you cannot sell "revisit your past" on top of an archive nobody can navigate.

**The line for what is free forever vs what is paid.** Test every feature with: *am I charging for their words, or for my work on their words?* Only the second is defensible.
- **Free forever — custody of their own words:** write, read, **search**, edit, delete, full history, raw export.
- **Paid — the app doing work for them:** recap, resurfacing, deeper analysis, keepsake artifacts, cosmetics, convenience.

This line is also the structural defence against money grievances: a user who stops paying never loses access to anything they wrote.

**One sentence:** *Daily Rituals makes you keep going, then gives you your years back.* Today it does the first half only — and the first half alone is not something people pay for (Duolingo's streaks are free; you pay for what surrounds them).

---

## 🌱 What users GROW, and what we compute on it (2026-08-03)

Follows directly from the thesis above. The owner asked: *"what else can I let users grow that I can compute and sell?"* — reaching for a FIFA-style collect-and-spend loop. **Two different things are being conflated, and only one of them is worth money.**

| | **Currency (embers)** | **Record (entries, moods, days, time)** |
| --- | --- | --- |
| What it is | a game loop we invented | the user's actual life, accumulated |
| Can be rushed? | yes (that was the cash SKU) | **no — only by showing up** |
| Who values it | us, as a retention lever | **the user, more every single day** |
| Worth selling compute on? | no — a closed loop we both make and sink | **yes. This is the entire moat.** |

**Embers are engagement, not value.** Keep them; they work. But the thing to build the paid tier on is the **record**, because it is the only asset that cannot be bought, cannot be rushed, and is worth more on day 400 than day 40.

⚠️ **Two traps in the FIFA framing.** (1) FIFA's collection monetises through **randomised packs** — gambling-adjacent, requires odds disclosure under Play policy, and is tonally indefensible in an app about grief and reflection. **Never build randomised paid rewards here.** (2) FIFA has an infinite catalogue; **this shop does not.** At `EMBER_GAIN = 15`/day the entire ember-purchasable catalogue is **1,620 embers ≈ 108 days**, after which candles are the only repeating sink and embers become worthless. **The shop runs out around day 110** — a live engagement problem independent of the money question, and it needs either more sinks or a rotating catalogue. Not scoped (owner has deferred design work), but do not forget it.

### Accumulators worth adding — prefer PASSIVE ones

Every *active* accumulator (something the user must remember to do) adds friction to a habit app whose primary enemy is dropout. **Passive accumulators cost the user nothing and still compound.** Ranked by value-per-unit-of-friction:

| Accumulator | Effort | What it lets us compute and sell |
| --- | --- | --- |
| **Time-of-day of each entry** (passive — just stamp it) | none | "You write best at 9pm" · "Your Sunday mornings are your most hopeful" · rhythm insight |
| **Word count over time** (already computable — `totalWords` exists) | none | "Your entries got 3× longer this year" · depth-of-reflection trend |
| **Active span + coverage density** (already there) | none | milestone timeline (the piece deferred out of IMP-021) · "your 100th day" |
| **Moods, multiple + custom** (IMP-037) | tiny | mood correlations, seasonal patterns — makes the **dead** `PLUS_PERKS` #5 real |
| **Tags** — `#mom`, `#work` (the ONE active accumulator worth adding) | small, optional | "you mentioned work 40% less this autumn" · smart collections · the strongest feature in comparable journals |
| **Monthly one-question check-in** (1–5, ten seconds) | small | a year-long line graph from almost no input |

**Explicitly rejected:** photos (backup bloat — the whole store rides Android Auto Backup) · weather/location (needs network + permissions, breaks the offline promise) · a **second currency** (dilutes embers) · on-device NLP name extraction (unreliable; tags do the same job honestly).

### The paid layer, as one coherent story

Plus = **memory and meaning**, computed over the record: **"On this day"** (IMP-038) · **Annual Recap / Time Capsule** (roadmap C) · **mood correlations & seasonal patterns** (perk #5) · **keepsake PDF** (perk #4, IMP-022) · **rhythm insight** (time-of-day + length) · **tag analytics** · **milestone timeline** · **smart collections** (saved searches — built free in IMP-035, *saved* ones are Plus).

Note how much of that list is **already sold on the paywall and not built**. Building it is not adding scope; it is paying a debt.

**North star for when design work resumes:** the app's metaphor is a memorial *garden*. The most powerful accumulator available is **the garden itself visibly growing** with the record — more graves, more flowers, seasons turning. That is the record made visible, in the app's own voice, and no competitor can copy it because it is not a feature, it is the theme.

### More offerings (2026-08-03) — ranked, with the warning first

⚠️ **The bar is depth, not count.** Duolingo Super is roughly *no ads · unlimited hearts · some practice* — a short list people actually want. A paywall listing fifteen shallow items converts **worse** than three good ones, and this app is already carrying **four sold-but-unbuilt promises**. Build the debt first; treat the list below as a menu to choose 2–3 from, not a backlog to clear.

**Tier 1 — strongest, and cheap:**
- **🕯️ Time capsule / letter to your future self.** Write an entry sealed until a date you choose; it surfaces on that day. Store an `unsealAt` on the entry — that is nearly the whole build. **It is the only idea here that *creates* accumulation rather than computing on it**, the emotional payoff is enormous, and it is perfectly in the memorial-garden voice. Strongest single candidate.
- **🔥 Streak insurance.** Auto-spend a candle when a day is missed, instead of making the user notice and act. Duolingo-proven as one of the highest-converting subscription perks, and it gives candles (currently the only repeating ember sink) a real job.
- **⏰ Reminder at your best hour.** Computed from the time-of-day accumulator — "you write most at 21:40, so we'll nudge you at 21:20". Pure compute over the record, and it makes the existing IMP-031 reminder smarter rather than adding a new surface.
- **📚 Prompt packs.** Themed decks — grief, gratitude, transitions, new parent. IMP-023's deck architecture already supports it; new pools are **pure data**, no new mechanism.

**Tier 2 — real, but more work:**
- **🗂️ Multiple journals** (work / personal / a person you're grieving) — common paid feature, but it touches every screen and the whole persistence shape. Not cheap.
- **🎂 Anniversary notifications** — "a year ago today you wrote…" as a push. Natural extension of IMP-038 once that exists.
- **🏅 Milestone keepsakes** — a real artifact at 100 days / one year. Pairs with the deferred milestone timeline and the keepsake PDF.
- **🖼️ Shareable year card** — an image for social, which is also the only organic growth loop here. **Must never include entry content by default** — opt-in, numbers only.

**Should be FREE, deliberately** — the free tier has to carry someone to ~day 60 or there is never a paying moment: search (IMP-035) · edit/delete (IMP-036) · reminder · backup/export · **biometric app lock** (table stakes for trusting a journal at all) · basic insights.

**⚠️ Handle with care:** mood *prediction* or warnings ("your Februaries are hard") is powerful and tonally dangerous — it edges into mental-health inference for a product with no clinical basis. If ever built, describe the past, never forecast the future.

### 🔒 Analytics — the owner asked whether to collect behaviour data. Three tiers, one line

The word "collect" hides a decision. Separate it:

1. **Content** — entries, moods, tags. **Never leaves the device. Non-negotiable.** For a journal, privacy *is* the product; this is the one thing no better-funded competitor can take away. Shipping content analytics would be a trust catastrophe the day anyone noticed.
2. **Behaviour** — screens opened, features used, retention. Technically possible, but it **reverses the local-only decision**: Play Data Safety re-declaration, privacy-policy rewrite, DPDP/GDPR consent + deletion duties, and the loss of the "nothing you write leaves your phone" claim.
3. **Crashes** — stack traces. Most defensible, still requires disclosure.

**Recommendation: personalise entirely ON-DEVICE, and add no analytics SDK yet.**
- Every personalisation idea in this document — best writing hour, mood patterns, recap, resurfacing — needs data **that is already on the device**. On-device is not a compromise here; it is **strictly better**: complete data instead of sampled, no latency, no consent friction, no legal surface. There is no product reason to ship it anywhere.
- For *product* decisions, the cost/benefit is bad right now regardless: at closed-testing volume, behavioural analytics tells you **nothing** statistically, while costing the differentiator permanently.
- **You already have analytics you are not reading.** Play Console gives installs, uninstalls, retention cohorts and ratings; **Android vitals** gives crash-free rate, ANRs and stability — **zero code, zero SDK, zero privacy cost, no disclosure change**. Exhaust that before considering anything else.
- If usage analytics is ever genuinely needed: **opt-in, off by default, aggregate counts only, never content, and stated plainly in onboarding.** Anything less contradicts what this app sells.

### 📺 Ads — asked 2026-08-03. Answer: no banners or interstitials, ever. Rewarded video *maybe*, later.

**First, an audited fact that decides most of this.** `grep` for `fetch(` / `axios` / `XMLHttpRequest` across `src/` returns **zero in-app network calls**. The only URLs in the codebase are external links handed to the browser ([`billing/config.js:23–27`](../src/billing/config.js#L23)), and `Purchases.configure()` never runs in the shipping free build (`PLUS_ENABLED = false`, no key). **The app today talks to no server at all.** An ad SDK would be the *first* thing that ever did — and ad SDKs are the most data-hungry category available: device advertising ID, IP, and behavioural signals for targeting.

**The revenue maths, honestly.** Ads pay at scale and are a rounding error below it. India-weighted, non-gaming eCPM is roughly $0.10–$0.50 banner, $0.50–$2 interstitial, $1–$5 rewarded. At **1,000 DAU** — far above where this app is — banners at 5 impressions/user/day yield on the order of **$45/month**. At 100 DAU it is under $5. Meanwhile 100 DAU converting at 2% to $29.99/yr is comparable *immediately* and, unlike ads, **compounds with retention and costs nothing in trust**. Ads only become real money in the tens of thousands of DAU.

**The four costs, in order of severity:**
1. **It destroys the only differentiator.** "Nothing you write leaves your phone" is the one claim a better-funded competitor cannot copy. An ad SDK ends it — Play Data Safety must declare collection for advertising, the privacy policy is rewritten, and EEA/UK need a UMP consent flow. This is strictly worse than the analytics question, not a variation of it.
2. **Tonal catastrophe.** This is an app about grief and remembrance where entries are graves you tend. A banner for a mobile game or a loan app under someone's reflection on a dead parent is not squeamishness — it is product incoherence, and users feel it before they can name it.
3. **It cannibalises the subscription.** With ads in the free tier, "remove ads" becomes the de facto reason to subscribe — a **weak** reason that retrains the paywall away from memory and meaning toward making an annoyance stop. Duolingo can carry both because of scale; at indie scale you get the trust cost without the revenue.
4. **More compliance surface** (ad content rating, families policy, placement rules) at exactly the moment API-36, BillDesk and an untruthful paywall are already in flight.

**The one defensible form, if it ever happens: rewarded video in the Shop.** *"Watch an ad, get 15 embers."* Opt-in, never interrupts, never appears near an entry, and it monetises the free users who will never subscribe. It also patches a real hole: dropping cash ember packs (2026-08-03) removed the only cash-in for the currency, and rewarded video restores one without an unrestorable purchase. **Still not now** — it carries costs 1 and 4 in full.

**The strategic point that actually answers the question.** The instinct here was to add a *second* revenue surface while the first one sells **four things that do not exist** (`PLUS_PERKS` audit, 2026-08-03). That is not a monetisation-surface problem, it is a **delivery** problem. Adding ads before the paywall is truthful is adding a second leaky bucket. **Ship the promised perks, then judge whether revenue is still missing.**

---

## Locked decisions (2026-06-03)

| Decision | Choice |
| --- | --- |
| Billing SDK | **RevenueCat** (`react-native-purchases` v8 + Expo config plugin) |
| Language | **JavaScript** — lift reference verbatim, no TS conversion |
| Scope | **Lift app + wire billing only.** All non-billing state (entries, embers, streak, settings) stays in-memory as in the reference |
| Build target | **Dev only for now.** Android dev client locally; EAS submission + iOS build = Future |
| Expo Go behavior | App must keep running in Expo Go via **sim fallback** when no SDK key / native module (so every screen stays reviewable) |

**Reference assets** (git-ignored — never edit, copy out of):
- Design spec — `design_handoff_plus_compliance/README.md` (screens, copy, tokens, states).
- Working reference code — `design_handoff_plus_compliance/RitualsNative_reference/` (the complete Expo app this build lifts in).

---

## Release strategy — free-first (Part II, added 2026-06-04)

Part II restructured the build around a **FREE-FIRST release**. ⭐ Ship to Play as a **free** app first (Plus hidden behind a `PLUS_ENABLED` flag), then turn on paid Plus in a follow-up update (v1.1). Three independent finish lines: **A** free app live (10a) → **B** monetization live (10b) → **C** iOS (11). A free launch needs **no payments and no BillDesk** — but it **does** need a hosted privacy-policy page (built in 10a) + Play store listing. BillDesk (India PA-CB payout verification, up-to-90-day clock) gates **10b only**. Recommended order: **8 → 9 → 10a → 10b → 11**. Part II reverses two original locked decisions — "dev only" and "all state in-memory" — on purpose; each phase lists owner decisions to confirm first. Full rationale in the plan's "**PART II → Release strategy**" box.

---

## 🤖 Release rules (how shipping works — read before you ship)

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
4. **Push `main`.** CI runs the test gate, then waits for the owner's one-tap approval, then ships: OTA (`eas update`) or build + auto-submit to closed testing (`alpha` track).
5. **No trailer = nothing ships** — safe for work-in-progress pushes.

Guardrails: a commit tagged `ota` that touched native files is auto-rejected by CI's backstop (re-tag as `build`). OTA reaches testers on **v5+** only. Rollback: owner runs the **Rollback OTA** workflow (Actions tab). Owner one-time setup (tokens/secrets/approval environment) is in the pipeline plan, [`docs/superpowers/plans/2026-06-07-streamlined-release-pipeline.md`](superpowers/plans/2026-06-07-streamlined-release-pipeline.md), Task 8.

### Ship lane — which fix ships how (decide per task)
| What changed | Lane | Command | Play review? |
| --- | --- | --- | --- |
| JS / UI / copy / logic / JS assets only | **OTA** | `eas update --branch production --message "…"` | ❌ none (minutes) |
| Native dep, permission, SDK/target, icon/splash, `app.config` native field, version bump | **Full build** | bump `android.versionCode` → `eas build -p android` → upload `.aab` | ✅ required |

- OTA only reaches builds **≥ versionCode 5**. The v4 build in review can't receive it — so the **first full build we push for improvements (versionCode 5) is what turns the OTA lane on** for everything after.
- Tag every task with its lane so we batch OTA-able fixes and only rebuild when something native actually changes.

### Release invariants (don't relearn these)
- **runtimeVersion policy = `appVersion`, NOT `fingerprint`.** `fingerprint` is non-deterministic between this Windows dev machine and EAS's Linux servers (absolute paths + CRLF-hashed `node_modules` → mismatched hashes → OTA rejected). So OTA targets runtimeVersion = the `version` string.
- **Native change → bump `version`** (`npm run bump:native`) so OTA is scoped to compatible builds; **pure-JS fix keeps the same `version`** (`versionCode` still bumps every upload). This is the manual replacement for the lost fingerprint auto-guard.
- **First OTA-capable build = versionCode 5 / version 1.0.0** (v4 predates `expo-updates`). v5 is the OTA baseline.
- Channels = branches: production builds listen on channel `production`; `eas update --branch production` serves them.

_(Older manual `eas` lane reference is in [build-log.md](build-log.md) → "Update workflow".)_

---

## 🔑 Android release signing — DO NOT BREAK (critical, repo-invisible)

Production `.aab` **must** be signed with the local **`dailyrituals-release.keystore`** (git-ignored, in project root):

| Field | Value |
| --- | --- |
| Keystore file | `dailyrituals-release.keystore` (project root, git-ignored — also backed up off-repo by owner) |
| Alias | `daily-rituals` |
| Password location | `android/keystore.properties` + `credentials.json` (both git-ignored — never commit) |
| **Upload cert SHA1** | `21:88:52:36:B7:CB:5C:9F:09:86:CD:09:F9:D7:60:A9:EE:51:40:BB` |
| Upload cert SHA256 | `F4:3B:1D:1B:B5:DB:C8:4E:D4:BA:45:6B:A4:1A:F2:64:70:78:BE:D6:AA:BF:3E:2E:99:B1:B6:FA:3D:D5:ED:0D` |
| Where EAS stores it | Server-side as Build Credentials **`M7r91j0b83`** (default, production) — confirmed matches the SHA1 above |

- This SHA1 is the cert **Play App Signing registered as the upload key**. Any build signed with a *different* key (e.g. an EAS auto-generated keystore) is **rejected** ("signed with the wrong key"). **Never let EAS auto-generate a new keystore for this app.**
- Losing the keystore = forced Play **upload-key reset**. Keep it + its password backed up off-repo.
- SDK versions are pinned via **`expo-build-properties`** in `app.config.js` (the `android.minSdkVersion`/etc. config keys are no-ops in Expo): `minSdkVersion 24` (RevenueCat), `compileSdkVersion`/`targetSdkVersion 36` (Play API-36 / Android 16 requirement, mandatory for update publishing from **2026-08-31** — raised from 35 by IMP-027), `buildToolsVersion 36.0.0`. Bump `android.versionCode` on every Play upload (**currently 9**; version `1.0.3`).
- **Architecture: Legacy, held deliberately.** Expo SDK 54 defaults New Architecture **ON**, so `newArchEnabled: false` is set explicitly at the **top level of `expo`** in `app.config.js` — the canonical SDK-54 field. The deprecated `expo-build-properties.android.newArchEnabled` is intentionally left unset so there is only one switch. `expo install --fix` / `prebuild` will silently flip this app to Fabric/TurboModules if that line is removed. SDK **55 drops Legacy Architecture entirely** — migrating is its own future task, not a side effect of a compliance bump.
- **Current stack (post-IMP-027):** Expo SDK **54**, React Native **0.81.5**, React **19.1.0**, `jest-expo` **54**. `src/backup/io.js` imports **`expo-file-system/legacy`** — SDK 54's default export replaced the string-based API (`writeAsStringAsync`/`documentDirectory`/`EncodingType`) with a File/Directory API; `/legacy` re-exports the old surface unchanged.
- **`postinstall` patches `expo-modules-core`** (`scripts/patch-permissions.js`): upstream still force-unwraps `requestedPermissions!!` in `PermissionsService.kt` as of `expo-modules-core@3.0.30`, which crashes on a permission check when the manifest declares no runtime permissions. The script fails **loudly** (non-zero exit) if neither the buggy nor the patched line is found — re-verify it on every SDK bump against the **pristine npm tarball**, not the installed copy (the installed copy is what the patch rewrites, so it can't answer the question).

---

## Phase ladder — Part II (8 / 10b / 11) — PARKED

> **Parked until the owner explicitly resumes.** The live track is the IMP backlog in [`PROGRESS.md`](../PROGRESS.md).
> Decisions to confirm per phase live in the plan's **PART II** section. Do not start a phase until its decisions are answered.
> Phases 0–7 + 9 are ✅ done (detailed checklists in [build-log.md](build-log.md)).

### Phase 8 — Runtime verification closeout (no new code)
- [ ] 8.1 Walk all 5 purchase outcomes in Expo Go (success/cancel/failed/network/owned), revert `theme.js`
- [ ] 8.2 Walk both restore outcomes (found/empty); confirm sim fallback never crashes
- [ ] 8.3 Tick the deferred Phase 3 + Phase 4 boxes (in build-log) with evidence; commit PROGRESS.md

### Phase 10a — Free public release (Plus hidden, no payments)
- [x] 10a.1 Gate the Plus surface behind `PLUS_ENABLED = false` (hide paywall/manage/upsell + skip onboarding premium) — CODE
- [x] 10a.2 Build + host the minimal legal website (privacy + terms + support); set `PRIVACY_URL`/`TERMS_URL` in `.env`
- [x] 10a.3 Expo/EAS account + `eas.json` (dev/preview/production profiles)
- [x] 10a.4 Production `app.config.js` (version, versionCode autoincrement, icon/splash, runtimeVersion)
- [x] 10a.5 `eas build -p android` ✅ (signed `.aab` built + uploaded; Play listing + data safety + content rating done; release **sent for review** 2026-06-06)
- [x] 10a.6 **Closed testing gate** — Play requires **12 testers opted-in for 14 continuous days** (individual accounts post-2023-11-13) before "Apply for production" unlocks. ✅ Cleared 2026-07-29 — production access unlocked on Play Console.
- [x] 10a.7 **Apply for production + submit.** ✅ **v1.0.3 / versionCode 9 submitted to production review 2026-07-30.** Ships FREE (`PLUS_ENABLED = false` ⇒ no payment surface). Carries IMP-027 (SDK 54 / API 36). ⏳ Awaiting Google review.
- _No payments, no BillDesk, no RevenueCat production key needed for 10a._
- **⭐ 10a is what unblocks 10b.** BillDesk verification asks for the live app's Play Store URL — see 10b.1.

### Phase 10b — Enable monetization (turn Plus on → v1.1)
> **Order matters and is not obvious.** BillDesk needs a published listing; payments need BillDesk. So the *free* launch (10a.7) is the unblock for this entire phase — "hold the launch until payments work" is a deadlock, not a plan. Recorded 2026-07-30.
- [x] 10b.1a BillDesk PA-CB seller verification — **application submitted 2026-07-30** with the owner's details, after the 10a.7 production push supplied the live Play Store URL it required.
- [ ] 10b.1b ⏳ **BillDesk/Google verify the payments profile.** Submitted is not approved — subscription products cannot be activated until this clears. Watch mail from `onboarding@billdesk.com` + Play Console → Payments profile. Window opened **2026-06-04**, ≤90 days ⇒ ~**2026-09-02**.
- [ ] 10b.2 Live Play subscription products (annual + monthly). **Decide the free-trial offer here** — the paywall's "7-day free trial" copy is currently hardcoded and is only truthful if the base plan carries that offer (see IMP-028). RevenueCat production key was already swapped 2026-06-06.
- [ ] 10b.3 Attach products to RevenueCat `plus` / `current`; confirm offerings return live prices. The paywall now renders whatever the offering returns (IMP-028) — so an empty/misconfigured offering shows the fallback constants, not a crash. Verify the real prices actually appear.
- [ ] 10b.4 **Create the `RC_ANDROID_KEY` EAS env var + GitHub repo secret** — `.env` is git-ignored and never reaches EAS Build, so without this a cloud build silently ships the purchase *simulation*. `eas env:create --name RC_ANDROID_KEY --scope project --environment production`, plus a repo secret of the same name for `release.yml`. `scripts/check-billing-config.js` fails the build if this is missed once Plus is on.
- [ ] 10b.5 Flip `PLUS_ENABLED = true`; `eas build`; internal-track verify real purchase (all states, via a Play **license tester** = full flow, no charge); then one real transaction, refunded; promote → v1.1

### Phase 11 — iOS parity — ⛔ blocked (needs Mac or EAS macOS + Apple Developer Program)
- [ ] 11.1 Apple Developer + App Store Connect app record + bundle id
- [ ] 11.2 StoreKit subscription group (annual + monthly)
- [ ] 11.3 RevenueCat iOS key (`RC_IOS_KEY`); attach iOS products to `plus` / `current`
- [ ] 11.4 iOS config in `app.config.js` (bundleIdentifier, buildNumber, infoPlist)
- [ ] 11.5 `eas build -p ios` (or Mac); StoreKit-sandbox walk of all states
- [ ] 11.6 TestFlight + App Privacy + submit for review

### Per-phase entry decisions (resolved / still open)
- **Phase 9:** persistence engine ✅ confirmed AsyncStorage (2026-06-04). "Reset app data" control (9.6) — built.
- **Phase 10a:** package id ✅ `app.dailyrituals.mobile`. Needs Expo/EAS account, Google Play Developer account ($25), hosted privacy+terms page (built 10a.2). No payments/BillDesk/production RevenueCat key here. ✅ **Complete — submitted to production review 2026-07-30.**
- **Phase 10b:** **BillDesk PA-CB seller verification** (India — *initiated* 2026-06-04 via Google Play; ≤90-day window ⇒ ~2026-09-02) — **it requires the live Play Store URL, which is why 10a had to ship first**. Then live Play subscription products. RevenueCat production key already swapped 2026-06-06. Full enablement step list (Google service account JSON → RevenueCat, products → entitlement/offering, flip `PLUS_ENABLED`) is in the 2026-06-05 session note (build-log). ⚠️ Two traps recorded by IMP-028: `RC_ANDROID_KEY` must exist as an **EAS env var** (`.env` never reaches EAS Build, and the fallback is a silent purchase *simulation*), and the **"7-day free trial" copy is hardcoded** — configure that offer in Play or change the copy.

---

## Architecture quick-map (where things live after the build)

- **UI / screens** — `src/screens/*` and `src/RitualsApp.js`: lifted verbatim; only purchase *outcomes* change.
- **The billing seam** — `src/billing/`:
  - `config.js` (ids, keys, links) · `format.js` + `mapError.js` (pure, tested) · `simService.js` (Expo Go) · `revenueCatService.js` (real) · `index.js` (picks one) · `links.js` (deep-links).
- **The state machine** — `usePurchaseFlow` in `src/screens/PlusFlow.js`: pending→result overlay, now `await`s the injected service. `RESULT_META` / `PurchaseOverlay` are unchanged (kinds map 1:1 to service results).
- **Service contract** — `buy(plan)` / `restore()` / `getEntitlement()` / `getPrices()`; result `kind` ∈ `success|cancel|failed|network|owned|restored|restore-empty`. Full typedef at the top of the plan.

---

## Config you must supply (no secrets in git)

Fill these in `.env` (copy from `.env.example`, created in Phase 4) and record the IDs here as they're created:

| Item | Where | Value |
| --- | --- | --- |
| RevenueCat entitlement id | RevenueCat dashboard | `plus` (must match `ENTITLEMENT_ID`) |
| RevenueCat offering | dashboard | `current` (annual + monthly packages) |
| `RC_ANDROID_KEY` | RevenueCat → API keys | ✅ **Production `goog_…` key set in `.env`** (2026-06-06; publishable, not committed). Was sandbox `test_…`. ⚠️ **`.env` is git-ignored ⇒ it never reaches EAS Build.** Before 10b, also create it as an **EAS env var** (`eas env:create --name RC_ANDROID_KEY --scope project --environment production`) **and** a GitHub repo secret of the same name for `release.yml`. Without it a cloud build falls back to the purchase *simulation* silently — `scripts/check-billing-config.js` now fails the build instead. |
| `RC_IOS_KEY` | RevenueCat → API keys | _TBD (Phase 11 / iOS)_ |
| `TERMS_URL` / `PRIVACY_URL` | the minimal website (Task **10a.2**, free-hosted) | `https://destructaphoenix.github.io/dailyrituals-website.github.io/terms.html` / `…/privacy.html` — ✅ live (GitHub Pages) |
| Play product ids | Play Console | _TBD (Phase **10b.2**) — decide the **free-trial offer** at the same time; the paywall's "7-day free trial" copy is hardcoded_ |
| BillDesk PA-CB verification | email from `onboarding@billdesk.com` | initiated 2026-06-04 · **application submitted 2026-07-30** (the 10a.7 production push supplied the live Play Store URL it required) · ⏳ **awaiting verification** — products cannot be activated until the payments profile is approved. Window ≤90 days ⇒ ~**2026-09-02** |

---

## IMP task template (Opus copies this per issue into PROGRESS.md, fills it, adds a backlog-table row, hands to Sonnet)

```
### IMP-00X — <short title>   ·   Lane: OTA | full-build   ·   Status: ⬜
- **Goal:** <what "done" looks like, 1–2 lines>
- **Why / context:** <the symptom, request, or screenshot the owner gave>
- **Files likely touched:** `src/...`
- **Approach (decided by Opus — do not re-litigate):** <the chosen method>
- **TDD:** <which logic gets a failing test first — or "N/A, pure cosmetic">
- **Steps:**
  - [ ] 1. …
  - [ ] 2. …
  - [ ] 3. `npm test` green (must stay ≥ prior count)
- **Commit:** `<type>: <message>`
- **Acceptance:** <how to confirm it works at runtime>
- **Ship after merge:** OTA `eas update --branch production` | hold for next full build
```
