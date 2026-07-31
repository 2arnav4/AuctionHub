import mongoose from "mongoose";
import { env } from "./env.js";
import { Participant } from "../models/participantModel.js";

const INITIAL_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 30_000;
const SERVER_SELECTION_TIMEOUT_MS = 10_000;

// Fail a buffered query in 5s instead of Mongoose's 10s default, so requests
// that slip past the readiness guard surface an error quickly.
mongoose.set("bufferTimeoutMS", 5_000);

export type DatabaseStatus =
  | "connected"
  | "connecting"
  | "disconnecting"
  | "disconnected";

const READY_STATE_LABELS: Record<number, DatabaseStatus> = {
  0: "disconnected",
  1: "connected",
  2: "connecting",
  3: "disconnecting",
};

export function getDatabaseStatus(): DatabaseStatus {
  return READY_STATE_LABELS[mongoose.connection.readyState] ?? "disconnected";
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function migrateParticipantUsernameKeys(): Promise<void> {
  await Participant.collection.updateMany(
    { usernameNormalized: { $exists: false } },
    [{ $set: { usernameNormalized: { $toLower: "$username" } } }],
  );
  await Participant.createIndexes();
}

function registerConnectionLogging(): void {
  mongoose.connection.on("connected", () => {
    console.log("Successfully connected to MongoDB.");
  });

  mongoose.connection.on("error", (err: Error) => {
    console.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Mongoose will reconnect automatically.");
  });
}

/**
 * Connects to MongoDB in the background, retrying with exponential backoff until
 * the first connection succeeds. Resolves once the database is usable.
 *
 * This never rejects and never exits the process: an unreachable database must
 * degrade the API, not prevent the HTTP server from binding its port. Mongoose
 * handles reconnection on its own after this initial connection is established,
 * so the retry loop only covers cold start.
 */
export async function connectDB(): Promise<void> {
  registerConnectionLogging();

  let delay = INITIAL_RETRY_DELAY_MS;

  for (let attempt = 1; ; attempt += 1) {
    try {
      await mongoose.connect(env.mongodbUri, {
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
        // Overrides any database segment in the URI, so the target is the same
        // whichever connection string is supplied.
        dbName: env.mongodbDbName,
      });
      await migrateParticipantUsernameKeys();
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `MongoDB connection attempt ${attempt} failed (${message}). ` +
          `Retrying in ${Math.round(delay / 1000)}s.`,
      );

      await sleep(delay);
      delay = Math.min(delay * 2, MAX_RETRY_DELAY_MS);
    }
  }
}
