import { Room } from "../models/roomModel.js";
import { Participant } from "../models/participantModel.js";
import { AuctionItem } from "../models/itemModel.js";
import { AppError } from "../middleware/errorHandler.js";

// Mirrored by the input limits on the lobby form. Enforced here as well because
// a maxLength attribute stops a typo, not a crafted request.
const ITEM_NAME_MAX_LENGTH = 80;
const DESCRIPTION_MAX_LENGTH = 300;

/**
 * Creates an auction item in the database.
 * Only the room admin can add items, and only before the auction starts (status: 'lobby').
 */
export async function createAuctionItem(
  roomCode: string,
  sessionToken: string,
  name: string,
  description: string,
  startingBid: number
) {
  if (!roomCode?.trim()) {
    throw new AppError("Room code is required.", 400);
  }
  if (!sessionToken?.trim()) {
    throw new AppError("Authentication token is required.", 401);
  }
  if (!name?.trim()) {
    throw new AppError("Item name is required.", 400);
  }
  if (name.trim().length > ITEM_NAME_MAX_LENGTH) {
    throw new AppError(`Item name must be ${ITEM_NAME_MAX_LENGTH} characters or fewer.`, 400);
  }
  if (description && description.trim().length > DESCRIPTION_MAX_LENGTH) {
    throw new AppError(`Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`, 400);
  }
  if (!Number.isFinite(startingBid) || startingBid <= 0) {
    throw new AppError("Starting bid must be positive.", 400);
  }

  const normalizedCode = roomCode.trim().toUpperCase();

  // 1. Find Room
  const room = await Room.findOne({ code: normalizedCode });
  if (!room) {
    throw new AppError("Room not found.", 404);
  }

  // 2. Validate Room status
  if (room.status !== "lobby") {
    throw new AppError("Cannot add items after the auction has started.", 400);
  }

  // 3. Find Participant and validate role
  const participant = await Participant.findOne({
    roomId: room._id,
    sessionToken,
  });
  if (!participant) {
    throw new AppError("Authentication failed: Participant not registered in this room.", 401);
  }
  if (participant.role !== "admin") {
    throw new AppError("Access denied: Only the room administrator can add auction items.", 403);
  }

  // 4. Create and Save Auction Item
  const newItem = new AuctionItem({
    roomId: room._id,
    name: name.trim(),
    description: description?.trim() || "",
    startingBid,
    // Zero, not startingBid: currentBid means "the highest bid actually placed".
    // Seeding it with the asking price would make the first valid bid one rupee
    // above the advertised figure, so nobody could open at the listed price.
    currentBid: 0,
    status: "pending",
  });
  await newItem.save();

  return newItem;
}

/**
 * Returns all auction items registered in a room.
 */
export async function getAuctionItems(roomCode: string) {
  if (!roomCode?.trim()) {
    throw new AppError("Room code is required.", 400);
  }

  const normalizedCode = roomCode.trim().toUpperCase();
  const room = await Room.findOne({ code: normalizedCode });
  if (!room) {
    throw new AppError("Room not found.", 404);
  }

  const items = await AuctionItem.find({ roomId: room._id }).sort({ createdAt: 1 });
  return items;
}
