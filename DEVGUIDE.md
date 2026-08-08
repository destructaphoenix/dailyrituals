# Dev Guide — Driving Sonnet across chats

This project is built by **Opus** (planning) and executed by **Sonnet** across many chats, because credits/context run out. The whole system works only if **every Sonnet chat starts by reading the same two files** and **ends by updating one file**:

- **Read first, every time:** [`PROGRESS.md`](PROGRESS.md) (where we are — always; it's a lean live cursor). The ACTIVE TRACK is the **IMP backlog**; each open row links to its full spec in [`docs/specs-open.md`](docs/specs-open.md).
- **Then read exactly ONE spec:** open [`docs/specs-open.md`](docs/specs-open.md) at the heading your backlog row links to, and **no other heading in that file**. Every other spec there is for a different chat; reading them is wasted context. Finished specs are archived in `docs/build-log.md`.
- **Open only when you need it:** [`docs/playbook.md`](docs/playbook.md) = stable reference (release + signing rules, config, architecture, parked phases 8/10b/11, locked decisions, IMP template). The [phase plan](docs/superpowers/plans/2026-06-03-daily-rituals-expo-billing.md) = full per-step code, **only for a phase-ladder phase (8/10b/11)**.
- **Update last, every time:** `PROGRESS.md` (tick the row, set status, write the "Last session note") **and move the finished spec from `docs/specs-open.md` into `docs/build-log.md`**.

If you remember nothing else: **`PROGRESS.md` is the memory between chats — keep it small.** The plan + playbook never change; `PROGRESS.md` is the moving cursor and `docs/specs-open.md` is the work queue.

**The four files, by how often you read them:** `PROGRESS.md` (every chat — live cursor) → `docs/specs-open.md` (every chat — but one heading only) → `docs/playbook.md` (when shipping or doing phase work — stable reference) → `docs/build-log.md` (rarely — append-only archive).

---

## The one rule that makes this work

> Sonnet has **no memory** of previous chats. It only knows what's in the repo. So the breadcrumb left in `PROGRESS.md` at the end of one chat is the *only* thing the next chat can rely on.

Three non-negotiables baked into the prompts below:
1. **Every chat begins by reading `PROGRESS.md` + the plan.** (Self-update.)
2. **Every chat ends by writing the "Last session note" + ticking checkboxes**, *especially* if it stops mid-task because credits ran out.
3. **Shipping is automated** — when a change is ready to ship, follow the **"🤖 Release rules"** section in [`docs/playbook.md`](docs/playbook.md) (pick lane → `npm run bump:*` if build → `Release-Lane:` trailer → push). Never run `eas` by hand.

---

## Prompt 1 — Start a brand-new chat (most common: continue the project)

Paste this at the start of **any** Sonnet chat. It handles both "start the next task" and "resume where the last one stopped" — because both begin with reading `PROGRESS.md`.

```
You are continuing the Daily Rituals build. You have NO memory of previous chats —
the repo is your only source of truth.

STEP 1 — Sync (do this before anything else):
- Read PROGRESS.md in full (it's lean — that's the point). Follow its ▶️ ACTIVE TRACK
  callout: the live work is the first unchecked IMP task in the Improvements backlog.
- Open docs/specs-open.md at ONLY that task's heading (the backlog row links to it).
  Do not read the other specs in that file — they belong to other chats.
  That spec is the design: execute its Steps in order, do not redesign, and if it
  turns out to be wrong or impossible, STOP and log it rather than inventing a fix.
- docs/playbook.md (reference) and the phase plan are NOT needed for normal IMP work —
  open them only when shipping (playbook → Release rules) or working a phase-ladder phase
  8/10b/11 (plan → that phase only). Don't burn context on them otherwise.
- Run `git log --oneline -15` to see what's actually been committed.
- Reconcile: if PROGRESS.md and git disagree, trust git for "what exists" and tell me
  the discrepancy before proceeding.

STEP 2 — Report, then wait:
Tell me in 3-4 lines:
  • The first unchecked IMP task in the backlog (or, if the backlog is empty, the first
    unchecked phase-ladder task).
  • Whether the last note says a task was left half-done (resume) or clean (fresh start).
  • Exactly what you intend to do this chat.
Then STOP and wait for my "go".

STEP 3 — Execute (after I say go):
- Work ONLY the current task's steps, in order, exactly as the plan writes them.
- Follow TDD where the plan specifies it (write the failing test, run it, implement, run again).
- Commit with the exact message in the plan after each task.
- Do not skip ahead to later tasks. Do not redesign — the plan is the design.

STEP 4 — Close out (CRITICAL — do this even if you're low on credits):
- In PROGRESS.md: tick completed checkboxes, set the phase status emoji, and write a
  "Last session note" dated today with: what you finished, the LAST command you ran and
  its result, and the EXACT next step (file + step number) for the next chat.
- If you stopped mid-task, say which step number you completed last and which is next.
- **Keep PROGRESS.md small (it's read in full every chat) — archive aggressively. Two moves, every chat:**
  1. **Completed task specs:** the moment an IMP task is ✅ **code-complete** (do NOT wait for it to be shipped or runtime-walked — that gate is what made this file bloat), MOVE its whole block out of [`docs/specs-open.md`](docs/specs-open.md) into [`docs/build-log.md`](docs/build-log.md), and drop its row from the specs-open index table. Leave only its one-line row in PROGRESS.md's backlog table. Same for completed phase checklists.
  2. **Session notes:** PROGRESS.md keeps **only the two newest "Last session note" entries.** When you append today's note, MOVE the now-third-oldest note down into the "Session notes" section of `docs/build-log.md`. The log is append-only history — it belongs in the archive, not the live file.
- **Live PROGRESS.md = ONLY: the backlog table + Open items/blockers + the 2 latest notes.** Specs never live inline in it — open ones are in `docs/specs-open.md`, finished ones (plus old notes) in `docs/build-log.md`, stable reference in `docs/playbook.md` (don't copy it back in). Git is the full record.
- **Size check before you commit:** run `wc -l PROGRESS.md docs/specs-open.md`. PROGRESS.md target **≤ ~250 lines**; if it's bigger, something that belongs in a spec, the build-log or the playbook has leaked back in. `docs/specs-open.md` shrinks by one whole spec every time a task finishes — if it didn't, you forgot to archive.
- Commit PROGRESS.md (and `docs/specs-open.md` / `docs/build-log.md` if you archived anything).

STEP 5 — Ship (only if I asked you to release this change):
- Follow the "🤖 Release rules" section in docs/playbook.md. In short:
  - BUILD lane (native change)? First run `npm run bump:build` (or `npm run bump:native`
    if runtime/OTA compatibility changed). OTA lane (JS/UI/copy/logic only)? No bump.
  - Make the FINAL commit's last line the trailer — exactly `Release-Lane: ota` or
    `Release-Lane: build` — and `git push origin main`.
  - NEVER run `eas` yourself. Pushing the tagged commit is what ships it; GitHub Actions
    runs the tests and waits for MY one-tap approval. No trailer = nothing ships (fine for WIP).
- If I did NOT ask to release, just leave it committed (no trailer) — do not push to ship.
```

> **Why "STOP and wait for go" in Step 2?** It lets you sanity-check that Sonnet picked the right place *before* it burns credits doing work. If it's obviously right, just reply `go`.

---

## Prompt 2 — Force a clean, fresh task (when you want to skip the resume logic)

Use this only when you *know* the previous task finished cleanly and you want Sonnet to start the next one with no fuss:

```
Sync first: read PROGRESS.md, run `git log --oneline -10`. (Open docs/playbook.md or
the plan only if shipping / doing a phase-ladder phase.)
The previous task is complete. Start the NEXT unchecked task in PROGRESS.md.
Confirm which task that is in one line, then proceed through all its steps,
committing as the plan specifies. When done, update PROGRESS.md (checkboxes +
status + dated Last session note) and commit it.
```

---

## Prompt 3 — Resume a task that was cut off (credits ran out mid-task)

Use this when the last "Last session note" says something like *"stopped after Step 3 of Task 3.2"*:

```
Sync first: read PROGRESS.md (especially the latest Last session note) and the plan,
then run `git status` and `git log --oneline -10`.

A previous chat was cut off mid-task. Your job:
1. Tell me the exact task and the last completed step from the note.
2. Verify against the working tree: which files/steps of this task already exist?
   (Read the files; don't trust the note blindly.)
3. Resume from the first step that is NOT yet done. Do not redo completed steps.
4. If a half-written file is in a broken state, fix it to match the plan's code for
   that step before moving on.
Report your resume point in 2-3 lines, then continue. Update PROGRESS.md and commit at the end.
```

---

## Prompt 4 — Review checkpoint (optional, between phases)

After a phase finishes, you can spend one cheap chat verifying before moving on:

```
Sync first (PROGRESS.md + plan + `git log --oneline -15`).
Phase <N> is marked done. Verify it WITHOUT writing feature code:
- Run `npm test` and paste the result.
- Run `npx expo start` long enough to confirm it bundles with no red-screen errors
  (report the outcome; you can stop the server after).
- Check each of Phase <N>'s checkboxes against what's actually in the repo.
Report pass/fail per item. If anything is wrong, list it; don't fix it yet — wait for my go.
```

---

## What "good" looks like in PROGRESS.md after each chat

The **Last session note** is the handoff. A good one is specific enough that the next chat needs nothing else:

```
2026-06-04 — Completed Phase 2 fully (Tasks 2.1-2.3). `npm test` green (12 tests).
Last command: `git commit -m "feat(billing): map RevenueCat errors..."` → committed a1b2c3d.
NEXT: Phase 3, Task 3.1 Step 1 — write __tests__/billing/simService.test.js (failing test).
```

A bad one (do not accept): *"Did some work on billing. Continue later."* — the next chat can't act on this.

---

## When credits run out mid-step (the realistic case)

If Sonnet warns it's nearly out of credits **in the middle of a task**, tell it:

```
You're low on credits. Stop after the current step — do NOT start a new step.
Commit whatever compiles (or note it's intentionally uncommitted and why).
Then update PROGRESS.md's Last session note with: exact task, last step completed,
next step to run, and any half-finished file that needs fixing. Commit PROGRESS.md.
```

This guarantees the next chat (Prompt 3) can pick up cleanly.

---

## Quick reference

| Situation | Prompt | Key behavior |
| --- | --- | --- |
| Any new chat (default) | **Prompt 1** | Sync → report → wait for go → execute → update |
| Definitely start next task | **Prompt 2** | Skips resume detection |
| Last task was cut off | **Prompt 3** | Verifies against tree, resumes from first undone step |
| Verify a finished phase | **Prompt 4** | Read-only checks, no feature code |
| Running out of credits now | the snippet above | Stop cleanly, leave a precise breadcrumb |

**Golden loop:** `Read PROGRESS.md` → `open the ONE spec its backlog row links to in docs/specs-open.md` → `do exactly that task` → `commit` → `update PROGRESS.md + move the finished spec specs-open.md → build-log.md (and the 3rd-oldest note too)` → `ship if asked (Release-Lane: trailer + push; never run eas)` → end chat. Repeat in a fresh chat. (playbook/plan only when shipping or doing phase work.)

---

## Tips for keeping costs/context low

- **One task per chat** when possible. Tasks in the plan are deliberately small (2-5 min of work each). Small chats = less context = fewer credits burned re-reading.
- **Don't pull in reference you don't need.** Normal IMP work needs PROGRESS.md plus **one heading** of `docs/specs-open.md`. Open `docs/playbook.md` only to ship (Release rules) or check signing/config; open the phase plan only for a phase-ladder phase (8/10b/11), and read just that phase.
- **Commit often.** The plan specifies a commit per task. Commits are the durable record; `git log` is a backstop if `PROGRESS.md` ever drifts.
- **Use Prompt 4 sparingly** — only when you want confidence before a risky phase (e.g., before Phase 6 real billing).
- If a chat starts behaving oddly or hallucinating file contents, that's a context/credit signal: stop it, start a fresh chat with Prompt 1.

---

## Dev harness (dev builds only — IMP-032)

Long-press **"About Daily Rituals"** on the You tab to open it. It never ships: the whole `src/dev/` subtree is `__DEV__`-guarded and stripped from release bundles (verified by a sentinel-string grep against `npx expo export`).

- **State** — scenario presets + a control for every persisted/settings knob (streak, mode, name, reminder, store simulation, backup age, …). Apply/Reset both write a recovery copy first, the same safety guarantee as a real restore.
- **Notifications** — live permission status, the app's real reminder settings, and an intended-vs-pending diff against what `expo-notifications` actually scheduled.
- **Inspector** — read-only: every derived stat (streak, level, achievements) computed through the app's own real helpers, plus device facts (font-scale cap, OTA channel/runtimeVersion) and a JSON export of the current state.
- **Launch overlays** — direct-open buttons for celebration/paywall/manage/achievements/shop/reminder/toast/reading/restore-notice — states otherwise reachable only via a real trigger.
