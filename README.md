# Mini Realtime Auction Room

A server-authoritative live auction platform. A host creates a private room, prepares a catalog, and runs the auction one item at a time. Bidders join with a room code and bid concurrently against a synchronized countdown. Every state transition is decided by the server and persisted to MongoDB, so a refresh, a disconnect, or a backend restart recovers the room rather than losing it.

![Auction room preview](main/preview.jpeg)

---

## Live Demo

- **App:** https://auction-assignment.vercel.app
- **API:** https://live-auction-fhb9.onrender.com

> The backend runs on Render's free tier and sleeps after roughly 15 minutes of inactivity. The first request after an idle period wakes it and can take up to a minute; the app shows an explanatory notice while it waits. Load the app once before demoing to warm it.

## Demo Credentials

| Account | Username | Password |
|---|---|---|
| Bidder | `demo` | `password123` |

Signing in as `demo` issues a uniquely numbered alias (`demo_1`, `demo_2`, …) so the same credentials can be used simultaneously in several browser profiles. You can also register a normal account from the Sign Up tab.

Roles are per-room, not global: whoever creates a room is that room's host, and everyone who joins is a bidder. The same account can host one room and bid in another.

## Tech Stack

**Frontend** — React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, Socket.IO client, React Router
**Backend** — Node.js, Express 5, TypeScript, Mongoose, Socket.IO
**Database** — MongoDB (Atlas)
**Hosting** — Vercel (frontend), Render (backend)
**Testing** — Node.js native test runner

## Features

- **Rooms by code** — create a room, share a six-character code, join from anywhere.
- **Host and bidder roles** — assigned server-side at room creation or join and encoded in a room-scoped session token.
- **Catalog preparation** — the host adds items while the room is in the lobby; every connected client sees them appear live.
- **Atomic concurrent bidding** — simultaneous bids are resolved by a single conditional MongoDB update, so exactly one can win.
- **Anti-snipe countdown** — an accepted bid restarts the item's countdown, so a last-second bid cannot win uncontested.
- **Server-owned timers** — deadlines are stored as absolute timestamps and rebuilt on boot, so a restart mid-auction resumes rather than resets.
- **Presence** — live online/offline indicators, with stale flags cleared on startup.
- **Resolution** — the host can sell or mark unsold at any time; otherwise the timer resolves the item automatically.
- **Results** — a final summary of revenue, items sold, and winners.
- **Degraded mode** — if MongoDB is unreachable the API returns an explicit 503 and the client shows a retryable error instead of hanging.

## Architecture

```mermaid
flowchart LR
  C["React client"] -->|"REST: auth, rooms, items"| API["Express API"]
  C <-->|"Socket.IO: bids, presence, timers"| SIO["Socket.IO server"]
  API --> DB[("MongoDB")]
  SIO --> DB
  T["In-memory timers"] --> SIO
```

REST handles anything request/response shaped — authentication, creating and joining rooms, adding catalog items, fetching results. Socket.IO handles everything continuous — presence, bids, item activation, resolution. MongoDB is the only source of truth; the socket layer broadcasts state, it does not own it.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the event map, concurrency control, and schema, and [DECISIONS.md](DECISIONS.md) for the trade-offs behind these choices.

## Realtime Design

Sockets authenticate during the handshake with the room-scoped `sessionToken` issued at create/join, and are joined to a `room:{CODE}` channel. The client never decides anything: it emits intent (`bid:place`, `item:sell`) and renders what the server broadcasts back.

Ordering matters for correctness in two places, both handled at the database rather than in application code:

- A bid is accepted by a conditional update requiring the item to still be active, still be within its deadline, and hold a lower current bid. Concurrent bids at the same amount cannot both match.
- An item is resolved by a conditional update requiring it to still be active, so a host clicking Sell at the same instant a timer expires produces exactly one outcome.

Full event table in [ARCHITECTURE.md](ARCHITECTURE.md).

## Database Schema

Five collections: `users` (global accounts), `rooms`, `participants` (per-room membership and role), `auctionitems`, `bids`. Diagram and field detail in [ARCHITECTURE.md](ARCHITECTURE.md).

## AI Usage

Built with AI assistance. Tooling, prompts, transcripts, and a breakdown of which decisions were directed versus accepted as generated are in [`ai-transcripts/`](ai-transcripts/).

## Running Locally

**Prerequisites:** Node.js 18+, and MongoDB running locally or an Atlas connection string.

```bash
git clone https://github.com/2arnav4/Auction-Assignment.git
cd "Mini Realtime Auction Room"
```

**Backend**

```bash
cd backend
npm install
cp .env.example .env     # then edit MONGODB_URI and JWT_SECRET
npm run dev              # watch mode on http://localhost:3001
```

**Frontend** (in a second terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

**Checks**

```bash
cd backend  && npm run lint && npm test    # typecheck + unit tests
cd frontend && npm run lint && npm run build
```

## Environment Variables

**`backend/.env`**

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PORT` | no | `3001` | HTTP port. Must be a positive integer. |
| `NODE_ENV` | no | `development` | `production` enables `Secure; SameSite=None` auth cookies, required for a cross-origin deployment. |
| `CLIENT_URL` | no | `http://localhost:5173` | Allowed CORS origin. In development `http://localhost:5173` is always permitted as well. |
| `MONGODB_URI` | no | `mongodb://localhost:27017/auction-room` | Connection string. Include a database name in the path, otherwise Mongoose falls back to `test`. |
| `AUCTION_ITEM_DURATION_SECONDS` | no | `60` | Countdown per item, and the amount an accepted bid restores it to. |
| `JWT_SECRET` | **yes in production** | dev-only fallback | Signing key. Startup fails if unset when `NODE_ENV=production`. |

**`frontend/.env`**

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_URL` | no | `http://localhost:3001/api` | Backend base URL. A trailing `/api` is optional; the socket client strips it. |

## API

All REST routes are mounted under `/api` and return JSON. Errors use `{ "error": "message" }`.

**Auth**

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account and sign in. Password must be 8+ characters with upper, lower, digit, and symbol. |
| `POST` | `/api/auth/login` | Sign in and receive an HTTP-only JWT cookie. |
| `POST` | `/api/auth/logout` | Clear the auth cookie. |
| `GET` | `/api/auth/me` | Current user, or `{ "user": null }`. |

**Rooms**

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/rooms` | Create a room. Returns the room, the host participant, and a `sessionToken`. |
| `POST` | `/api/rooms/:code/join` | Join a room. Returns the room, the participant, and a `sessionToken`. |
| `GET` | `/api/rooms/:code` | Room details by code. |
| `GET` | `/api/rooms/:code/results` | Resolved items for a finished auction. |

**Items**

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/rooms/:code/items` | Add a catalog item. Host only, lobby only. Requires the `x-session-token` header. |
| `GET` | `/api/rooms/:code/items` | List a room's catalog. |

**Health**

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Always 200 while the process is alive. Body reports `ready`, `database`, and `uptimeSeconds`. |

## Demo Flow

1. Sign in as `demo` / `password123`, create a room, and add two or three items.
2. In a second browser profile or incognito window, sign in as `demo` again and join with the room code. Both windows show the participant list updating live.
3. Click **Start Live Auction**. Both screens move to the auction board with a synchronized countdown.
4. Bid from the bidder window. The host window updates instantly; bids below the current highest are rejected with the required minimum. Each accepted bid restarts the countdown.
5. Let the timer expire or resolve the item manually. The next item activates automatically.
6. When the catalog is exhausted every client is redirected to the results page.

To see the concurrency handling directly, open two bidder windows and submit the same amount at the same moment: exactly one is accepted and the other is told the new minimum.

## Known Limitations

- **Single instance only.** Countdown timers live in an in-memory `Map` keyed by room id. Running two backend instances behind a load balancer would fragment that map, and Socket.IO broadcasts would not reach clients on the other instance. Horizontal scaling needs the Redis adapter plus a shared scheduler.
- **Cold starts.** The free Render tier sleeps when idle; the first request can take up to a minute.
- **Room reads are public.** Anyone holding a room code can call `GET /api/rooms/:code` and `/results`. Bidding and catalog changes are authorized, reading is not.
- **Room create and join are not authenticated at the API level.** The UI requires a signed-in user, but the endpoints accept a username in the body.
- **Password hashing is weak.** PBKDF2-SHA512 at 1,000 iterations, well below current guidance.
- **No rate limiting** on authentication or bid submission.
- **Unbounded anti-snipe.** Every accepted bid restores the full countdown, so an item can in principle be extended indefinitely.
- **Bidding closes on the client clock.** The bid form hides when the client believes the deadline has passed. A significantly fast client clock can hide the form early, though the server would still accept the bid.
- **Minimum bid is one above the starting price.** An item listed at ₹500 opens at ₹501, because items are created with `currentBid` equal to `startingBid`.
- **Test coverage is thin.** Unit tests cover pure helpers only; the concurrency paths are verified manually.

## Future Improvements

- Redis adapter and a distributed scheduler for multi-instance deployment.
- Integration tests for concurrent bids and resolution races.
- Team budgets and per-bidder spend caps.
- Host pause/resume of the countdown.
- Spectator (read-only) role.
- Chat and reactions in the auction room.

## License

MIT.
