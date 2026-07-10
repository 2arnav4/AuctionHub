import mongoose, { Schema, Document } from "mongoose";

export interface IParticipant extends Document {
  roomId: mongoose.Types.ObjectId;
  username: string;
  role: "admin" | "participant";
  sessionToken: string;
  joinedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>({
  roomId: {
    type: Schema.Types.ObjectId,
    ref: "Room",
    required: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ["admin", "participant"],
    default: "participant",
    required: true,
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true,
  },
  joinedAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

// Compound unique index so username is unique within a single room
ParticipantSchema.index({ roomId: 1, username: 1 }, { unique: true });

export const Participant = mongoose.model<IParticipant>(
  "Participant",
  ParticipantSchema
);
