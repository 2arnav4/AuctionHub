import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

function getPositiveInteger(key: string, fallback: string): number {
  const value = Number(getEnv(key, fallback));
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer.`);
  }
  return value;
}

const nodeEnv = getEnv("NODE_ENV", "development");

export const env = {
  port: getPositiveInteger("PORT", "3001"),
  nodeEnv,
  clientUrl: getEnv("CLIENT_URL", "http://localhost:5173"),
  mongodbUri: getEnv("MONGODB_URI", "mongodb://localhost:27017/auction-room"),
  // Set explicitly rather than inferred from the URI path. A connection string
  // without a database segment makes Mongoose silently fall back to "test",
  // which is how production data ends up somewhere nobody intended. Naming it
  // here means the database is a property of the application, not of whatever
  // string happens to be pasted into a hosting dashboard.
  mongodbDbName: getEnv("MONGODB_DB_NAME", "auction"),
  auctionItemDurationSeconds: getPositiveInteger("AUCTION_ITEM_DURATION_SECONDS", "60"),
  jwtSecret:
    process.env.JWT_SECRET ??
    (nodeEnv === "production"
      ? (() => {
          throw new Error("Missing required environment variable: JWT_SECRET");
        })()
      : "development-only-jwt-secret-change-me"),
  isDevelopment: nodeEnv === "development",
};
