import type { Request, Response, NextFunction } from "express";
import * as roomService from "../services/room.service.js";

/**
 * Handles room creation requests.
 * POST /api/rooms
 */
export async function createRoomHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, roomName } = req.body;
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
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const code = req.params.code as string;
    const { username } = req.body;
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
