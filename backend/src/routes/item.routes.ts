import { Router } from "express";
import {
  addItemHandler,
  getItemsHandler,
} from "../controllers/item.controller.js";
import { extractSessionToken } from "../middleware/auth.middleware.js";

// mergeParams is enabled to read :code parameter defined in parent routes mounting path
export const itemRouter = Router({ mergeParams: true });

itemRouter.post("/", extractSessionToken, addItemHandler);
itemRouter.get("/", getItemsHandler);
