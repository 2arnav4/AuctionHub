import type { Server, Socket } from "socket.io";
import { Room } from "../../models/room.model.js";
import { AuctionItem } from "../../models/item.model.js";

/**
 * Shared progression state machine logic to load the next pending item or complete the auction.
 */
async function progressAuction(io: Server, roomCode: string, roomId: string) {
  const socketRoomId = `room:${roomCode}`;

  // 1. Fetch Room details
  const freshRoom = await Room.findById(roomId);
  if (!freshRoom) {
    console.error(`[Progression] Room not found: ${roomId}`);
    return;
  }

  // 2. Query next pending item
  const pendingItems = await AuctionItem.find({
    roomId: freshRoom._id,
    status: "pending",
  }).sort({ createdAt: 1 });

  if (pendingItems.length > 0) {
    // There are still upcoming items
    const nextItem = pendingItems[0];
    nextItem.status = "active";
    await nextItem.save();

    freshRoom.currentItemId = nextItem._id as any;
    await freshRoom.save();

    // Broadcast item activation
    io.to(socketRoomId).emit("item:activated", {
      item: nextItem,
      startedAt: new Date().toISOString(),
    });

    console.log(`[Progression] Item ${nextItem.name} activated in room ${roomCode}`);
  } else {
    // No items left -> complete the auction
    freshRoom.status = "completed";
    freshRoom.currentItemId = null;
    await freshRoom.save();

    // Broadcast auction completion
    io.to(socketRoomId).emit("auction:completed", {
      room: freshRoom,
    });

    console.log(`[Progression] Room ${roomCode} auction COMPLETED.`);
  }
}

/**
 * Registers Item Resolution (Sell/Unsold) event listeners for a given Socket instance.
 */
export function registerResolutionHandlers(io: Server, socket: Socket): void {
  // Event: item:sell
  socket.on("item:sell", async () => {
    try {
      const participant = socket.data.participant;
      const cachedRoom = socket.data.room;

      if (!participant || !cachedRoom) {
        socket.emit("error", { message: "Not authenticated for any room." });
        return;
      }

      // Fetch fresh room details from database
      const room = await Room.findById(cachedRoom._id);
      if (!room) {
        socket.emit("error", { message: "Room not found." });
        return;
      }

      // 1. Verify user is admin
      if (participant.role !== "admin") {
        socket.emit("error", { message: "Access denied: Only room hosts can resolve items." });
        return;
      }

      // 2. Fetch active item
      if (!room.currentItemId) {
        socket.emit("error", { message: "No active item to sell." });
        return;
      }

      const activeItem = await AuctionItem.findById(room.currentItemId);
      if (!activeItem || activeItem.status !== "active") {
        socket.emit("error", { message: "Item is not currently active." });
        return;
      }

      // 3. Update status to sold
      activeItem.status = "sold";
      await activeItem.save();

      const roomCode = room.code;
      const socketRoomId = `room:${roomCode}`;

      // 4. Broadcast item:ended (sold)
      io.to(socketRoomId).emit("item:ended", {
        item: activeItem,
        resolution: "sold",
      });

      console.log(`Host sold item ${activeItem.name} for ₹${activeItem.currentBid} to user ${activeItem.highestBidderUsername || "none"}`);

      // 5. Progress to next item or end auction
      await progressAuction(io, roomCode, room._id.toString());
    } catch (error) {
      console.error("Error in item:sell handler:", error);
      socket.emit("error", { message: "Internal server error resolving item." });
    }
  });

  // Event: item:unsold
  socket.on("item:unsold", async () => {
    try {
      const participant = socket.data.participant;
      const cachedRoom = socket.data.room;

      if (!participant || !cachedRoom) {
        socket.emit("error", { message: "Not authenticated for any room." });
        return;
      }

      // Fetch fresh room details from database
      const room = await Room.findById(cachedRoom._id);
      if (!room) {
        socket.emit("error", { message: "Room not found." });
        return;
      }

      // 1. Verify user is admin
      if (participant.role !== "admin") {
        socket.emit("error", { message: "Access denied: Only room hosts can resolve items." });
        return;
      }

      // 2. Fetch active item
      if (!room.currentItemId) {
        socket.emit("error", { message: "No active item to mark unsold." });
        return;
      }

      const activeItem = await AuctionItem.findById(room.currentItemId);
      if (!activeItem || activeItem.status !== "active") {
        socket.emit("error", { message: "Item is not currently active." });
        return;
      }

      // 3. Update status to unsold
      activeItem.status = "unsold";
      // Clear highest bidder information
      activeItem.highestBidderId = null;
      activeItem.highestBidderUsername = null;
      await activeItem.save();

      const roomCode = room.code;
      const socketRoomId = `room:${roomCode}`;

      // 4. Broadcast item:ended (unsold)
      io.to(socketRoomId).emit("item:ended", {
        item: activeItem,
        resolution: "unsold",
      });

      console.log(`Host marked item ${activeItem.name} as UNSOLD`);

      // 5. Progress to next item or end auction
      await progressAuction(io, roomCode, room._id.toString());
    } catch (error) {
      console.error("Error in item:unsold handler:", error);
      socket.emit("error", { message: "Internal server error resolving item." });
    }
  });
}
