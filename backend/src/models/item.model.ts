import mongoose, { Schema, Document } from "mongoose";

export interface IAuctionItem extends Document {
  roomId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  startingBid: number;
  status: "pending" | "active" | "sold" | "unsold";
  createdAt: Date;
  updatedAt: Date;
}

const AuctionItemSchema = new Schema<IAuctionItem>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    startingBid: {
      type: Number,
      required: true,
      min: [0.01, "Starting bid must be positive."],
    },
    status: {
      type: String,
      enum: ["pending", "active", "sold", "unsold"],
      default: "pending",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AuctionItem = mongoose.model<IAuctionItem>(
  "AuctionItem",
  AuctionItemSchema
);
