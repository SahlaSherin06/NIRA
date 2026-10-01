import mongoose, { Schema, Document } from "mongoose";

export interface IAccount extends Document {
  userId: mongoose.Types.ObjectId;
  provider: string; // 'google' or 'email'
  providerAccountId: string; // Google ID or Email Address
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ["google", "email"],
    },
    providerAccountId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Account = (mongoose.models.Account as mongoose.Model<IAccount>) || mongoose.model<IAccount>("Account", accountSchema);
