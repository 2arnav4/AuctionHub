
# 11auction Assignment

## Overview

You may choose **any one** of the project options below and build it end to end.

We expect you to use AI coding tools while building this assignment. The goal is not to prove that you can write every line manually. The goal is to see whether you can use AI well, make good technical decisions, build a real product, debug issues, and ship something clean, usable, and maintainable.

Your submission must include:

- A **GitHub repository**
- A **hosted live link**
- A clear README.md
- AI coding transcripts or session exports
- A short explanation of your architecture, assumptions, and tradeoffs

Frontend design, responsiveness, usability, and polish will be considered during evaluation.

## General Requirements

### Technical Requirements

Your project must include:

- Authentication or user/session identity
- Persistent database storage
- Clean frontend UI
- Seed/demo data or a clear demo flow
- Hosted deployment
- Basic error handling
- Loading and empty states
- A clear separation between frontend, backend, database, and realtime logic (if present)

You may use any stack and services/libraries you want, but we recommend staying within the TypeScript ecosystem. Choose tools that make sense for the product.

### Hosting Requirements

You must provide a working live URL.

The hosted app should have:

- Demo credentials, or
- A public demo mode

### Code Quality Expectations

Your code should be:

- Modular
- Readable
- Reasonably typed, if your stack supports it
- Able to handle basic concurrent use

We do not expect a perfect production system, but we do expect evidence that you understand how production software is shaped.

## AI Usage Requirement

You are expected to use AI coding tools such as Codex, Claude Code, Cursor, OpenCode, or similar tools.

Along with your submission, include:

- The AI tool or tools used
- The main prompts/sessions used
- Transcript exports, share links, screenshots, or copied chat logs
- A short note explaining where AI helped and where you made manual decisions

You may redact secrets, API keys, personal tokens, and private account details.

Do not fabricate transcripts. We are not judging you for using AI. We are judging how well you directed it.

## How To Submit AI Transcripts

Provide a folder in your repo named:


ai-transcripts/


Inside it, include exports such as:


ai-transcripts/
  codex-session-1.md
  claude-session-1.txt
  cursor-session-1.md
  opencode-share-links.md
  ai-usage-summary.md


Your ai-usage-summary.md should include:


markdown
# AI Usage Summary

Tools used:
- Claude Code
- Cursor

What AI helped with:
- Initial architecture
- Realtime implementation
- UI component generation
- Debugging deployment issues

Important manual decisions:
- Chose PostgreSQL because...
- Used WebSockets instead of polling because...
- Changed the AI-generated schema because...

Known limitations:
- ...


### Examples By Tool

### Codex

If using Codex, submit one of:

- Exported conversation text or Markdown, if available
- Copied session transcript
- Screenshots of the main session
- Local session JSONL files, if available, commonly under a .codex or ~/.codex/sessions style session directory

### Claude Code

Claude Code supports exporting the current conversation with /export. You can save it as a text file and include it in ai-transcripts/.

Claude's documentation also describes local JSONL transcripts under:


~/.claude/projects/<project>/<session-id>.jsonl


You may include the exported text file or the JSONL transcript.

Reference: https://code.claude.com/docs/en/sessions

### OpenCode

OpenCode supports sharing a conversation with:


/share


This creates a share link for the current conversation. Add the links to:


ai-transcripts/opencode-share-links.md


Reference: https://opencode.ai/docs

### Cursor

If using Cursor, submit one of:

- Exported/copied chat or composer history
- A screen recording if export is not available in your setup

The minimum expectation is that we can see the major prompts, decisions, and debugging steps.

## Project Options

Choose **one** of the following.

## Option 1: AI Memory Journal

### Problem Statement

People forget many small but meaningful details from their daily lives. Photos capture some memories, but they often miss the context: who was there, what happened, how the person felt, what decisions were made, and why the day mattered.

Build an AI-powered personal memory journal.

The user should be able to record (by voice) or write a short daily entry. Ideally, this can be a 3-5 minute voice conversation with the AI at the end of the day. The AI should turn that input into a clean, beautiful journal entry.

The app should extract important memories from the conversation and store them in a way that can be searched later.

For example, years later the user should be able to ask:

- "When did I first meet Rohan?"
- "What did I do on my birthday last year?"
- "When did I visit Goa?"
- "What was I worried about during my first job interview?"

The AI should answer using stored journal memories, ideally with references to the relevant journal entries.

### Core Features

Your app should include:

- Daily journal entry creation
- Text input, voice input, or both
- AI-generated journal summary
- Extracted people, places, events, moods, and decisions
- Search or chat over past memories
- A timeline/calendar view of entries
- A visually pleasant journal reading experience

### Optional Features

You may add:

- AI-generated images or visual cards for journal entries
- Mood trends over time
- Memory graph of people, places, and events
- Private/public entry settings
- Tags
- Voice transcription
- Export to PDF or Markdown

The goal is to build a beautiful, AI-assisted personal memory journal app.

### Assumptions To State

In your README, clearly mention assumptions, if any.

## Option 2: Mini AI Design Mode

### Problem Statement

Many developers can build functional screens, but struggle to make them look polished. Build a small AI design mode tool that helps improve UI screens.

The user should be able to open or upload a web page, and ask the AI to improve it. The best example would be agentation.dev (how we can select components), and how Cursor built it's design mode. The goal is to be able to easily point at components and ask the AI to improve them.

For example:

- "Improve the spacing and hierarchy."
- "Make this empty state look better."
- "Suggest a better mobile layout."
- "Make this pricing card more premium."

The app should give useful design suggestions and, where possible, produce updated code, CSS, or a visual preview.

This does not need to be a full Cursor clone. Keep the scope focused and polished.

### Core Features

Your app should include:

- A page/component/screenshot review interface
- AI-generated design feedback
- Before/after view
- Ability to accept or reject suggestions
- Basic code or CSS output
- A clean, visual interface

### Assumptions To State

In your README, clearly mention assumptions, if any.

## Option 3: Mini Realtime Auction Room

### Problem Statement

Build a realtime auction room similar in spirit to the auction room experience in iplauction.

This does not need to be sports-specific, but the interaction should feel like a real live auction room: users join a room, the admin starts the auction, one item/player is presented at a time, people bid live, a timer runs, and the item is sold or marked unsold.

The product should feel live, competitive, and reliable. The auction logic should be of the main priority.

Example domains:

- Cricket/football fantasy auction
- Collectibles auction
- Art auction
- Sneakers auction
- Domain name auction
- Office charity auction

The important part is the room experience.

### Core Features

Your app should include:

- Create auction room
- Join room by code/link
- Admin and participant roles
- Item/player list
- Start auction
- Current item/player display
- Countdown timer
- Realtime bidding
- Bid history
- Sold/unsold outcome
- Final results page
- Basic room state persistence

### Expected Auction Flow

A reasonable flow would be:


LOBBY -> AUCTION -> COMPLETED


During the auction:

- Only one item/player is active at a time
- Users can place bids while the timer is active
- Highest bid is visible to everyone
- Bid history updates live
- Timer expiry resolves the item
- Admin can pause/end if needed
- Results show who won what and for how much

### Optional Features

You may add:

- Skip/withdraw voting
- Team/squad budgets
- Maximum items per user
- Role/category caps
- Chat/reactions
- Public/private rooms
- Auction pause/resume
- Presence indicators
- Spectator mode

### Realtime Requirement

Realtime is central to this project.

At minimum:

- Bids must update live
- Current item/player must update live
- Timer state must stay reasonably synced
- Results should update without manual refresh

### Assumptions To State

In your README, clearly mention assumptions, if any.

## Option 4: Watch Together Platform

### Problem Statement

Watching videos with friends remotely is harder than it should be. Build a watch-party platform where one user creates a room, adds a YouTube link or video link, invites friends, and everyone watches together.

The video should stay synchronized across users. If one user pauses, resumes, or seeks, the room should update for everyone.

The app should also include realtime chat so people can react while watching.

### Core Features

Your app should include:

- Create watch room
- Join room by link/code
- Add YouTube/video URL
- Shared video player
- Realtime play/pause/seek sync
- Realtime chat
- Room participants list
- Late joiner sync
- Basic room persistence

### Optional Features

You may add:

- Host-only controls
- Emoji reactions
- Watch queue
- User presence
- Room history
- Private/public rooms
- Voice notes
- Polls
- Start-at-same-time countdown
- Mobile-friendly viewing mode

### Realtime Requirement

Realtime is central to this project.

At minimum:

- Play/pause should sync
- Seeking should sync
- Chat should update live
- Late joiners should enter at the correct timestamp
- Multiple users should not permanently desync the room

### Assumptions To State

In your README, clearly mention assumptions, if any.

## Evaluation Criteria

### 1. Product Completeness

Does the app solve the stated problem?

Can we use it without the developer explaining every step?

### 2. Realtime Correctness

Does realtime behavior work across multiple browser sessions?

Does the app remain consistent when users act at the same time?

### 3. Engineering Quality

Is the code clean, modular, and maintainable?

Are edge cases handled?

### 4. Frontend Quality

Does the app look good? Responsiveness does not matter — desktop only should do.

Are loading, empty, and error states handled?

Does the UI feel smooth and intentional?

### 5. Deployment

Is the hosted app working?

Are environment variables documented?

### 6. AI Usage Quality

Did the candidate use AI effectively?

Did they guide the AI with clear prompts?

Did they review and improve AI-generated code?

Can they explain what they accepted, rejected, and changed?

### 7. Communication

Can the candidate explain their architecture, tradeoffs, and limitations clearly in a later discussion?

## Final Submission Checklist

Your submission should include:

- GitHub repository link
- Hosted live app link
- Demo login credentials or demo instructions
- README.md
- .env.example
- AI transcript folder or links
- Architecture/design decision notes
- Known limitations
- Any test instructions

Example README sections:


markdown
# Project Name

## Live Demo

## Demo Credentials

## Tech Stack

## Features

## Architecture

## Realtime Design

## Database Schema

## AI Usage

## Running Locally

## Environment Variables

## Known Limitations

## Future Improvements


## Follow-Up Round

There may be further interview round(s) where you explain:

- Your architecture
- Your choices
- Your AI usage
- Your deployment setup
- Tradeoffs you made
- What you would improve with more time
- Basic walkthrough of the product

Perfect. This response means Milestone 2 backend is working correctly. ✅

Let's verify each part:

Room creation

You got:

"code": "BU1ZEJ"

✅ Unique room code generation works.

"status": "lobby"

✅ Correct initial auction state.

"adminParticipantId": "6a50..."

✅ Room is linked to the creator.

Participant creation

You got:

"username": "Arnav",
"role": "admin"

✅ Creator correctly becomes admin.

You got:

"sessionToken": "75386d97..."

✅ Session identity system works.

This token will later be used for:

Socket.IO authentication
Reconnection
Knowing who is allowed to start auctions
Database relation

You have:

Room:

_id:
6a50c5af20d45f21ed68c92a

Participant:

roomId:
6a50c5af20d45f21ed68c92a

✅ Relationship is correct.

Before moving forward, do two more tests
Test 1: Get Room

Request:

GET

http://localhost:3001/api/rooms/BU1ZEJ

Expected:

{
  "code": "BU1ZEJ",
  "name": "IPL Mega Auction",
  "status": "lobby"
}
Test 2: Join Room

Create another participant.

POST:

http://localhost:3001/api/rooms/BU1ZEJ/join

Body:

{
  "username": "Rahul"
}

Expected:

{
    "room": {
        "code": "BU1ZEJ"
    },
    "participant": {
        "username": "Rahul",
        "role": "participant"
    },
    "sessionToken": "..."
}

If both pass, commit this checkpoint.

git add .
git commit -m "feat: implement and verify room management APIs"
git push
After this, next milestone is NOT Socket.IO yet.

The next thing we should do is:

Milestone 3: Connect Frontend Create/Join UI

Because currently your flow is:

Postman
   |
   |
Backend
   |
MongoDB

We need:

Browser
   |
React Forms
   |
Express API
   |
MongoDB

The user should be able to:

Open website
Click Create Room
Enter:
Username
Room name
Click Create
Receive:
Room code
Session token
Move to:
/lobby/BU1ZEJ

Then we have a real working product.

You are progressing exactly how I would want for this assignment. Don't add WebSockets until the normal HTTP flow is complete.

This is actually a very good sign. Your Socket.IO milestone is working at the basic connection level. Let's decode the logs:

Successfully connected to MongoDB.
Server running on http://localhost:3001

✅ Backend is running
✅ MongoDB connection is healthy

Then:

Socket gkxbE5HkOrNADMpCAAAC (user: Testing1) connected to room 1I89R1

and:

Socket nZVHjOrojAhDB1u0AAAD (user: Arnav) connected to room 1I89R1

This proves:

✅ Socket.IO handshake works
✅ sessionToken authentication works
✅ backend identified users
✅ users are joining the correct Socket.IO room

Your architecture is now:

Browser 1
  |
  | socket connection
  ↓
Socket.IO Server
  |
  | room:1I89R1
  |
  ├── Testing1 socket
  └── Arnav socket

This is the exact foundation needed for realtime auction.

Now verify one thing before moving ahead

The log only proves connection.

We need to verify broadcasting.

Do this:

Open two browser windows:

Window 1:

Create Room
Username: Arnav

Window 2:

Join Room
Username: Testing1

Now in window 1 lobby:

You should see:

Participants

🟢 Arnav (Admin)
🟢 Testing1 (Participant)

without refreshing.

Then close Window 2.

Window 1 should update:

Participants

🟢 Arnav (Admin)
If this works:

Commit this checkpoint:

git add .
git commit -m "feat: add realtime lobby presence with Socket.IO"
git push
Small improvement before next milestone

Your log:

Socket gkxbE5HkOrNADMpCAAAC

is exposing socket IDs.

For production, I would change logging to:

User Testing1 connected to auction room 1I89R1

Not mandatory, but cleaner.

Next milestone after this:

Now we move to the actual auction features:

Milestone 5: Auction Items Management

Flow:

Admin lobby:

+ Add Player/Item

Name:
Virat Kohli

Base Price:
500

Add

MongoDB:

auction_items

{
 name:"Virat Kohli",
 startingBid:500,
 status:"pending"
}

Everyone sees:

Upcoming Items:

Virat Kohli
MS Dhoni
Rohit Sharma

Still no bidding.

Then after that:

Milestone 6:

Admin clicks:

Start Auction

Socket broadcasts:

item:activated

Everyone sees the current item.

Then:

Milestone 7:

Bidding.

Before moving, just confirm one thing:

Are both browser windows actually updating the participant list live, or are you only seeing the backend logs?

Because if only logs are working, we need a small frontend socket state fix before continuing.

It is showing offline which works
Give me the next promtp

Also how many prompts are left if there are more than 5 just couple 2 of them 

Good. Since it is showing offline/disconnected correctly, the connection lifecycle is working. We can move ahead.

Regarding prompts: based on the remaining assignment scope, we need roughly:

✅ Socket.IO Lobby Presence (done)
Auction Items Management
Start Auction + Current Item Broadcast
Live Bidding + Bid Validation
Timer Synchronization
Results + Polish + Deployment

So around 5–6 more meaningful prompts are left. Since you asked to couple them if more than 5, I'll combine where it makes sense.

Next prompt should combine:

Milestone 5: Auction Item Management
Basic admin controls

Do NOT add bidding yet.

Paste this:

We are continuing the Mini Realtime Auction Room project.

Completed milestones:

✅ React frontend
✅ Landing page
✅ Create room flow
✅ Join room flow
✅ MongoDB Atlas backend
✅ Room and Participant models
✅ REST APIs
✅ Socket.IO connection
✅ Realtime lobby presence

Now implement the next milestone:

Auction Item Management.

Do NOT implement:
- bidding
- countdown timer
- winner selection
- auction completion

Only implement adding and displaying auction items.

Goal:

The admin should be able to add auction items before the auction starts.

Flow:

Admin creates room
        ↓
Lobby
        ↓
Add auction items
        ↓
All participants see upcoming items


Backend:

1. Create AuctionItem model.

Fields:

- roomId
- name
- description (optional)
- startingBid
- status

Status:
- pending
- active
- sold
- unsold

- createdAt
- updatedAt


2. Create REST APIs:

POST /api/rooms/:code/items

Admin only.

Body:

{
 name,
 description,
 startingBid
}


GET /api/rooms/:code/items

Return all auction items.


Validation:

- Only admin can add items.
- Cannot add items after auction starts.
- Starting bid must be positive.


3. Add Socket.IO event:

When admin adds an item:

Server broadcasts:

item:added

Payload:

{
 item
}


Frontend:

1. Update Lobby page.

Add admin-only section:

"Add Auction Item"

Fields:

- Item name
- Description
- Starting bid


2. Show upcoming items list:

Example:

Upcoming Auction Items:

Virat Kohli
Base Bid: ₹500

MS Dhoni
Base Bid: ₹400


3. Add realtime update:

If admin adds an item:

Other participants should see it without refreshing.


Architecture rules:

- Keep REST for creating data.
- Keep Socket.IO for broadcasting updates.
- Server remains source of truth.
- Keep models/controllers/services separated.
- Use TypeScript types.


After implementation explain:

1. Auction item database design.
2. REST vs Socket.IO responsibility.
3. Files created/modified.
4. How to test with two browsers.

Stop after this milestone.

After this, the next prompt will be the most important one:

Start Auction + Active Item Broadcast

That is where the app starts feeling like a real IPL auction:

Admin clicks Start Auction

        ↓

Socket event

        ↓

Everyone sees:

CURRENT ITEM
Virat Kohli

Timer: 30s

Highest Bid: ₹500

Then after that we add bidding. Don't combine bidding too early because the auction state machine becomes harder to debug.

Okay, the previous step is working. What is the next step we need to implement to start the auction? Give me the next few prompts to work on.

Okay, let's proceed to the next phase: starting the auction and managing active items. We can break the remaining work into three parts:

Prompt 1: Start Auction + Active Item + Timer foundation
Prompt 2: Realtime Bidding + Bid Validation + Sold/Unsold Logic
Prompt 3: Results + Reconnection + Final Polish + Deployment readiness

Do them one by one (don't paste all together). The reason is each one changes the state machine, and if something breaks, debugging becomes painful.

PROMPT 1 — Start Auction + Active Item + Timer Foundation

Paste:

We are continuing the Mini Realtime Auction Room project.

Completed:

✅ React frontend
✅ Backend Express + TypeScript
✅ MongoDB Atlas
✅ Room creation/join
✅ Session authentication
✅ Socket.IO lobby presence
✅ Auction item creation
✅ Realtime item updates

Now implement:

Milestone: Start Auction + Active Item Management

Do NOT implement bidding yet.

Goal:

Admin should be able to start the auction.
The server should activate one auction item at a time and broadcast the active item to all users.

Flow:

Lobby
 ↓
Admin clicks Start Auction
 ↓
Server changes room status to live
 ↓
First pending item becomes active
 ↓
All connected clients receive active item


Backend:

1. Add auction start functionality.

Socket event:

Client → Server:

auction:start


Only admin can trigger.


Server should:

- Verify user is admin
- Verify room is in lobby state
- Change room status to live
- Select first pending item
- Mark item as active
- Set active item timestamp


2. Add socket events:

Server → Client:

auction:started

Payload:

{
 room
}


item:activated

Payload:

{
 item,
 startedAt
}


3. Update database:

Room:
- status: lobby | live | completed
- currentItemId


AuctionItem:
- status:
  pending
  active
  sold
  unsold


Frontend:

1. Add admin button:

Start Auction


2. Create Auction Room view.

Display:

Current Item:

Name
Description
Starting Bid


3. All users should automatically move from lobby view to auction view after receiving socket event.


4. Add loading and error states.


Engineering:

- Server remains the source of truth.
- Do not allow clients to decide active item.
- Keep Socket.IO events typed.
- Keep services/controllers separated.


After implementation explain:

1. Auction lifecycle changes.
2. Socket events added.
3. Database changes.
4. How to test with multiple browsers.

Stop after this milestone.
PROMPT 2 — Live Bidding + Sold/Unsold Logic

After Prompt 1 works, paste:

We are continuing Mini Realtime Auction Room.

Completed:

✅ Auction rooms
✅ Participants
✅ Socket.IO
✅ Auction items
✅ Auction start
✅ Active item broadcasting

Now implement:

Milestone: Realtime Bidding System

Goal:

Participants should be able to place bids on the active item.

Server must control all bidding rules.


Backend:

Create Bid model:

Fields:

- roomId
- itemId
- participantId
- username
- amount
- createdAt


Add Socket event:

Client → Server:

bid:place

Payload:

{
 amount
}


Validation:

Server checks:

- User belongs to room
- User is participant
- Auction is live
- Item is active
- Bid amount is greater than current bid
- Bid increment rules are respected


On valid bid:

1. Save bid to MongoDB.
2. Update item's currentBid.
3. Update highest bidder.
4. Broadcast:

bid:accepted

Payload:

{
 bid,
 item
}


On invalid bid:

Broadcast only to sender:

bid:rejected

Payload:

{
 reason,
 minimumBid
}


Frontend:

Auction page should show:

Current Item

Highest Bid

Highest Bidder

Bid History

Bid Input

Place Bid button


Realtime:

When another user bids:

Everyone should update instantly.


Add sold/unsold resolution:

For now:

Add admin buttons:

Sell Item
Mark Unsold


Sell Item:

- item status = sold
- save winner
- broadcast:

item:sold


Unsold:

- item status = unsold
- broadcast:

item:unsold


After implementation explain:

1. Bid validation logic.
2. How simultaneous bids are handled.
3. Database flow.
4. Testing process.

Stop after this milestone.
PROMPT 3 — Complete Auction + Results + Production Polish

After bidding works, paste:

We are completing Mini Realtime Auction Room.

Completed:

✅ Rooms
✅ Authentication/session tokens
✅ Socket.IO
✅ Lobby presence
✅ Auction items
✅ Auction start
✅ Live bidding
✅ Sold/unsold handling


Now implement final milestone:

Auction Completion + Results + Production Polish.


Backend:

1. Add automatic item progression.

After an item is sold or unsold:

- Move to next pending item.
- Activate next item.
- If no items remain:
  - room status = completed
  - broadcast auction completion.


Socket events:

item:ended

auction:completed


2. Add results API:

GET /api/rooms/:code/results


Return:

- sold items
- winners
- final prices


Frontend:

Create Results page:

Show:

Auction Completed

Items Sold:

Player | Winner | Amount


Add empty/loading/error states.


Reconnection improvements:

When user reconnects:

- restore session
- reconnect socket
- receive latest room state


Add final polish:

- Better error messages
- Toast notifications
- Loading skeletons
- Empty states
- Responsive fixes


Deployment preparation:

Create:

.env.example

README sections:

- Architecture
- Tech stack
- Database design
- Socket.IO design
- Local setup
- Deployment steps
- AI usage notes


Do not add unnecessary features.

Focus on making the current product reliable and demo-ready.

After completion explain:

1. Final architecture.
2. Complete auction lifecycle.
3. Known limitations.
4. Interview explanation points.

Stop after this.

After these 3 prompts, your assignment is basically complete.

The only thing I would manually do after AI finishes:

Test with 3 browser windows
Record a 1–2 minute demo video
Add AI transcript folder
Deploy frontend + backend

At that point you have a very interview-friendly project:
React + TypeScript + Express + MongoDB + Socket.IO realtime system.