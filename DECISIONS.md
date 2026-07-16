# Design Decisions & Architecture Trade-offs

This document outlines key technical decisions, architectural trade-offs, and design rationales made during the development of the Mini Realtime Auction Room platform.

---

## 1. Real-time Communication Stack: Socket.IO vs. Native WebSockets

**Decision:** We chose **Socket.IO** over native WebSockets (`ws`).

### Rationale
- **Automatic Reconnection:** Live auctions require continuous connectivity. Socket.IO provides robust automatic reconnection out-of-the-box, ensuring users are seamlessly reconnected if they temporarily lose network coverage.
- **Room-Scoped Messaging:** Socket.IO's native concept of "Rooms" maps perfectly to auction rooms. Moving a socket to a room (`socket.join("room:" + code)`) allows us to broadcast events like bids and presence updates only to relevant users without maintaining complex manual mapping structures.
- **Heartbeats & Presence:** In-built ping/pong mechanism allows accurate and fast detection of socket disconnects, which drives our live connection status badges (the participant presence list).

---

## 2. Server-Authoritative Timer & Clock Sync

**Decision:** The item countdown timer is owned entirely by the server; the client only renders the countdown using the absolute deadline timestamp (`endsAt`).

### Rationale
- **Prevention of Cheat/Exploits:** If the countdown is client-driven, a malicious bidder could delay their local clock to submit bids after the timer should have expired. By storing `endsAt` on the server and executing the expiration on a server-owned `setTimeout`, cheating is eliminated.
- **Restoration Resiliency:** Because `endsAt` is stored as an absolute UTC date in MongoDB, a server crash or database disconnection does not reset the timer duration when the backend restarts. The server simply query active rooms and schedules the timer for `endsAt - now`.
- **Clock Drift Mitigation:** Bids are validated against the server's database time. Clients receive the target `endsAt` and count down locally relative to their own system clock. If a client's system clock is drifted, the backend's strict verification still prevents late bids.

---

## 3. Storage Strategy: MongoDB and Mongoose

**Decision:** **MongoDB** was selected as the database, and Mongoose for Object-Document Mapping (ODM).

### Rationale
- **Document Model Alignment:** Auction catalogs, participant lists, and bid histories are document-centric and map naturally to nested JSON documents.
- **Atomic Operations:** MongoDB's `findOneAndUpdate` supports conditional updates. This allowed us to implement lock-free concurrent bid validation and item status transitions directly at the database layer (preventing race conditions) without introducing complex distributed lock managers like Redis.

---

## 4. Authentication Architecture: Dual-Layer Auth

**Decision:** The application employs a two-tier authentication structure:
1. **Global Authentication (JWT Cookie):** Tracks global identity (`admin`, `demo`, or guest) and protects backend endpoints.
2. **Room Session Authorization (`sessionToken`):** Issued on room creation or join, and stored in the client session. It determines the role (`admin` or `participant`) in that specific room.

### Rationale
- **Decoupled Roles:** A user may be logged in globally as `admin` but join another host's room as a `participant` (bidder). Decoupling room-specific roles from the global auth token allows participants to play different roles across different rooms without re-authenticating.
- **Socket Handshake Security:** Socket.IO handshakes use the `sessionToken` to verify the socket's room eligibility, preventing unauthorized clients from listening to room channels.

---

## 5. Single-Process In-Memory Timers (Trade-off & Scaling)

**Decision:** Active room timers are kept in memory using a simple Map of `NodeJS.Timeout` IDs keyed by Room ID.

### Trade-off
- **Scaling Limit:** This design requires the WebSocket server to be single-instance. If we scale horizontally behind a load balancer, client connections would be split across instances, and the timer Map would be fragmented (e.g. Instance A would not be able to clear or modify a timer scheduled on Instance B).
- **Mitigation/Path Forward:** For high-throughput scaling, we would introduce a Redis-backed Adapter for Socket.IO events and move timer management to a distributed job scheduler (such as BullMQ) backed by Redis. However, for a single-node deployment, in-memory timers are extremely lightweight, zero-dependency, and offer microsecond performance.
