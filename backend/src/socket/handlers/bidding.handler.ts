import type { Server, Socket } from "socket.io";
import { AuctionItem } from "../../models/item.model.js";
import { Bid } from "../../models/bid.model.js";

/**
 * Registers Bidding-related event listeners for a given Socket instance.
 */
export function registerBiddingHandlers(io: Server, socket: Socket): void {
  // Event: bid:place
  socket.on("bid:place", async (data: { amount: number }) => {
    try {
      const participant = socket.data.participant;
      const room = socket.data.room;

      if (!participant || !room) {
        socket.emit("bid:rejected", {
          reason: "Not authenticated for any room.",
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

      // 3. Validate bid amount (must be strictly higher than current bid)
      const currentHighestBid = activeItem.currentBid;
      const minimumBidRequired = currentHighestBid + 1;

      if (data.amount < minimumBidRequired) {
        socket.emit("bid:rejected", {
          reason: `Bid amount is too low. Minimum required: ₹${minimumBidRequired}`,
          minimumBid: minimumBidRequired,
        });
        return;
      }

      // 4. Create and Save Bid
      const newBid = new Bid({
        roomId: room._id,
        itemId: activeItem._id,
        participantId: participant._id,
        username: participant.username,
        amount: data.amount,
      });
      await newBid.save();

      // 5. Update active item details
      activeItem.currentBid = data.amount;
      activeItem.highestBidderId = participant._id as any;
      activeItem.highestBidderUsername = participant.username;
      await activeItem.save();

      // 6. Broadcast successful bid
      io.to(socketRoomId).emit("bid:accepted", {
        bid: newBid,
        item: activeItem,
      });

      console.log(`Bid of ₹${data.amount} placed by ${participant.username} on item ${activeItem.name}`);
    } catch (error) {
      console.error("Error in bid:place handler:", error);
      socket.emit("bid:rejected", {
        reason: "Internal server error placing bid.",
        minimumBid: 1,
      });
    }
  });
}
