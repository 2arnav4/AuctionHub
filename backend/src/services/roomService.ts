import crypto from "crypto";
import { Room } from "../models/roomModel.js";
import { Participant } from "../models/participantModel.js";
import { AuctionItem } from "../models/itemModel.js";
import { generateUniqueRoomCode } from "../utils/codeGenerator.js";
import { AppError } from "../middleware/errorHandler.js";
import { env } from "../config/env.js";

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

/**
 * Creates an auction room and sets the creator as the admin participant.
 */
export async function createRoom(
  username: string,
  roomName: string,
  startingBudget?: number,
) {
  if (!username?.trim()) {
    throw new AppError("Username is required", 400);
  }
  if (!roomName?.trim()) {
    throw new AppError("Room name is required", 400);
  }

  const budget = startingBudget ?? env.defaultStartingBudget;
  if (!Number.isFinite(budget) || budget <= 0) {
    throw new AppError("Starting budget must be a positive number.", 400);
  }

  // 1. Generate unique room code
  const code = await generateUniqueRoomCode();

  // 2. Create the room
  const room = new Room({
    code,
    name: roomName.trim(),
    status: "lobby",
    startingBudget: budget,
  });
  await room.save();

  // 3. Create the admin participant. The host is given a purse too so the
  // record is uniform, but it is never spent — hosts cannot bid.
  const sessionToken = crypto.randomUUID();
  const participant = new Participant({
    roomId: room._id,
    username: username.trim(),
    usernameNormalized: username.trim().toLowerCase(),
    role: "admin",
    sessionToken,
    budget,
    spent: 0,
  });
  await participant.save();

  // 4. Link admin participant id to the room
  room.adminParticipantId = participant._id;
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

  const normalizedUsername = username.trim().toLowerCase();

  // 2. Verify that username is not already taken in this room.
  const existingParticipant = await Participant.findOne({
    roomId: room._id,
    usernameNormalized: normalizedUsername,
  });
  if (existingParticipant) {
    throw new AppError(`Username "${username}" is already taken in this room`, 400);
  }

  // 3. Create participant
  const sessionToken = crypto.randomUUID();
  const participant = new Participant({
    roomId: room._id,
    username: username.trim(),
    usernameNormalized: normalizedUsername,
    role: "participant",
    sessionToken,
    // Copied, not referenced: a bidder's purse is fixed at the moment they join.
    budget: room.startingBudget,
    spent: 0,
  });

  // The check above is a read-then-write race: two joins claiming the same name
  // can both pass it. The compound unique index is the real guard, so translate
  // its duplicate-key error into the message the pre-check would have produced
  // rather than letting a generic conflict reach the client.
  try {
    await participant.save();
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new AppError(`Username "${username.trim()}" is already taken in this room`, 409);
    }
    throw error;
  }

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

/**
 * Retrieves resolved auction items (sold/unsold) for results presentation.
 */
export async function getRoomResults(code: string) {
  if (!code?.trim()) {
    throw new AppError("Room code is required", 400);
  }

  const normalizedCode = code.trim().toUpperCase();
  const room = await Room.findOne({ code: normalizedCode });
  if (!room) {
    throw new AppError("Room not found", 404);
  }

  // Retrieve items that are resolved (sold or unsold)
  const items = await AuctionItem.find({
    roomId: room._id,
    status: { $in: ["sold", "unsold"] },
  }).sort({ updatedAt: 1 });

  return items;
}
