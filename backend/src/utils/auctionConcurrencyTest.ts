import assert from "node:assert/strict";
import test, { after, before } from "node:test";
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { AuctionItem } from "../models/itemModel.js";
import { Room } from "../models/roomModel.js";

/**
 * Integration tests for the concurrency control the auction depends on.
 *
 * These exercise the exact conditional updates used by the bid and resolution
 * handlers, against a real MongoDB, because that is where the correctness lives:
 * the guarantees come from the query filters, not from application logic, so a
 * test with a mocked model would prove nothing.
 *
 * Requires a reachable MONGODB_URI. If there is none, every test is skipped
 * rather than failed, so `npm test` still passes in an environment without a
 * database.
 */

let dbAvailable = false;
let roomId: mongoose.Types.ObjectId;

before(async () => {
  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: 5_000,
      dbName: env.mongodbDbName,
    });
    dbAvailable = true;
    const room = await Room.create({
      code: `T${Date.now().toString(36).slice(-5).toUpperCase()}`,
      name: "Concurrency Test Room",
      status: "live",
    });
    roomId = room._id as mongoose.Types.ObjectId;
  } catch {
    dbAvailable = false;
  }
});

after(async () => {
  if (!dbAvailable) return;
  await AuctionItem.deleteMany({ roomId });
  await Room.deleteMany({ _id: roomId });
  await mongoose.disconnect();
});

async function createActiveItem(startingBid: number, endsInMs: number) {
  return AuctionItem.create({
    roomId,
    name: "Concurrency Fixture",
    startingBid,
    currentBid: 0,
    status: "active",
    endsAt: new Date(Date.now() + endsInMs),
  });
}

/** The bid handler's claim, in full. */
function claimBid(itemId: mongoose.Types.ObjectId, amount: number, newEndsAt: Date) {
  return AuctionItem.findOneAndUpdate(
    {
      _id: itemId,
      status: "active",
      endsAt: { $gt: new Date() },
      startingBid: { $lte: amount },
      currentBid: { $lt: amount },
    },
    { $set: { currentBid: amount, endsAt: newEndsAt } },
    { new: true },
  );
}

test("only one of many identical concurrent bids is accepted", async (t) => {
  if (!dbAvailable) return t.skip("no reachable MONGODB_URI");
  const item = await createActiveItem(100, 60_000);
  const later = new Date(Date.now() + 60_000);

  const results = await Promise.all(
    Array.from({ length: 20 }, () => claimBid(item._id as mongoose.Types.ObjectId, 500, later)),
  );

  const accepted = results.filter((result) => result !== null);
  assert.equal(accepted.length, 1, "exactly one bid at the same amount may win");

  const stored = await AuctionItem.findById(item._id);
  assert.equal(stored?.currentBid, 500);
});

test("a rising ladder of concurrent bids settles on the highest", async (t) => {
  if (!dbAvailable) return t.skip("no reachable MONGODB_URI");
  const item = await createActiveItem(100, 60_000);
  const later = new Date(Date.now() + 60_000);
  const amounts = [150, 400, 250, 900, 300, 700];

  await Promise.all(
    amounts.map((amount) => claimBid(item._id as mongoose.Types.ObjectId, amount, later)),
  );

  const stored = await AuctionItem.findById(item._id);
  assert.equal(stored?.currentBid, Math.max(...amounts), "the highest bid must survive the race");
});

test("a bid below the asking price cannot win even with no bids yet", async (t) => {
  if (!dbAvailable) return t.skip("no reachable MONGODB_URI");
  const item = await createActiveItem(100, 60_000);

  const result = await claimBid(item._id as mongoose.Types.ObjectId, 50, new Date(Date.now() + 60_000));
  assert.equal(result, null, "currentBid starts at zero, so startingBid must be enforced in the filter");
});

test("the opening bid may match the asking price exactly", async (t) => {
  if (!dbAvailable) return t.skip("no reachable MONGODB_URI");
  const item = await createActiveItem(100, 60_000);

  const result = await claimBid(item._id as mongoose.Types.ObjectId, 100, new Date(Date.now() + 60_000));
  assert.notEqual(result, null, "an item listed at 100 must be openable at 100");
});

test("only one of two simultaneous resolutions wins", async (t) => {
  if (!dbAvailable) return t.skip("no reachable MONGODB_URI");
  const item = await createActiveItem(100, 60_000);

  const [sell, unsold] = await Promise.all([
    AuctionItem.findOneAndUpdate(
      { _id: item._id, status: "active" },
      { $set: { status: "sold" } },
      { new: true },
    ),
    AuctionItem.findOneAndUpdate(
      { _id: item._id, status: "active" },
      { $set: { status: "unsold" } },
      { new: true },
    ),
  ]);

  const winners = [sell, unsold].filter((result) => result !== null);
  assert.equal(winners.length, 1, "an item can only be resolved once");
});

test("a stale expiry cannot end an item whose deadline was extended", async (t) => {
  if (!dbAvailable) return t.skip("no reachable MONGODB_URI");
  // The item's deadline has already been pushed into the future by an accepted
  // bid. A timer callback fired for the previous deadline is now in flight and
  // cannot be cancelled, so it must fail to claim the item.
  const item = await createActiveItem(100, 60_000);

  const staleExpiry = await AuctionItem.findOneAndUpdate(
    { _id: item._id, status: "active", endsAt: { $lte: new Date() } },
    { $set: { status: "sold" } },
    { new: true },
  );

  assert.equal(staleExpiry, null, "an extended item must survive its previous timer");

  const stored = await AuctionItem.findById(item._id);
  assert.equal(stored?.status, "active", "the item must still be open for bidding");
});

test("an expiry does claim an item whose deadline has genuinely passed", async (t) => {
  if (!dbAvailable) return t.skip("no reachable MONGODB_URI");
  const item = await createActiveItem(100, -1_000);

  const expiry = await AuctionItem.findOneAndUpdate(
    { _id: item._id, status: "active", endsAt: { $lte: new Date() } },
    { $set: { status: "unsold" } },
    { new: true },
  );

  assert.notEqual(expiry, null, "the elapsed-deadline guard must not block a real expiry");
  assert.equal(expiry?.status, "unsold");
});
