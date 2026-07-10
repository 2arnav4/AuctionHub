import { Router } from "express";
import {
  createRoomHandler,
  joinRoomHandler,
  getRoomHandler,
} from "../controllers/room.controller.js";

export const roomRouter = Router();

roomRouter.post("/", createRoomHandler);
roomRouter.post("/:code/join", joinRoomHandler);
roomRouter.get("/:code", getRoomHandler);
