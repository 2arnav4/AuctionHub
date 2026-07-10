import type { Server, Socket } from "socket.io";
import { Room } from "../../models/roomModel.js";
import { AuctionItem } from "../../models/itemModel.js";
import { env } from "../../config/env.js";
import { scheduleAuctionTimer } from "./resolutionHandler.js";
import { getAuctionEndsAt } from "../../utils/auction.js";

/**
 * Registers Auction-related event listeners for a given Socket instance.
 */
export function registerAuctionHandlers(io: Server, socket: Socket): void {
  // Event: auction:start
  socket.on("auction:start", async () => {
    try {
      const participant = socket.data.participant;
      const room = socket.data.room;

      if (!participant || !room) {
        socket.emit("error", { message: "Not authenticated for any room." });
        return;
      }

      // 1. Verify user is admin
      if (participant.role !== "admin") {
        socket.emit("error", { message: "Access denied: Only the room administrator can start the auction." });
        return;
      }

      // 2. Fetch fresh Room document and verify status
      const freshRoom = await Room.findById(room._id);
      if (!freshRoom) {
        socket.emit("error", { message: "Room not found." });
        return;
      }

      if (freshRoom.status !== "lobby") {
        socket.emit("error", { message: "Auction has already started or completed." });
        return;
      }

      // 3. Select first pending item
      const pendingItems = await AuctionItem.find({
        roomId: freshRoom._id,
        status: "pending",
      }).sort({ createdAt: 1 });

      if (pendingItems.length === 0) {
        socket.emit("error", { message: "Cannot start auction: At least one upcoming item is required." });
        return;
      }

      const activeItem = pendingItems[0];
      const startedAt = new Date();
      const endsAt = getAuctionEndsAt(startedAt.getTime(), env.auctionItemDurationSeconds);

      // 4. Update item status to active
      activeItem.status = "active";
      activeItem.endsAt = endsAt;
      await activeItem.save();

      // 5. Update room status to live and link currentItemId
      freshRoom.status = "live";
      freshRoom.currentItemId = activeItem._id;
      freshRoom.endsAt = endsAt;
      await freshRoom.save();

      // Keep cached room reference inside socket.data in sync
      socket.data.room = freshRoom;

      const roomCode = freshRoom.code;
      const socketRoomId = `room:${roomCode}`;
      scheduleAuctionTimer(io, freshRoom._id.toString(), endsAt);

      // 6. Broadcast event: auction:started
      io.to(socketRoomId).emit("auction:started", {
        room: freshRoom,
      });

      // 7. Broadcast event: item:activated
      io.to(socketRoomId).emit("item:activated", {
        item: activeItem,
        startedAt: startedAt.toISOString(),
        endsAt: endsAt.toISOString(),
      });

      console.log(`Lobby ${roomCode} transitioned to LIVE. Active item: ${activeItem.name}`);
    } catch (error) {
      console.error("Error in auction:start handler:", error);
      socket.emit("error", { message: "Internal server error starting the auction." });
    }
  });
}
