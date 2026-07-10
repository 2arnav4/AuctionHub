import type { Request, Response, NextFunction } from "express";
import * as itemService from "../services/item.service.js";

/**
 * Handles registering a new auction item.
 * POST /api/rooms/:code/items
 */
export async function addItemHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const code = req.params.code as string;
    const { name, description, startingBid } = req.body;

    // Extract authorization session token from standard headers
    let sessionToken = req.headers["x-session-token"] || req.headers["session-token"];
    
    if (!sessionToken && req.headers["authorization"]) {
      const authHeader = req.headers["authorization"] as string;
      if (authHeader.startsWith("Bearer ")) {
        sessionToken = authHeader.substring(7);
      }
    }

    const newItem = await itemService.createAuctionItem(
      code,
      sessionToken as string,
      name,
      description,
      Number(startingBid)
    );

    // Retrieve global Socket.IO instance and broadcast event
    const io = req.app.get("io");
    if (io) {
      const roomCode = code.toUpperCase();
      const socketRoomId = `room:${roomCode}`;
      
      io.to(socketRoomId).emit("item:added", {
        item: newItem,
      });
      console.log(`Realtime broadcast 'item:added' sent to channel ${socketRoomId} for item: ${newItem.name}`);
    }

    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
}

/**
 * Handles fetching all auction items for a room.
 * GET /api/rooms/:code/items
 */
export async function getItemsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const code = req.params.code as string;
    const items = await itemService.getAuctionItems(code);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
}
