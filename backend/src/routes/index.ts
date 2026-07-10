import { Router } from "express";
import { roomRouter } from "./room.routes.js";
import { itemRouter } from "./item.routes.js";
import { authRouter } from "./auth.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/rooms", roomRouter);
apiRouter.use("/rooms/:code/items", itemRouter);
