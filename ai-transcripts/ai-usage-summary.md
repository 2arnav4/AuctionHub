# AI Usage Summary

## Tools used

- **Claude Code** (Anthropic, Opus) — the only AI tool used on this project, across three sessions.

No other assistants, no Copilot, no Cursor.

## Sessions

| File | When | What it covers |
|---|---|---|
| `claude-session-1-initial-build.jsonl` | 28 July | Read-through of the existing codebase on receiving the interview invitation, then drafting my reply and a list of what I needed to revise. **No code was written** — 14 file reads and 6 shell commands, zero edits. |
| `claude-session-2-deployment-and-refactor.jsonl` | 28–29 July | Diagnosing the reported deployment failure — the root cause was a revoked MongoDB Atlas credential, not what the Render logs suggested — plus the database-outage degradation path (`requireDatabase`, connection retry, health endpoint), the bearer-header authentication rework, and further email drafting. |
| `claude-session-3-audit-and-hardening.jsonl` | 30–31 July | Full codebase audit, the concurrency bug fixes, security hardening, documentation correction, tests, seed script. 68 edits across backend and frontend — the substantive engineering session of the three. |

**These transcripts do not cover the original build.** The assignment was built roughly a month before any of them, and I was not keeping session exports at that point. The architectural decisions recorded below were made then, and nothing in these three files speaks to them. The filenames are the originals and are kept as-is so they still match the commit history; `initial-build` is a misnomer, and the table above is the accurate description.

All three are raw Claude Code JSONL transcripts, redacted for secrets only (see `README.md` in this folder). Nothing else was edited or removed.

## What AI helped with

- **Scaffolding and boilerplate.** Express app setup, Mongoose schema definitions, React page shells, Tailwind styling passes. This is the bulk of the generated volume and the least interesting part.
- **Realtime plumbing.** The Socket.IO handler structure — separate handlers for room, auction, bidding, and resolution, registered per connection — and the room-scoped channel pattern.
- **Concurrency review.** The most valuable use. In session 3 I asked for a full audit of the auction logic specifically looking for race conditions. It found a real one I had missed: an expiry timer that had already fired could still resolve an item whose deadline a late bid had just extended, silently defeating the anti-snipe behaviour. `clearTimeout` cannot recall a callback already in flight, so the fix was to require an elapsed deadline in the expiry's conditional update.
- **Bug hunting under time pressure.** Presence flags never reset on restart, a session store that logged users out when they left a room, an access guard ordered below a connection guard so users saw the wrong error screen, case-sensitive room codes in URLs.
- **Documentation accuracy.** The event map in `ARCHITECTURE.md` had drifted from the code — six of thirteen payloads were wrong and two events were undocumented. The README listed three REST endpoints that did not exist.
- **Debugging deployment.** Diagnosing why the app appeared down (Render free-tier cold start exceeding the client's 60s timeout, not an actual outage), and confirming production health end to end rather than by guesswork.

## Important manual decisions

These were mine, and in several cases I overruled the assistant or redirected it:

- **Scope control under a deadline.** The audit produced 23 items. I classified them and deliberately deferred the ones that were real but invisible in a demo, rather than making risky changes the night before an interview.
- **Refused an unnecessary infrastructure change.** The assistant's initial read was that the site was down and needed a new Atlas cluster. I pushed back on rebuilding working infrastructure; investigation confirmed production was healthy and the perceived outage was a cold start. Nothing was rebuilt.
- **Declined the uptime pinger.** Suggested as a cold-start mitigation. I judged it irrelevant to what the reviewer would assess and skipped it.
- **Kept the commit trigger, traded the edit approvals.** I required the assistant to list the files and the commit command and let me run it myself, rather than committing on my behalf. Once the 23 findings had been classified and the risky ones deferred, I did grant blanket tool permissions so it could work through the remaining low-risk list without stopping for approval on every file (session 3, line 573). That was a deliberate trade under a deadline: review moved from per-edit to the triage gate in front and the commit boundary behind. I interrupted once mid-run to check what it was touching (lines 722–724) and let it continue. Approving each edit individually would have bought me nothing on a list I had already risk-sorted.
- **Chose to learn rather than accept.** For the core auction files I worked in an explain-first mode — concept, then my own restatement, then code — specifically so I could defend the concurrency logic rather than recite it.

The architectural choices below predate all three transcripts — they were made during the
original build, before any of these sessions. They are recorded here because they are the
decisions the rest of the codebase is built on, and no transcript speaks to them.

- **Socket.IO over raw `ws`.** Three things I would otherwise have hand-built. Automatic reconnection, because a live auction cannot drop a bidder because a train went through a tunnel. Rooms, because `socket.join("room:" + code)` maps exactly onto auction rooms and removes the manual socket-to-room map I would otherwise maintain. Heartbeats, because the built-in ping/pong is what makes presence react quickly instead of waiting out a TCP timeout. The cost is protocol overhead over raw frames and a client that must use the Socket.IO library rather than a plain `WebSocket` — for a browser-only app, neither costs anything real.
- **MongoDB over Postgres.** The data is document-shaped — catalogs, participant lists and bid logs nest naturally — and `findOneAndUpdate` with a conditional filter gave me lock-free concurrency control at the database layer without a distributed lock manager. The concession that makes this answer honest: Postgres would have served this perfectly well, with `UPDATE ... WHERE current_bid + increment <= $1` giving the same compare-and-swap, real multi-row transactions, and foreign keys that would enforce relationships my schema only implies. Needing the budget check and the bid claim to be one atomic operation would have made Postgres the better choice outright — the compromise documented in `DECISIONS.md` §5 is a direct consequence of picking Mongo.
- **Room role decoupled from account role.** "Host" is a fact about a membership, not about a person. The same account should be able to run its own auction and bid in a friend's without re-registering, and binding the role to the account would mean either one global role or a permissions table doing the job the participant record already does. It also fails safe: a compromised JWT still cannot host a room it did not create. This is why the token's `role` claim exists but is never consulted for auction authority.

## What I rejected or changed

- **Rejected fabricating anything for this submission.** The transcripts here are unedited apart from secret redaction, and this summary describes what actually happened.
- **Rejected auto-generated documentation that did not match the code.** Several doc sections had been written from intent rather than implementation and had to be rewritten against the actual handlers.
- **Rewrote the lint fix.** The first proposed fix for a React effect warning still tripped the rule; the working version restructured the retry to change an effect input instead, which also closed a missing unmount cancellation.

## Known limitations

Listed in full in the [project README](../README.md#known-limitations). The significant ones: single-instance only because auction timers live in memory, no rate limiting, unbounded anti-snipe extension, and room reads are deliberately unauthenticated.
