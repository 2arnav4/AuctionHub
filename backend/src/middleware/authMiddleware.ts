import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    role: "admin" | "participant";
  };
  sessionToken?: string;
}

/**
 * Optional authentication middleware.
 * If a JWT token cookie is present, verifies it and populates req.user.
 * Does not block the request if authentication is missing.
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as {
        username: string;
        role: "admin" | "participant";
      };
      req.user = decoded;
    } catch (err) {
      // Stale or invalid cookie -> ignore and continue
    }
    next();
  } catch (error) {
    next(error);
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
