import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { AppError } from "../middleware/errorHandler.js";
import { env } from "../config/env.js";
import { User } from "../models/userModel.js";

const isProd = env.nodeEnv === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax" | "strict" | undefined,
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

let demoCounter = 0;

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

/**
 * Validates credentials and sets HTTP-only JWT cookie.
 * Supports demo accounts:
 * - Host: admin / password123
 * - Bidder: demo / password123
 * Also supports registered users (validating password) and guest write-in log-ins (no password validation required).
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
    const normalizedUsername = trimmedUsername.toLowerCase();

    let finalUsername = trimmedUsername;
    let role: "admin" | "participant" = "participant";

    if (normalizedUsername === "admin") {
      if (password !== "password123") {
        throw new AppError("Invalid credentials for admin account. Password is 'password123'.", 401);
      }
      role = "admin";
    } else if (normalizedUsername === "demo") {
      if (password !== "password123") {
        throw new AppError("Invalid credentials for demo account. Password is 'password123'.", 401);
      }
      demoCounter++;
      finalUsername = `demo_${demoCounter}`;
      role = "participant";
    } else {
      // Check if user exists in the registered users DB
      const user = await User.findOne({ usernameNormalized: normalizedUsername });
      if (user) {
        if (!password) {
          throw new AppError("Password is required for this registered account.", 400);
        }
        const checkHash = hashPassword(password, user.salt);
        if (checkHash !== user.passwordHash) {
          throw new AppError("Invalid password.", 401);
        }
        finalUsername = user.username;
        role = "participant";
      } else {
        // If not registered, allow guest write-in log-ins (no password validation required)
        role = "participant";
      }
    }

    // Sign JWT Token
    const token = jwt.sign(
      { username: finalUsername, role },
      env.jwtSecret,
      { expiresIn: "24h" }
    );

    // Set Cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(200).json({
      username: finalUsername,
      role,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Registers a new user and sets HTTP-only JWT cookie (auto-login).
 */
export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username?.trim()) {
      throw new AppError("Username is required.", 400);
    }
    if (!password) {
      throw new AppError("Password is required.", 400);
    }

    const trimmedUsername = username.trim();
    const normalizedUsername = trimmedUsername.toLowerCase();

    // Prevent registering with reserved names
    if (normalizedUsername === "admin" || normalizedUsername.startsWith("demo")) {
      throw new AppError("Username is reserved and cannot be registered.", 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ usernameNormalized: normalizedUsername });
    if (existingUser) {
      throw new AppError("Username is already registered. Please choose another or sign in.", 400);
    }

    // Hash password
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    // Create user
    const user = new User({
      username: trimmedUsername,
      usernameNormalized: normalizedUsername,
      passwordHash,
      salt,
    });
    await user.save();

    // Auto-login (Sign JWT Token)
    const role = "participant";
    const token = jwt.sign(
      { username: trimmedUsername, role },
      env.jwtSecret,
      { expiresIn: "24h" }
    );

    // Set Cookie
    res.cookie("token", token, COOKIE_OPTIONS);

    res.status(201).json({
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
      secure: isProd,
      sameSite: (isProd ? "none" : "lax") as "none" | "lax" | "strict" | undefined,
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
      const decoded = jwt.verify(token, env.jwtSecret) as { username: string; role: string };
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
