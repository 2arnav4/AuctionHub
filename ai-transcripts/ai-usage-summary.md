# AI Usage Summary

Tools used:
- Cursor
- ChatGPT
- Antigravity (Google DeepMind)

What AI helped with:
- Initial project architecture and scaffold structures.
- Authoritative Socket.IO configuration and room sync validation.
- MongoDB schema design (Room, Participant, AuctionItem, and Bid collections).
- Premium dark Vercel/Linear-inspired SaaS UI styles.
- Debugging and fixing state sync anomalies, stale socket metadata caches, and safe price conversions.

Important manual decisions:
- Selected a hybrid REST + Socket.IO architectural layout: REST APIs are leveraged for session registrations and results catalog retrieval, while WebSockets handle high-frequency bidding, presence sync, and item progressions.
- Implemented HTTP-only cookie-based JWT authentication to secure active bidder profiles and isolate demo/guest accounts.
- Enforced compound unique indexes in Mongoose (`{ roomId: 1, username: 1 }`) to authoritatively prevent username collisions within active rooms.
