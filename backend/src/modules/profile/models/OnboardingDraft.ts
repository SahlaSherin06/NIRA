import mongoose, { Document, Schema } from "mongoose";

export interface IOnboardingDraft extends Document {
  userId: mongoose.Types.ObjectId;
  step: number;
  data: any;
}

const OnboardingDraftSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    step: {
      type: Number,
      default: 1,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const OnboardingDraft = (mongoose.models.OnboardingDraft as mongoose.Model<IOnboardingDraft>) || mongoose.model<IOnboardingDraft>("OnboardingDraft", OnboardingDraftSchema);
