import { Router } from "express";
import {
  createRoomHandler,
  joinRoomHandler,
  getRoomHandler,
  getRoomResultsHandler,
} from "../controllers/room.controller.js";
import { optionalAuth } from "../middleware/auth.middleware.js";

export const roomRouter = Router();

roomRouter.post("/", optionalAuth, createRoomHandler);
roomRouter.post("/:code/join", optionalAuth, joinRoomHandler);
roomRouter.get("/:code", getRoomHandler);
roomRouter.get("/:code/results", getRoomResultsHandler);
