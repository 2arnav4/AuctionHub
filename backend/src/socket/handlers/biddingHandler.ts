import type { Server, Socket } from "socket.io";
import { AuctionItem } from "../../models/itemModel.js";
import { Bid } from "../../models/bidModel.js";
import { Room } from "../../models/roomModel.js";
import { isValidPositiveAmount } from "../../utils/auction.js";
import { env } from "../../config/env.js";
import { scheduleAuctionTimer } from "./resolutionHandler.js";

/**
 * Registers Bidding-related event listeners for a given Socket instance.
 */
export function registerBiddingHandlers(io: Server, socket: Socket): void {
  // Event: bid:place
  socket.on("bid:place", async (data: { amount?: unknown }) => {
    try {
      const participant = socket.data.participant;
      const cachedRoom = socket.data.room;

      if (!participant || !cachedRoom) {
        socket.emit("bid:rejected", {
          reason: "Not authenticated for any room.",
          minimumBid: 1,
        });
        return;
      }

      // Query database to fetch fresh status and currentItemId
      const room = await Room.findById(cachedRoom._id);
      if (!room) {
        socket.emit("bid:rejected", {
          reason: "Room not found.",
          minimumBid: 1,
        });
        return;
      }

      // 1. Verify user is a participant (Admins/Hosts cannot bid)
      if (participant.role !== "participant") {
        socket.emit("bid:rejected", {
          reason: "Access denied: Room hosts are not allowed to place bids.",
          minimumBid: 0,
        });
        return;
      }

      const roomCode = room.code;
      const socketRoomId = `room:${roomCode}`;

      // 2. Fetch latest active item details
      if (!room.currentItemId) {
        socket.emit("bid:rejected", {
          reason: "No active bidding item found.",
          minimumBid: 1,
        });
        return;
      }

      const activeItem = await AuctionItem.findById(room.currentItemId);
      if (!activeItem || activeItem.status !== "active") {
        socket.emit("bid:rejected", {
          reason: "Item is not open for bidding.",
          minimumBid: 1,
        });
        return;
      }

      const amount = data.amount;
      if (!isValidPositiveAmount(amount)) {
        socket.emit("bid:rejected", {
          reason: "Bid amount must be a valid number.",
          minimumBid: activeItem.currentBid + 1,
        });
        return;
      }

      // 3. Validate bid amount. The first bid may match the asking price
      // exactly; every later bid must beat the standing highest.
      const minimumBidRequired = Math.max(activeItem.startingBid, activeItem.currentBid + 1);
      if (amount < minimumBidRequired) {
        socket.emit("bid:rejected", {
          reason: `Bid amount is too low. Minimum required: ₹${minimumBidRequired}`,
          minimumBid: minimumBidRequired,
        });
        return;
      }

      // 4. Claim the highest bid atomically before writing anything.
      //
      // Only one concurrent request can match `currentBid: { $lt: amount }`, so
      // the losers never write at all. Persisting the bid first and deleting it
      // on failure — the previous approach — left a rejected bid briefly visible
      // to any concurrent room:connect reading the log, and orphaned it forever
      // if the process died between the write and the compensating delete.
      //
      // The same update extends the deadline: an accepted bid restarts the
      // countdown so a last-second snipe cannot end the item uncontested.
      const newEndsAt = new Date(Date.now() + env.auctionItemDurationSeconds * 1000);

      const updatedItem = await AuctionItem.findOneAndUpdate(
        {
          _id: activeItem._id,
          status: "active",
          endsAt: { $gt: new Date() },
          // Both floors are enforced here, not just in the check above, because
          // the check above is a separate read and cannot be trusted under
          // concurrency. currentBid starts at zero, so without the startingBid
          // condition any positive amount would satisfy the filter.
          startingBid: { $lte: amount },
          currentBid: { $lt: amount },
        },
        {
          $set: {
            currentBid: amount,
            highestBidderId: participant._id,
            highestBidderUsername: participant.username,
            endsAt: newEndsAt,
          },
        },
        { new: true },
      );

      if (!updatedItem) {
        const latestItem = await AuctionItem.findById(activeItem._id);
        const latestMinimumBid = latestItem
          ? Math.max(latestItem.startingBid, latestItem.currentBid + 1)
          : 1;
        const reason = latestItem?.endsAt && latestItem.endsAt <= new Date()
          ? "Bidding time has expired for this item."
          : `Bid amount is too low. Minimum required: ₹${latestMinimumBid}`;
        socket.emit("bid:rejected", {
          reason,
          minimumBid: latestMinimumBid,
        });
        return;
      }

      // 5. The claim succeeded, so this bid is now the authoritative highest and
      // can safely be appended to the immutable log.
      const newBid = new Bid({
        roomId: room._id,
        itemId: activeItem._id,
        participantId: participant._id,
        username: participant.username,
        amount,
      });
      await newBid.save();

      // Reset Room endsAt and reschedule the authoritative server-owned timer
      await Room.updateOne(
        { _id: room._id },
        { $set: { endsAt: newEndsAt } }
      );
      room.endsAt = newEndsAt;
      scheduleAuctionTimer(io, room._id.toString(), newEndsAt);

      // 6. Broadcast successful bid
      io.to(socketRoomId).emit("bid:accepted", {
        bid: newBid,
        item: updatedItem,
      });

      console.log(`Bid of ₹${amount} placed by ${participant.username} on item ${updatedItem.name}`);
    } catch (error) {
      console.error("Error in bid:place handler:", error);
      socket.emit("bid:rejected", {
        reason: "Internal server error placing bid.",
        minimumBid: 1,
      });
    }
  });
}
