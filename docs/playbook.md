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

### 👥 Social / leaderboards / friends — owner's stated v2 direction (2026-08-04)

Owner: *"I am planning to make it a little bit social as we develop this further… progress and leaderboards and streaks and friends etc (like Duolingo). In that case the numbers and the embers and the candles mean a lot."* **Correct — and it retroactively changes two decisions in this playbook. Read this before hardening anything.**

**1. It voids the "cheating only hurts themselves" argument.** The tamper table below is written for a **single-player** app. The moment a number is *comparable between users*, forged XP/embers/streaks stop being self-deception and start being fraud against other players. Every "ignore deliberately" row flips.

**2. But do NOT harden the client now — it would be wasted work.** The correct answer under social is **server authority**, which supersedes any client-side defence built today. **A client can never be trusted about its own score.** Signing the JSON, obfuscating fields, checksumming state — all of it is thrown away the moment a server exists. **Build none of it. Ship the entitlement fix (IMP-043 §1b) and nothing else**, because entitlement is server-authoritative *already* via RevenueCat.

**3. Social requires a server and accounts. There is no offline version of a leaderboard.** This genuinely reverses the local-only decision ([[daily-rituals-local-only-decision]]) rather than sidestepping it as the Drive-backup idea does. The full bill, stated so it is not discovered late: identity/accounts · a backend a solo dev must host, pay for and keep up · PII + DPDP/GDPR duties (the exact burden rejected in June 2026) · Play Data Safety re-declaration · **moderation obligations** the moment usernames or any user-visible text exists · and server-authoritative game state.

**4. The design that keeps most of the privacy promise — a contentless heartbeat. ⭐**
The instinct will be to sync everything. Do not. **Split content from score:**
- **Never leaves the device:** entries, moods, tags, prompts — every word the user writes.
- **Syncs, opt-in:** a **daily "wrote today" ping** carrying *no content* (just a date), plus display name and derived totals.
- **The server derives the streak itself from the pings it received.** This is the key move: the streak becomes **server-authoritative without the server ever seeing a single word**. Cheating requires faking pings in real time across real days, which is far more effort than editing a JSON file and self-limiting in practice.
- The claim stays honest and marketable: **"your words never leave your device — your streak does, only if you ask it to."**

**5. Keep the social layer FREE.** Duolingo's leaderboards are free precisely because they drive engagement; Super sells convenience *around* them. Paywalling friends would throttle the network effect that is the entire reason to build it.

**6. ⚠️ Tonal risk — the one thing to genuinely worry about.** Duolingo works competitively because language learning is a skill with objective progress. **This app is a memorial garden where entries are graves you tend.** "Who journaled more this week" could read as grotesque to exactly the grieving user this app's voice attracts. Mitigation, and it should be a hard rule: **compete on consistency (showing up), never on content, volume, or mood.** Friends see streaks and days kept — never words, never how someone felt, never word counts. Ship it **opt-in and invisible by default**, so the solitary user never sees a leaderboard they did not ask for.

**Sequencing: this is v2 and must not reshape the current phase.** Its only effect on today's work is the "build no client-side hardening" ruling above.

### 🔐 Backup tampering — asked 2026-08-04. Fix the entitlement, NOT the file.

> ⚠️ **Scoped to the single-player app as it exists today.** If the social direction above is taken, the "ignore deliberately" rows flip and the answer becomes server authority — not a hardened file. The conclusion "fix only the entitlement" holds in **both** worlds, which is why it is safe to act on now.

Owner: *"no matter what, no one should be able to manipulate the backup. Right now the backup has a .json option. People can easily manipulate it."* True — and the response should be narrow, because the concern contains two very different problems.

**Start from a fact that decides the approach: a client-side-only file CANNOT be made tamper-proof.** Any signing key, HMAC secret or encryption key must ship inside the APK, where it can be extracted from the bundle in minutes. Signing the JSON is **security theatre** — it stops nobody determined, while making the file worse for everyone honest. There is no server to sign against, and adding one to defend a streak counter is not a trade worth making.

**Sort what tampering actually gains:**

| Forged field | Real consequence | Response |
| --- | --- | --- |
| **`plus: true`** | 🔴 **Free access to paid features — actual lost revenue** | **Fix properly** — make RevenueCat authoritative. See IMP-043 §1b. |
| `xp`, `embers`, `freezes`, `activePalette` | Cosmetic. There is no leaderboard, no multiplayer, no competitive integrity — a user who inflates their own numbers has cheated **only themselves** | **Ignore deliberately.** Not worth one line of defence. |
| Fabricated `entries` / streak | The user lied to themselves in a private diary | **Ignore.** (Note the app already refuses *back-filling* through the UI — IMP-036 — because that protects the streak's meaning, not against file editing.) |
| Corrupted / truncated file | 🟡 The realistic failure, and it is **accidental, not malicious** | **Already handled** — the importer validates and returns `not-json` / `not-backup` / `too-new` / `unreadable` ([`RitualsApp.js:65–69`](../src/RitualsApp.js#L65)). A plain checksum could be added for *accident detection*, clearly labelled as that and never sold as tamper-proofing. |

**So: fix exactly one thing — the entitlement — and leave the file open.**

**And the file being plain, readable JSON is a FEATURE, not a weakness.** It is the strongest possible expression of the custody principle this playbook is built on — *their words are theirs, portable, inspectable, and readable without our app*. Encrypting or signing it would contradict the free/paid line ("never gate their own writing"), work against the user's interest, and defend nothing that matters. Obsidian's entire pitch is plain files; Day One exports plain. **Keep it open on purpose, and say so.**

### 🆘 "A paying customer who loses their phone gets nothing from me" (owner, 2026-08-04)

The owner's discomfort, verbatim: *"A paying customer who somehow loses their data or phone and wants the reload on the new device will not get it. Even though they paid me, I have kept the onus on them."* **This is the most important strategic concern raised so far and it should not be soothed away.** Precise position:

**What is already recoverable (the fear is smaller than it feels):**
- **The subscription always survives.** The entitlement lives with RevenueCat / the user's Google account, not the device. New phone, sign in, restore → Plus returns. ⚠️ **But the app currently will not notice** — the AppState refresh early-returns when the local `plus` cache is false ([`RitualsApp.js:222–228`](../src/RitualsApp.js#L222)), so a returning subscriber sees a downgraded app until they find "Restore purchases" *behind the paywall*. **This exact scenario is the bug.** Logged as a 10b blocker; fixed in IMP-043.
- **The journal usually survives too.** Android Auto Backup restores onto a new device signed into the same Google account with **no login** — that is precisely the case IMP-006 was built and device-verified for.

**What is genuinely not covered:** Google backup switched off · a switch to iOS · staleness (the Google copy is ≤24h old *at best*, and only refreshes on idle + charging + unmetered Wi-Fi) · and above all **the owner can do nothing when any of that fails.**

**So the accurate statement is not "there is no recourse" — it is "there is no recourse *from you*."** Every recovery path is in the user's hands. That is a defensible engineering position and an uncomfortable *commercial* one, because "I cannot help you" is a bad thing to say to someone who paid.

**Two things resolve it, and they are not the same size.**

**1. Now, cheap — close the gaps and stop implying a promise you are not making (IMP-043).** Selling Plus does **not** create an obligation to host anyone's data; it creates an obligation to be *honest* about what is bought. Fix the entitlement re-check, make backup health loud instead of silent, say plainly at the point of purchase that the journal lives on the device, and give yourself a **goodwill channel** (support address + Play promo codes, which cost nothing and let you actually do *something* for an unlucky user).

**2. Later, the flagship — encrypted backup to the user's OWN Google Drive, as a Plus feature. ⭐**
This is the honest resolution of the owner's discomfort, and it is strategically the strongest feature on any list in this playbook:
- **Sync/backup is the single most-paid-for feature in this category** (it is most of what Day One's subscription actually sells). The owner's instinct here is not anxiety — it has correctly identified that the thing being refused is the thing the category monetises best.
- **It needs no backend of yours.** Google Drive's `appDataFolder` via the Drive REST API + `expo-auth-session`: the file lands in **the user's own Drive**, invisible to them and to you, and **you store nothing and hold no PII**. Same trust model as Auto Backup, but *explicit, on demand, and restorable at will* rather than ≤24h stale and silent.
- **It does not reverse the local-only decision.** That decision rejected *accounts on our server* for PII and legal reasons ([[daily-rituals-local-only-decision]]). Signing into **their** Google account to write to **their** Drive keeps every one of those reasons satisfied. The privacy-policy delta is small; there is no controller relationship over stored content.
- **It is squarely paid, by our own test** — *"am I charging for their words, or for my work on their words?"* Their words stay free and exportable; the **service of keeping a restorable copy** is our work.
- ⚠️ Real costs: it is the first true network dependency, an OAuth flow to build and maintain, and it must fail gracefully offline. Not small. But it converts the owner's biggest liability into the paywall's strongest line.

**Recommended sequencing: IMP-043 now; Drive backup after the six perks ship, as the headline of the *next* Plus tier — and it is the natural anchor for the Lifetime price.**

### 👨‍👩‍👧 Family plan — asked 2026-08-04. Answer: no. Build **Lifetime** instead.

**A journal is the least shareable product there is.** Spotify Family shares a catalogue; Duolingo Family shares accountability; Notion shares documents. This app shares **nothing** — its entire value is privacy and solitude. There is no shared artifact to justify a shared price.

**And it would force accounts.** A family plan needs identity: who is in the family, and which device gets the entitlement. RevenueCat cannot link devices without a user ID, and Play's family sharing still requires per-user entitlement resolution. So a family tier **reverses the local-only decision** — the thing this app's whole privacy claim rests on — for the least valuable feature available. That trade is indefensible.

**The revenue logic is also backwards.** Family plans are a *discount* instrument: you trade ARPU for household penetration. That works when the marginal user is free to serve **and** has a reason to adopt. Here you would be discounting to reach people who have no reason to journal merely because a relative does.

**✅ Build these instead — same goals, no accounts:**
- **Lifetime / "forever" purchase** ⭐ — a one-time **non-consumable** (~2.5–3× the annual). It fits the app's *legacy* theme exactly ("keep this forever"), **restores cleanly with no accounts** (durable Play record via RevenueCat, per the consumables note above), anchors the annual price so it looks cheap, and appeals precisely to the person who journals for years. This captures the high-intent buyer a family tier was reaching for.
- **Gift a year** — via Play promo codes; no accounts, no infrastructure. This is the *actual* family use case — giving a journal to someone you love — without multi-user plumbing.

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
4. **Push `main`.** CI runs the test gate, then waits for the owner's one-tap approval, then ships: OTA (`eas update`) or build + auto-submit to **internal testing** (`internal` track — changed 2026-08-08 from `alpha`/closed testing, because internal publishes in minutes and normally skips the full app review).
5. **No trailer = nothing ships** — safe for work-in-progress pushes.
6. **Reaching the public is a separate, manual act.** `internal` serves the owner only. Promote **internal → production** by hand in Play Console when a build is ready; that promotion *does* get the full review.

Guardrails: a commit tagged `ota` that touched native files is auto-rejected by CI's backstop (re-tag as `build`). OTA reaches testers on **v5+** only. Rollback: owner runs the **Rollback OTA** workflow (Actions tab). Owner one-time setup (tokens/secrets/approval environment) is in the pipeline plan, [`docs/superpowers/plans/2026-06-07-streamlined-release-pipeline.md`](superpowers/plans/2026-06-07-streamlined-release-pipeline.md), Task 8.

### Ship lane — which fix ships how (decide per task)
| What changed | Lane | Command | Play review? |
| --- | --- | --- | --- |
| JS / UI / copy / logic / JS assets only | **OTA** | `eas update --branch production --message "…"` | ❌ **never** — OTA does not touch Play at all (minutes) |
| Native dep, permission, SDK/target, icon/splash, `app.config` native field, version bump | **Full build** | bump `android.versionCode` → `eas build -p android` → auto-submit to `internal` | 🟡 normally skipped on `internal`; ✅ required when promoted to production |

- OTA only reaches builds **≥ versionCode 5**. The v4 build in review can't receive it — so the **first full build we push for improvements (versionCode 5) is what turns the OTA lane on** for everything after.
- Tag every task with its lane so we batch OTA-able fixes and only rebuild when something native actually changes.

### Play tracks — what each one is for (set 2026-08-08; active releases read from the Play API 2026-08-13)

| Track | Who | Review | Active now | Used for |
| --- | --- | --- | --- | --- |
| `internal` | the owner only (cap 100) | normally none — live in minutes | 1.0.3 / vc9 | **every automated build.** `eas.json` → `submit.production.android.track` |
| `alpha` (closed testing) | the 12×14 gate cohort | ✅ hours–days | 1.0.5 / vc11 | **frozen at vc11.** Gate already cleared 2026-07-29; kept, not fed |
| `beta` (open testing) | public opt-in | ✅ hours–days | 1.0.3 / vc9 | dormant, but **held current** for compliance |
| `production` | the public | ✅ up to ~7 days | 1.0.3 / vc9 | promoted **by hand** from `internal`, never automatically |

**🔴 The trap that already bit once — now fixed, and the rule is what matters:** Play evaluates compliance
against **the active release on every track**, not just the one you last shipped. Abandoned `beta`/vc8 and
`internal`/vc5 (both `targetSdkVersion 35`) kept the API-36 banner firing long after production was
compliant. Both were promoted to vc9 on 2026-08-13 and the banner cleared. **Whenever a track stops being
fed, either retire it or promote a current build onto it** — a dormant track is a compliance liability that
costs nothing to keep current.

**⚠️ Note what promoting vc9 onto `internal` cost:** `internal` is the track the owner self-tests on, and it
now serves the *same* build as the public. Until the next build is cut it carries **none** of the work since
vc9, and — because `runtimeVersion` is `appVersion` — an `eas update` published at 1.0.5 **cannot reach it
either**. Self-testing on `internal` starts with a build, not an OTA.

**⚠️ `internal` is not a guarantee of no review.** Google still runs automated scans on every upload
regardless of track — including the deprecated-API scan that flagged IMP-044 — and reserves the right to
review any release. Treat "no review" as "usually none, and far faster", not as a contract.

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

## IMP task template (Opus copies this per issue into `docs/specs-open.md`, fills it, adds a backlog-table row in `PROGRESS.md` linking to it, hands to Sonnet)

**Minimum bar for a spec Sonnet can execute without deciding anything** — every one of these must be
present, or it is not ready to hand over: a **numbered Steps checklist** (RED-first where there is logic),
an explicit **Tests** paragraph naming each case, the **exact commit message**, the **ship lane**, and any
copy strings written out verbatim rather than described. Judgement calls belong in the spec, not in the
chat that executes it.

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


---

## 💰 Monetization strategy + the subscription track (moved out of PROGRESS.md 2026-08-13)

> Moved here to keep `PROGRESS.md` inside its size budget — it is read in full by every chat.
> This is **reference, not history**: the open decisions below are still open. `PROGRESS.md`
> keeps a one-line pointer to each. Nothing here has been edited in the move.

### 🧭 OPEN STRATEGIC DECISION (owner, 2026-08-02) — "was local-only the right call?"

The owner asked this after the purchase-recovery audit: *"I am questioning if I made the right choice by going completely offline… any user grievances (especially related to money) will have huge repercussions."*

**The local-only decision is not the problem, and should not be reversed.** It was taken 2026-06-07 for the **journal** — PII, GDPR/India-DPDP deletion-and-export duties, and onboarding friction (see the `daily-rituals-local-only-decision` memory). Every one of those reasons still holds exactly as written. Nothing found in this audit touches them.

**The actual flaw is narrower: selling a CONSUMABLE currency from an app with no server.** These two are fundamentally incompatible, by Google's design, not by ours — once a consumable is consumed, Play's `queryPurchasesAsync` no longer returns it, so there is **nothing left to restore**. Restoring a spent currency requires *your* server holding the balance. That is what makes ember purchases a genuine one-way lane: if a user pays for embers and loses local state, you cannot make them whole. You cannot grant remotely. The only lever is a Play refund — manual, and rating-damaging.

**Subscriptions and NON-consumables do not have this problem, and need no accounts.** Play holds a durable record tied to the user's Google account, and RevenueCat restores it against **anonymous app user IDs** — no login, no email, no PII, no backend of yours. So "local-only" and "purchases that survive a wipe" are **not** in conflict. Only *consumables* are.

**⚖️ Revised 2026-08-02 after the owner pushed back — *"this is supposed to be the Duolingo of daily journaling"*.** That objection is fair and the first framing of this block overweighted the restore risk. Two corrections:

**1. The gamification is not what's in question.** Duolingo's revenue is overwhelmingly **subscription**; gems are a small line and mostly *earned*, and the shop's real job is to make the streak feel precious — which sells the subscription. Duolingo *can* sell gems because it has **accounts and a server**, i.e. exactly the thing this app deliberately rejected. So "the Duolingo of journaling" is fully achievable here **with every mechanic intact** — streaks, XP, levels, embers, candles, shop, achievements. The only question is whether cash buys the *currency* or buys *Plus*.

**2. The real argument against cash embers is the economics, not the risk.** Actual numbers: `EMBER_GAIN = 15`/day ([`data.js:102`](../src/data.js#L102)); the entire ember-purchasable catalogue is 240 + 240 + 420 + 420 (palettes) + 300 (sky) = **1,620 embers ≈ 108 days of journaling ≈ one $9.99 pack**. So the cash-ember line has a **~$10 lifetime ceiling per user** — after which only candles (120–450) repeat — while **Plus is $29.99/yr recurring and `PLUS_PERKS` already promises "Every palette & sky — unlocked forever"**. Cash embers therefore **cannibalise the subscription that sells the same goods**, cap out at a third of one year of Plus, and carry **100% of the unrestorable-purchase liability**. That is a weak SKU on its own merits.

| | Option | Consequence |
| --- | --- | --- |
| **A** ⭐ | **Embers earned-only; sell Plus.** Every mechanic stays; only the cash top-up SKU goes. | Keeps the whole Duolingo-shaped economy, removes the cannibalisation *and* the entire liability class. Shop copy already leans here — *"Embers also gather on their own — one for every day you keep"* ([`Shop.js:167`](../src/screens/Shop.js#L167)). Every money grievance becomes a RevenueCat restore, which already works. |
| **B** | **Cosmetics as one-time NON-consumable IAP** ("this palette, $1.99"). | Keeps à-la-carte revenue, durable and restorable with **no accounts**. More Play products to maintain. Combines fine with A. |
| **D** | **Sell cash embers anyway, with real mitigations.** | Legitimate and industry-normal — plenty of offline games store coin balances locally. Mitigations, in order of value: (1) **Google Play promo codes** — Play Console issues codes for in-app products, so a user with a lost balance sends their Play receipt and you send a code granting the same pack free. That is a genuine **server-less manual recourse path**, quantity-limited but ample at indie volume, and it is the concrete answer to "I'd have no way to make them whole". (2) Prompt the JSON export immediately after any cash purchase. (3) Honest copy — *"Embers live on this device"*. (4) Keep a purchase ledger in `PERSISTED_KEYS` so it rides both Auto Backup and the JSON export. Exposure is bounded by the ~$10 ceiling above. |
| **C** | **Add a server** to hold balances. | Reverses the local-only decision and reimports the PII/legal/friction burden it was taken to avoid. **Not recommended** — the currency is not worth a backend. |

**Timing is the good news.** `PLUS_ENABLED = false` ⇒ **zero paying users, zero refunds owed, zero support tickets, nothing shipped.** This is the cheapest possible moment to find it; after 10b it would be genuinely expensive. **No code decision is blocked on this today** — but it must be settled before `PLUS_ENABLED` flips, because it determines which Play products get created (playbook 10b.2–10b.5, still `TBD`).

### 🚀 SUBSCRIPTION TRACK — ordered next steps (owner asked 2026-08-04)

**The governing fact: BillDesk is the hard external gate, and it is ~4 weeks from expiry (window opened 2026-06-04, ≤90 days ⇒ ~2026-09-02). Play subscription products cannot be created or priced without a verified payments profile — so nothing commercial ships before it. But NONE of the product work is blocked by it.** Treat the wait as the build window; do not idle.

**⚠️ Sequencing trap — flipping `PLUS_ENABLED` is a BUILD, not an OTA.** The RevenueCat key reaches the app through `app.config.js` → `expo-constants` `extra`, which is resolved from `process.env` **at build time in the EAS environment**. `scripts/check-billing-config.js` is already wired as a preflight in the build job for exactly this reason. Do not plan the flip as a JS-only OTA.

**⚠️ Promote vc11 EARLY, not late.** `runtimeVersion` = `appVersion` = 1.0.5, so every OTA lands on **testers only** while the public sits on 1.0.3. All the perk work below is OTA-lane — meaning **none of it reaches real users until vc11 is promoted.** Promotion is not a "later" decision; it is a prerequisite for this whole track mattering.

**🔴 PROPOSED FINAL PERK LIST (owner to approve — this is step A2).** Every line below is either already real or has a specced task. Nothing is aspirational.

| # | The line the paywall carries | Backed by | State |
| --- | --- | --- | --- |
| 1 | **Every palette & sky — unlocked forever** | `tier: 'plus'` items | ✅ already real |
| 2 | **Streak insurance — a candle spends itself when you miss a day** | IMP-039 (a) | ✅ built — replaces the false "3 candles every month" |
| 3 | **On this day — your own words, brought back to you** | IMP-038 | ✅ code-complete |
| 4 | **Your year, remembered — the Annual Recap** | **IMP-046** (was "roadmap C, unspecced") | ✅ code-complete |
| 5 | **Deeper insights — moods, seasons and your rhythms** | **IMP-047**, over IMP-037's data | ✅ code-complete — makes dead perk #5 real |
| 6 | **Your Book — your days, as a PDF** | IMP-022 Part A (BUILD lane) | ⬜ deferred, revive |

**Cut outright: "Your whole graveyard, kept forever"** — no history limit exists, so it sells relief from a restriction that was never built, and building one would violate the never-gate-their-words line. **Cut, do not implement.**

**Note the shape:** one cosmetic perk, one retention perk, four memory perks. That is the thesis — *free helps you write today, Plus gives you your years back* — expressed as a purchasable list. Keep it at six; a longer list converts worse.

**PRICING TIERS (decided 2026-08-04) — three products, not four. No family plan** (a journal shares nothing, and a family tier would force accounts and reverse the local-only decision; full reasoning in [`docs/playbook.md`](docs/playbook.md)).

| Product | Play type | Why |
| --- | --- | --- |
| **Monthly** | subscription | low-commitment entry |
| **Annual** | subscription | the default; price it so the monthly looks expensive |
| **Lifetime / "forever"** ⭐ | **non-consumable** (one-time) | ~2.5–3× the annual. Fits the *legacy* theme exactly, **restores with no accounts** (durable Play record), anchors the annual so it reads cheap, and captures the high-intent buyer a family tier was reaching for. **Non-consumable, never consumable** — that is what makes it restorable. |

Also worth doing and nearly free: **"gift a year" via Play promo codes** — no accounts, no infrastructure, and it is the real family use case (giving a journal to someone you love).

**Remaining, unblocked:**
- **Revive IMP-022 Part A** — Your Book (the PDF export), perk #6. Already sold; still no PDF code in the tree. **BUILD lane** (new native module). The only unbuilt perk left — everything else in the A/B build window (IMP-034/035/036/037/038/046/047, the perk-list decision, `RC_ANDROID_KEY`, vc11 promotion) is done.
- **Chase BillDesk.** Watch `onboarding@billdesk.com` and Play Console → Payments profile. Critical path; everything else is slack.
- **Decide pricing, including the India tier.** $29.99/yr is not defensible for today's Plus. ≈₹2,500 needs its own thought — Play local tiers, not just the USD figure.
- **Decide the trial.** The "7-day free trial" claim is hardcoded in `Paywall.js` + `PlusFlow.js` `LegalFooter`. Either configure a real 7-day offer on the Play base plan or change the copy. **Never ship it unverified.**

**D — the gate before `PLUS_ENABLED` flips. All must be true:**
- [ ] Every line in `PLUS_PERKS` is real (or deleted)
- [ ] Play subscription products created **and active**; RevenueCat → Offerings shows `current` with packages
- [ ] `RC_ANDROID_KEY` present in the EAS **production** environment (else the build silently ships `simService` and fakes purchases)
- [ ] Trial copy matches the configured Play offer
- [ ] A **real transaction** tested end-to-end on a real device via a licence tester account
- [ ] vc11 (or later) is on the production track, so the paying public can actually reach it

### 💳 Phase 10b — payments (the next real track, gated externally)

- **✅✅ BillDesk APPROVED (owner reported 2026-08-04).** PA-CB seller verification is **done**; BillDesk is now working on the payment setup itself. **The 90-day window (~2026-09-02) is no longer a threat and the external gate on Phase 10b is lifted.** What this unblocks: a payments profile means Play subscription **products can be created, priced and activated** (playbook 10b.2–10b.5, still `TBD`) and RevenueCat Offerings can be wired. What it does *not* change: `PLUS_ENABLED` still must not flip until gate **D** below is fully true — approval removes the *external* blocker, not the four unbuilt perks. Remaining wait is BillDesk finishing payment setup; confirm in Play Console → **Payments profile** before creating products.
- **Historical (resolved) — the deadlock that was:** application SUBMITTED 2026-07-30, verified 2026-08-04. The trap was circular: BillDesk PA-CB seller verification wants the **live app's Play Store URL**, payments need BillDesk, BillDesk needed a published listing. Shipping v1.0.3 broke the cycle, and the owner has now submitted the application with their details. **v1.0.3 is now live and approved**, so the listing URL resolves publicly — if BillDesk queries it during verification it will no longer 404, and the URL can be re-supplied with confidence if they ask again. **Submitted ≠ verified** — BillDesk/Google still have to approve the payments profile, and until they do, subscription products cannot be activated. Watch for mail from `onboarding@billdesk.com` and Play Console → **Payments profile**. Window opened 2026-06-04 (≤90 days ⇒ ~**2026-09-02**).
- **Owner to confirm once the profile verifies:** whether any Play subscription products exist yet — Play Console → **Monetize → Subscriptions** (any products, and are they *active*?) and RevenueCat → **Offerings** (does `current` list packages?). Playbook 10b.2–10b.5 are still unchecked and "Play product ids" is still `TBD`.
- **🔴 HARD BLOCKER before `PLUS_ENABLED` — ONE of SIX advertised Plus perks is not real** (perk #6, the PDF — IMP-022, deferred; the other five are built, see the perk table above). Audited 2026-08-03 against `PLUS_PERKS` ([`data.js:144`](../src/data.js#L144)), the list the paywall sells:

  | # | Perk as sold | Reality |
  | --- | --- | --- |
  | 1 | "Every palette & sky — unlocked forever" | ✅ **REAL** — `tier: 'plus'` items unlock ([`Shop.js:25/28`](../src/screens/Shop.js#L25)). 3 palettes + 2 skies. |
  | 2 | "Streak insurance — a candle spends itself when you miss a day" | ✅ **REAL (IMP-039)** — `applyAutoFreeze` spends a candle per missed day automatically; `currentStreak` honors `frozenDays`. The old "3 free every month" wording (a one-time grant sold as recurring) is gone from `PLUS_PERKS`. |
  | 3 | ~~"Your whole graveyard, kept forever"~~ → "On this day — your own words, brought back to you" | ✅ **REAL (IMP-038)** — the meaningless "no history limit" line is cut; `onThisDay()` resurfaces year-ago (and, before a year of history, 6/3/1-month-back) entries on Home, gated `plus`. |
  | 4 | "Export your days as a keepsake PDF" | ❌ **DEAD** — no PDF code in the tree at all. Known: IMP-022, ⏸ deferred. |
  | 5 | "Deeper insights — moods & seasonal themes" | ✅ **REAL (IMP-047)** — `DeeperInsights.js` adds mood-by-weekday, mood-by-season and mood-pairings cards behind `plus`, over IMP-037's mood arrays. |

  **Four of five now real (#1, #2, #3, #5 — #2 fixed by IMP-039, #3 fixed by IMP-038, #5 fixed by IMP-047).** This is the same defect class as IMP-031's "8:30 PM" reminder and IMP-022's PDF button, but on the surface that takes money — so it is a Play policy exposure, not just a broken promise. **Nothing may charge for this list until it is true.** **#4** needs IMP-022 revived — the only remaining gap.

- **🧭 Product thesis lives in [`docs/playbook.md`](docs/playbook.md) → "Why anyone would pay" (2026-08-03).** Short form: value in a journal **accumulates**, so the paying moment is month 2–3, not signup; the app today is **all continuity (streaks/embers/reminder) and no retrieval** — **no search anywhere**, editing is today-only, no delete — which makes the archive **write-only** and blocks any "revisit your past" sale. Free forever = custody of their own words (write/read/**search**/edit/delete/history/raw export); paid = the app's work *on* those words (recap, resurfacing, insight, keepsakes, cosmetics). **Search is the highest-value non-design task in the codebase** and should be scoped as its own IMP.
- **🧭 Product note — the perk list IS the Plus roadmap.** The owner asked (2026-08-03) what more Plus should contain beyond themes. The audit answers it: **build #2, #4 and #5 properly and Plus is already a real subscription** — and the honest through-line for this app is **memory**, not cosmetics. Free helps you *write today*; Plus helps you *revisit and keep* what you wrote. That framing is exactly the existing "legacy" roadmap (D → A+B → **C, Annual Recap / Time Capsule**, still unbuilt) and the memorial-garden theme. Strongest candidates, cheapest first: **"On this day"** resurfacing (entries are local and `dayKey`-indexed, so this is near-free to build, it is the single most-loved feature in comparable journals, and IMP-013's "Tend an old grave" rite already gestures at it) · **Annual Recap** (roadmap C, the emotional payoff of a year, folds in the deferred milestone timeline) · **keepsake PDF** (perk #4, the legacy artifact — revives IMP-022) · **themed prompt packs** (grief / gratitude / transitions — IMP-023's deck architecture already supports this; new pools are pure data) · **biometric app lock** (`expo-local-authentication`, local-only, top-requested for private journals, high conversion for low build). **Recommended free/paid line: never gate a user's own writing** — reading, writing, raw export, full history and search stay free forever. Gate *enrichment*: recap, resurfacing, deeper analysis, keepsakes, cosmetics, convenience. ⚠️ Also revisit the **price tier** when products are created: $29.99/yr is not defensible for 3 palettes + 2 skies, and the owner's home market (India) reads ≈₹2,500 — Play's local tiers matter as much as the USD figure.

- **🔴 HARD BLOCKER before `PLUS_ENABLED` — the ember packs display cash prices and are wired to NOTHING.** [`data.js:132`](../src/data.js#L132) labels `EMBER_PACKS` "bought with cash" at `$1.99 / $4.99 / $9.99`, but the buy handler is [`RitualsApp.js:532`](../src/RitualsApp.js#L532) — `onBuy={(pack) => { setEmbers((e) => e + pack.amount); … }}` — a bare counter increment. **No `purchaseService`, no RevenueCat, no IAP of any kind.** Same path via [`Shop.js:170`](../src/screens/Shop.js#L170) → `getEmbers(pack)` ([`RitualsApp.js:173`](../src/RitualsApp.js#L173)). Worse, **this surface is not gated by `PLUS_ENABLED`**: the Shop's "Gather Embers" section ([`Shop.js:166`](../src/screens/Shop.js#L166)) has no `plusEnabled &&` wrapper, unlike the Plus banner at line 56 — so it renders **in the shipping free build with cash prices on it**, and tapping a "$9.99" pack grants 1,500 embers for free. Nobody is charged, so no money is at risk, but the app is **displaying a price for something that costs nothing** — the same class of misrepresentation IMP-028 fixed for the paywall. Either wire the packs to real consumable IAP products or hide the section behind `PLUS_ENABLED` (the cheap, correct move for the free release — do this one first).
- **✅ RESOLVED as IMP-043** — a returning subscriber shown as non-Plus is now re-verified once at launch (`useLaunchEntitlementCheck`), and a definitive "no entitlement" answer from the store now actually downgrades a stale/forged local cache instead of only a failed check being ignored. "Restore purchases" is also reachable from the You tab now, outside the paywall. Full detail in `docs/build-log.md` → IMP-043.
- **🔴 Embers, owned palettes/skies and freeze candles are LOCAL-ONLY and have no recovery path whatsoever.** They live in `PERSISTED_KEYS` ([`state.js:9–10`](../src/persistence/state.js#L9)) and **nowhere else** — no server record, no RevenueCat, nothing Google holds. If local state is wiped and not restored, paid inventory is **gone permanently**, and unlike the subscription there is no entitlement to re-query. Today this costs nothing (`PLUS_ENABLED = false` ⇒ **zero paying users exist**), but it is the reason IMP-033's decline path must never be a one-tap destruction — see the inventory warning folded into its spec.
- **⚠️ Before flipping `PLUS_ENABLED`: create the `RC_ANDROID_KEY` EAS env var AND GitHub repo secret.** `.env` is git-ignored and never reaches EAS Build (no `.easignore`, no `env` block in `eas.json`), so a cloud build would resolve the key to `''` → `isBillingConfigured()` false → `createPurchaseService` returns the **simulation** → the paywall fakes a purchase and grants Plus free, with no crash. IMP-028 added `scripts/check-billing-config.js` as a hard preflight in the build job, but it only arms once `PLUS_ENABLED` is true. Run `eas env:create --name RC_ANDROID_KEY --scope project --environment production` and add the repo secret of the same name (`release.yml` references it; the Actions linter flags it as undefined until it exists).
- **⚠️ The "7-day free trial" claim is hardcoded** in the paywall CTA + legal footer ([`Paywall.js`](src/screens/Paywall.js), [`PlusFlow.js`](src/screens/PlusFlow.js) `LegalFooter`). Only truthful if the Play base plan actually carries a 7-day free-trial offer. **Decide the offer when creating the products**, then either configure the trial in Play or change the copy — do not ship the claim unverified. Left hardcoded deliberately: the correct fix reads the intro/trial period off the live offering, which cannot be built or tested until real products exist. Prices themselves are already live-driven (IMP-028).

---

### 📋 Reading a Play Console compliance banner (procedure, kept after the 2026-08 fix)

- **ℹ️ PROCEDURE, kept after the fact — Play Console compliance banners lag fresh uploads, but "stale" is the *second* thing to check, not the first.** (The 2026-08 instance of this is resolved; the reading order is what to reuse next time.) The banner shown against vc10 on 2026-07-31 **was** stale: the app bundle explorer (authoritative — it reads the manifest) confirmed `targetSdkVersion 36`. **But on 2026-08-08 the same banner was REAL** and this note nearly buried it — it was firing on the forgotten `beta`/`internal` tracks (vc8/vc5, API 35), not on production. **Order of checks, in this order:** (1) list the **active release on every track**, not just the one you last shipped — `beta` and `internal` are easy to forget for months; (2) app bundle explorer for the flagged versionCode; (3) only then suspect lag. The banner's own wording is the tell — it names the *highest non-compliant* API level, so **API 35 could never have meant vc9/vc11**, both of which are 36.
