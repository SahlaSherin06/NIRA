import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  type: "interest_received" | "superlike_received" | "match" | "system" | "new_message" | "warning";
  message: string;
  relatedUserId?: mongoose.Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["interest_received", "superlike_received", "match", "new_message", "system", "warning"], required: true },
    message: { type: String, required: true },
    relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", notificationSchema);
