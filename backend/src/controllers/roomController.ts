import type { Request, Response, NextFunction } from "express";
import * as roomService from "../services/roomService.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

/**
 * Handles room creation requests.
 * POST /api/rooms
 */
export async function createRoomHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { roomName } = req.body;
    // requireAuth guarantees this; the body is deliberately not consulted.
    const username = req.user?.username ?? "";
    const result = await roomService.createRoom(username, roomName);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Handles requests for joining a room.
 * POST /api/rooms/:code/join
 */
export async function joinRoomHandler(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const code = req.params.code as string;
    // requireAuth guarantees this; the body is deliberately not consulted.
    const username = req.user?.username ?? "";
    const result = await roomService.joinRoom(code, username);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Handles room lookup requests.
 * GET /api/rooms/:code
 */
export async function getRoomHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const code = req.params.code as string;
    const room = await roomService.getRoomByCode(code);
    res.status(200).json(room);
  } catch (error) {
    next(error);
  }
}

/**
 * Handles fetching results for a room.
 * GET /api/rooms/:code/results
 */
export async function getRoomResultsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const code = req.params.code as string;
    const results = await roomService.getRoomResults(code);
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
}
