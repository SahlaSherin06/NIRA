import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; 
  gender?: string;
  createdFor?: string;
  isEmailVerified: boolean;
  isOnboardingComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String, 
    },
    gender: {
      type: String,
    },
    createdFor: {
      type: String,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isOnboardingComplete: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);
