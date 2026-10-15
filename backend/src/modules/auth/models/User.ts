import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; 
  gender?: string;
  createdFor?: string;
  isEmailVerified: boolean;
  isOnboardingComplete: boolean;
  isPhotoBlurred: boolean;
  role: 'user' | 'admin';
  isBanned?: boolean;
  warningsCount?: number;
  warningNotes?: Array<{
    message: string;
    date: Date;
  }>;
  subscription: {
    plan: 'free' | 'premium';
    duration?: '1_month' | '3_months' | '6_months' | 'lifetime';
    amountPaid?: number;
    expiresAt?: Date;
    startDate?: Date;
    source?: 'razorpay' | 'admin_grant' | 'dev_mode';
    adminNote?: string;
    razorpayCustomerId?: string;
    razorpayPaymentId?: string;
  };
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
    isPhotoBlurred: {
      type: Boolean,
      default: false,
    },
      isOnboardingComplete: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    warningsCount: {
      type: Number,
      default: 0,
    },
    warningNotes: [
      {
        message: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    subscription: {
      plan: { type: String, enum: ['free', 'premium'], default: 'free' },
      duration: { type: String, enum: ['1_month', '3_months', '6_months', 'lifetime'] },
      amountPaid: { type: Number },
      expiresAt: { type: Date },
      startDate: { type: Date },
      source: { type: String, enum: ['razorpay', 'admin_grant', 'dev_mode'], default: 'admin_grant' },
      adminNote: { type: String },
      razorpayCustomerId: { type: String },
      razorpayPaymentId: { type: String }
    }
  },
  { timestamps: true }
);

userSchema.index({ gender: 1 });
export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>("User", userSchema);

