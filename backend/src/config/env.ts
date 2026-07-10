import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;

  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const env = {
  port: Number(getEnv("PORT", "3001")),
  nodeEnv: getEnv("NODE_ENV", "development"),
  clientUrl: getEnv("CLIENT_URL", "http://localhost:5173"),
  mongodbUri: getEnv("MONGODB_URI", "mongodb://localhost:27017/auction-room"),
  isDevelopment: getEnv("NODE_ENV", "development") === "development",
};
