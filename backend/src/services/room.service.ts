import crypto from "crypto";
import { Room } from "../models/room.model.js";
import { Participant } from "../models/participant.model.js";
import { generateUniqueRoomCode } from "../utils/codeGenerator.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Creates an auction room and sets the creator as the admin participant.
 */
export async function createRoom(username: string, roomName: string) {
  if (!username?.trim()) {
    throw new AppError("Username is required", 400);
  }
  if (!roomName?.trim()) {
    throw new AppError("Room name is required", 400);
  }

  // 1. Generate unique room code
  const code = await generateUniqueRoomCode();

  // 2. Create the room
  const room = new Room({
    code,
    name: roomName.trim(),
    status: "lobby",
  });
  await room.save();

  // 3. Create the admin participant
  const sessionToken = crypto.randomUUID();
  const participant = new Participant({
    roomId: room._id,
    username: username.trim(),
    role: "admin",
    sessionToken,
  });
  await participant.save();

  // 4. Link admin participant id to the room
  room.adminParticipantId = participant._id as any;
  await room.save();

  return {
    room,
    participant,
    sessionToken,
  };
}

/**
 * Adds a participant to an existing auction room if name is not taken.
 */
export async function joinRoom(code: string, username: string) {
  if (!code?.trim()) {
    throw new AppError("Room code is required", 400);
  }
  if (!username?.trim()) {
    throw new AppError("Username is required", 400);
  }

  const normalizedCode = code.trim().toUpperCase();

  // 1. Find room
  const room = await Room.findOne({ code: normalizedCode });
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  if (room.status === "completed") {
    throw new AppError("This auction room has already completed", 400);
  }

  // 2. Verify that username is not already taken in this room (case-insensitive check)
  const existingParticipant = await Participant.findOne({
    roomId: room._id,
    username: { $regex: new RegExp(`^${username.trim()}$`, "i") },
  });
  if (existingParticipant) {
    throw new AppError(`Username "${username}" is already taken in this room`, 400);
  }

  // 3. Create participant
  const sessionToken = crypto.randomUUID();
  const participant = new Participant({
    roomId: room._id,
    username: username.trim(),
    role: "participant",
    sessionToken,
  });
  await participant.save();

  return {
    room,
    participant,
    sessionToken,
  };
}

/**
 * Retrieves public room details by room code.
 */
export async function getRoomByCode(code: string) {
  if (!code?.trim()) {
    throw new AppError("Room code is required", 400);
  }

  const normalizedCode = code.trim().toUpperCase();
  const room = await Room.findOne({ code: normalizedCode });
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  return room;
}
