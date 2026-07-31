# AI Usage Summary

## Tools used

- **Claude Code** (Anthropic, Opus) — the only AI tool used on this project, across three sessions.

No other assistants, no Copilot, no Cursor.

## Sessions

| File | When | What it covers |
|---|---|---|
| `claude-session-1-initial-build.jsonl` | 28 July | Initial scaffold: project structure, Express + Socket.IO wiring, Mongoose models, the first pass at the room/auction/bid flow. |
| `claude-session-2-deployment-and-refactor.jsonl` | 31 July (early) | Deployment to Render and Vercel, cross-origin cookie configuration, environment handling, the file/folder restructure, authentication rework. |
| `claude-session-3-audit-and-hardening.jsonl` | 31 July | Full codebase audit, the concurrency bug fixes, security hardening, documentation correction, tests, seed script. |

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
- **Held the line on assignment-specified behaviour.** Mid-way through the hardening pass I stopped the work to require that anything changing the auction rules stated in the brief be raised with me first rather than changed unilaterally.
- **Chose to learn rather than accept.** For the core auction files I worked in an explain-first mode — concept, then my own restatement, then code — specifically so I could defend the concurrency logic rather than recite it.

<!-- TODO(Arnav): add the decisions from sessions 1 and 2 that only you can speak to —
     why Socket.IO over raw ws, why MongoDB over Postgres for this shape of data,
     why room role is decoupled from account role, anything you rejected early on. -->

## What I rejected or changed

- **Rejected fabricating anything for this submission.** The transcripts here are unedited apart from secret redaction, and this summary describes what actually happened.
- **Rejected auto-generated documentation that did not match the code.** Several doc sections had been written from intent rather than implementation and had to be rewritten against the actual handlers.
- **Rewrote the lint fix.** The first proposed fix for a React effect warning still tripped the rule; the working version restructured the retry to change an effect input instead, which also closed a missing unmount cancellation.

## Known limitations

Listed in full in the [project README](../README.md#known-limitations). The significant ones: single-instance only because auction timers live in memory, no rate limiting, unbounded anti-snipe extension, and room reads are deliberately unauthenticated.
