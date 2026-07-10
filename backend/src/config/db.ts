import mongoose from "mongoose";
import { env } from "./env.js";
import { Participant } from "../models/participant.model.js";

async function migrateParticipantUsernameKeys(): Promise<void> {
  await Participant.collection.updateMany(
    { usernameNormalized: { $exists: false } },
    [{ $set: { usernameNormalized: { $toLower: "$username" } } }],
  );
  await Participant.createIndexes();
}

export async function connectDB(): Promise<void> {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Successfully connected to MongoDB.");
    });

    mongoose.connection.on("error", (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected.");
    });

    await mongoose.connect(env.mongodbUri);
    await migrateParticipantUsernameKeys();
  } catch (error) {
    console.error("Initial MongoDB connection error:", error);
    process.exit(1);
  }
}
