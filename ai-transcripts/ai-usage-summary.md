# AI Usage Summary

## Project Details
* **Live Demo URL**: [https://auction-assignment.vercel.app/](https://auction-assignment.vercel.app/)

---

## Tools Used
* **ChatGPT**: Used for initial architecture brainstorming and designing the REST API endpoint shapes.
* **Cursor**: Used to scaffold the React + TypeScript pages and Express routing structures.
* **Antigravity (Google DeepMind)**: Used for pair-programming socket state recovery, bid increment validation logic, custom toast layouts, and cookie-based authentication layers.

---

## What AI Helped With
* **Scaffolding and Boilerplates**: Generated the basic React page routing structure and Express server setup files.
* **Mongoose Schema Drafts**: Wrote the initial Mongoose collections drafts for rooms, participants, items, and bids.
* **Tailwind and CSS Shells**: Designed CSS card components and glassmorphic layouts for the bidding screen.
* **Diagnostics**: Helped debug stale connection contexts in Socket.IO where rooms were referencing cached, out-of-date properties.

---

## Important Manual Decisions
* **Authorized HTTP-only Cookie JWTs**: Instead of passing room session tokens in request headers (which is susceptible to client-side injection), I decided to implement secure HTTP-only cookie-based JWT sessions. This handles user identity globally and keeps the auth layer separate from the WebSocket handshake.
* **Database-Driven Connection State Recovery**: I modified the `room:connect` and bidding socket handlers to query the fresh Room document directly from MongoDB (`Room.findById`) rather than utilizing the memory-cached `socket.data.room`. This resolved sync latency and blank-screen crashes when users transitioned from the lobby to a live auction state.
* **Compound Unique Constraints**: To allow identical guest names (like "Bidder") across different rooms while preventing name collisions in the same room, I manually enforced a compound unique index on the Participant model:
  ```javascript
  ParticipantSchema.index({ roomId: 1, username: 1 }, { unique: true });
  ```
* **Authoritative Server Validation**: I moved all bidding increment and role checks to the server. Bidders only emit intents (`bid:place`), and the server decides if a bid is valid before committing it to MongoDB and broadcasting it.

---

## Known Limitations & Future Work
* **Countdown/Timer Synchronization**: Bidding progression is host-triggered. In the next release, adding server-side interval tickers to automatically resolve items after a 30-second countdown will make the auction room fully autonomous.
* **Budget Limits**: Currently, bidders have infinite virtual funds. Enforcing starting squad budgets and validation checks against remaining cash reserves will be added next.
