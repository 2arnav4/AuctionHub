import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    role: "admin" | "participant";
  };
  sessionToken?: string;
}

/**
 * Required authentication. Rejects the request unless a valid JWT cookie is
 * present, and makes the verified identity the only source of the username.
 *
 * Room creation and joining establish who a participant is for the entire
 * lifetime of an auction, so they must not accept a username supplied in the
 * request body: doing so lets an unauthenticated caller enter a room under any
 * name they choose.
 */
export function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.token;

  if (!token) {
    next(new AppError("You must be signed in to do that.", 401));
    return;
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret) as {
      username: string;
      role: "admin" | "participant";
    };
    next();
  } catch {
    next(new AppError("Your session has expired. Please sign in again.", 401));
  }
}

/**
 * Reads the room-scoped participant session token (issued on room create/join)
 * from request headers and attaches it to req.sessionToken. Does not verify
 * the token against a participant — the service layer looks it up and
 * enforces role checks, matching how every other room-scoped write is done.
 */
export function extractSessionToken(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  const headerToken =
    req.headers["x-session-token"] ?? req.headers["session-token"];
  const authHeader = req.headers["authorization"];

  if (headerToken) {
    req.sessionToken = Array.isArray(headerToken)
      ? headerToken[0]
      : headerToken;
  } else if (
    typeof authHeader === "string" &&
    authHeader.startsWith("Bearer ")
  ) {
    req.sessionToken = authHeader.slice(7);
  }

  next();
}
