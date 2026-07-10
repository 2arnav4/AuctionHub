import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mini-auction-room-jwt-secret-key-123";

export interface AuthenticatedRequest extends Request {
  user?: {
    username: string;
    role: "admin" | "participant";
  };
}

/**
 * Optional authentication middleware.
 * If a JWT token cookie is present, verifies it and populates req.user.
 * Does not block the request if authentication is missing.
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = req.cookies.token;

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
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
