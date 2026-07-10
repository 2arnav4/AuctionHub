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
  port: Number(getEnv("PORT", "3001")),
  nodeEnv,
  clientUrl: getEnv("CLIENT_URL", "http://localhost:5173"),
  mongodbUri: getEnv("MONGODB_URI", "mongodb://localhost:27017/auction-room"),
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
