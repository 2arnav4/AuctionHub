import type { Server, Socket } from "socket.io";
import { AuctionItem } from "../../models/itemModel.js";
import { Bid } from "../../models/bidModel.js";
import { Room } from "../../models/roomModel.js";
import { isValidPositiveAmount } from "../../utils/auction.js";

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

      // 3. Validate bid amount (must be strictly higher than current bid)
      const minimumBidRequired = activeItem.currentBid + 1;
      if (amount < minimumBidRequired) {
        socket.emit("bid:rejected", {
          reason: `Bid amount is too low. Minimum required: ₹${minimumBidRequired}`,
          minimumBid: minimumBidRequired,
        });
        return;
      }

      // 4. Persist a candidate bid before atomically claiming the new highest amount.
      const newBid = new Bid({
        roomId: room._id,
        itemId: activeItem._id,
        participantId: participant._id,
        username: participant.username,
        amount,
      });
      await newBid.save();

      // A conditional update prevents concurrent requests from accepting a stale/lower bid.
      const updatedItem = await AuctionItem.findOneAndUpdate(
        {
          _id: activeItem._id,
          status: "active",
          endsAt: { $gt: new Date() },
          currentBid: { $lt: amount },
        },
        {
          $set: {
            currentBid: amount,
            highestBidderId: participant._id,
            highestBidderUsername: participant.username,
          },
        },
        { new: true },
      );

      if (!updatedItem) {
        await Bid.deleteOne({ _id: newBid._id });
        const latestItem = await AuctionItem.findById(activeItem._id);
        const latestMinimumBid = latestItem ? latestItem.currentBid + 1 : 1;
        const reason = latestItem?.endsAt && latestItem.endsAt <= new Date()
          ? "Bidding time has expired for this item."
          : `Bid amount is too low. Minimum required: ₹${latestMinimumBid}`;
        socket.emit("bid:rejected", {
          reason,
          minimumBid: latestMinimumBid,
        });
        return;
      }

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
