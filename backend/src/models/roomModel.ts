import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  code: string;
  name: string;
  status: "lobby" | "live" | "completed";
  adminParticipantId?: mongoose.Types.ObjectId | null;
  currentItemId?: mongoose.Types.ObjectId | null;
  endsAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      minlength: 6,
      maxlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["lobby", "live", "completed"],
      default: "lobby",
      required: true,
    },
    adminParticipantId: {
      type: Schema.Types.ObjectId,
      ref: "Participant",
      default: null,
    },
    currentItemId: {
      type: Schema.Types.ObjectId,
      ref: "AuctionItem",
      default: null,
    },
    endsAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Room = mongoose.model<IRoom>("Room", RoomSchema);
