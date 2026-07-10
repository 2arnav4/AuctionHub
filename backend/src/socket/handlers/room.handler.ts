import type { Server, Socket } from "socket.io";
import { Participant } from "../../models/participant.model.js";

/**
 * Registers Room-related event listeners for a given Socket instance.
 */
export function registerRoomHandlers(io: Server, socket: Socket): void {
  // Event: room:connect
  socket.on("room:connect", async () => {
    try {
      const participant = socket.data.participant;
      const room = socket.data.room;

      if (!participant || !room) {
        socket.emit("error", { message: "Not authenticated for any room." });
        return;
      }

      const roomCode = room.code;
      const socketRoomId = `room:${roomCode}`;

      // Join the Socket.IO room channel
      socket.join(socketRoomId);

      // Update connection status in MongoDB
      participant.isConnected = true;
      await participant.save();

      // Retrieve all participants of this room
      const participants = await Participant.find({ roomId: room._id }).select(
        "-sessionToken" // Hide sensitive session tokens
      );

      // Emit room:state to the current client
      socket.emit("room:state", {
        room,
        participants,
      });

      // Broadcast participant:joined to other clients in the room
      // To hide session token, construct clean participant object
      const cleanParticipant = {
        _id: participant._id,
        roomId: participant.roomId,
        username: participant.username,
        role: participant.role,
        isConnected: true,
        joinedAt: participant.joinedAt,
      };

      socket.to(socketRoomId).emit("participant:joined", {
        participant: cleanParticipant,
      });

      console.log(`User ${participant.username} connected to auction room ${roomCode}`);
    } catch (error) {
      console.error("Error in room:connect handler:", error);
      socket.emit("error", { message: "Internal server error during room connect." });
    }
  });

  // Event: disconnect
  socket.on("disconnect", async () => {
    try {
      const participant = socket.data.participant;
      const room = socket.data.room;

      if (!participant || !room) return;

      const roomCode = room.code;
      const socketRoomId = `room:${roomCode}`;

      // Update connection status in MongoDB
      participant.isConnected = false;
      await participant.save();

      // Broadcast participant:left to other clients in the room
      const cleanParticipant = {
        _id: participant._id,
        roomId: participant.roomId,
        username: participant.username,
        role: participant.role,
        isConnected: false,
        joinedAt: participant.joinedAt,
      };

      io.to(socketRoomId).emit("participant:left", {
        participant: cleanParticipant,
      });

      console.log(`User ${participant.username} disconnected from auction room ${roomCode}`);
    } catch (error) {
      console.error("Error in disconnect handler:", error);
    }
  });
}
