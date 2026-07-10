import { Router } from "express";
import { roomRouter } from "./room.routes.js";

export const apiRouter = Router();

apiRouter.use("/rooms", roomRouter);
