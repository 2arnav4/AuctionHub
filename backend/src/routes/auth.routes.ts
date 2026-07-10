import { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  meHandler,
  registerHandler,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/login", loginHandler);
authRouter.post("/register", registerHandler);
authRouter.post("/logout", logoutHandler);
authRouter.get("/me", meHandler);
