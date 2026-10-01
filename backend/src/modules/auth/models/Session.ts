import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string; // We will store the HASH of the refresh token for security
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export const Session = (mongoose.models.Session as mongoose.Model<ISession>) || mongoose.model<ISession>("Session", sessionSchema);
