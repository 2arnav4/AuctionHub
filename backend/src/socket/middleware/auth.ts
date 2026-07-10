import type { Socket } from "socket.io";
import { Participant } from "../../models/participantModel.js";
import { Room } from "../../models/roomModel.js";

/**
 * Middleware to authenticate and authorize a Socket.IO connection.
 * Validates that the session token exists and matches the specified room.
 */
export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): Promise<void> {
  try {
    const sessionToken = socket.handshake.auth.sessionToken;
    const roomCode = socket.handshake.auth.roomCode;

    if (!sessionToken || !roomCode) {
      return next(new Error("Authentication failed: Missing credentials."));
    }

    // 1. Find participant by sessionToken
    const participant = await Participant.findOne({ sessionToken });
    if (!participant) {
      return next(new Error("Authentication failed: Invalid session token."));
    }

    // 2. Find room by roomCode
    const room = await Room.findById(participant.roomId);
    if (!room || room.code !== roomCode.toUpperCase()) {
      return next(new Error("Authentication failed: Room mismatch."));
    }

    // Attach validated details to the socket metadata block
    socket.data.participant = participant;
    socket.data.room = room;

    next();
  } catch (error) {
    console.error("Socket authentication middleware error:", error);
    next(new Error("Authentication failed: Internal server error."));
  }
}
