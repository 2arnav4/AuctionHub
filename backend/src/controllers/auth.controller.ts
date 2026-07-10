import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorHandler.js";

const JWT_SECRET = process.env.JWT_SECRET || "mini-auction-room-jwt-secret-key-123";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false, // Set to true in production if HTTPS is active
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Validates credentials and sets HTTP-only JWT cookie.
 * Supports demo accounts:
 * - Host: admin / password123
 * - Bidder: demo / password123
 * Also supports guest write-in log-ins (no password validation required).
 */
export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username?.trim()) {
      throw new AppError("Username is required.", 400);
    }

    const trimmedUsername = username.trim();
    const isDemoAccount = ["admin", "demo"].includes(trimmedUsername.toLowerCase());

    // 1. Password validation for Demo Accounts
    if (isDemoAccount) {
      if (password !== "password123") {
        throw new AppError("Invalid credentials for demo account. Password is 'password123'.", 401);
      }
    }

    // Determine role (admin maps to room host role, demo maps to participant bidder role)
    const role = trimmedUsername.toLowerCase() === "admin" ? "admin" : "participant";

    // 2. Sign JWT Token
    const token = jwt.sign(
      { username: trimmedUsername, role },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // 3. Set Cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(200).json({
      username: trimmedUsername,
      role,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Clears HTTP-only authentication cookie.
 */
export async function logoutHandler(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "lax" as const,
    });
    res.status(200).json({ message: "Logout successful." });
  } catch (error) {
    next(error);
  }
}

/**
 * Checks active profile details from JWT cookie.
 */
export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies.token;

    if (!token) {
      res.status(200).json({ user: null });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { username: string; role: string };
      res.status(200).json({
        user: {
          username: decoded.username,
          role: decoded.role,
        },
      });
    } catch (err) {
      // Invalid/Expired token -> clear cookie and return null
      res.clearCookie("token", COOKIE_OPTIONS);
      res.status(200).json({ user: null });
    }
  } catch (error) {
    next(error);
  }
}
