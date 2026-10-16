import mongoose from "mongoose";

export interface INotification extends mongoose.Document {
  userId?: mongoose.Types.ObjectId;
  isAdminNotification?: boolean;
  type:
    | "interest_received"
    | "superlike_received"
    | "match"
    | "system"
    | "new_message"
    | "warning"
    | "admin_report"
    | "admin_registration"
    | "admin_subscription";
  title?: string;
  message: string;
  relatedUserId?: mongoose.Types.ObjectId;
  targetUserId?: mongoose.Types.ObjectId;
  link?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    isAdminNotification: { type: Boolean, default: false, index: true },
    type: {
      type: String,
      enum: [
        "interest_received",
        "superlike_received",
        "match",
        "new_message",
        "system",
        "warning",
        "admin_report",
        "admin_registration",
        "admin_subscription",
      ],
      required: true,
    },
    title: { type: String },
    message: { type: String, required: true },
    relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    link: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ isAdminNotification: 1, isRead: 1, createdAt: -1 });

export const Notification =
  (mongoose.models.Notification as mongoose.Model<INotification>) ||
  mongoose.model<INotification>("Notification", notificationSchema);
