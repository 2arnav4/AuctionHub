import { Router } from "express";
import { roomRouter } from "./room.routes.js";
import { itemRouter } from "./item.routes.js";

export const apiRouter = Router();

apiRouter.use("/rooms", roomRouter);
apiRouter.use("/rooms/:code/items", itemRouter);
