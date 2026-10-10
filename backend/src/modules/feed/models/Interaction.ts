import mongoose, { Document, Schema } from "mongoose";

export interface IInteraction extends Document {
  actorId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  action: "like" | "superlike" | "pass" | "block" | "favorite" | "report";
  reason?: string;
  createdAt: Date;
}

const InteractionSchema = new Schema<IInteraction>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: {
      type: String,
      enum: ["like", "superlike", "pass", "block", "favorite", "report"],
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Compound index to quickly find if a user already interacted with a target
InteractionSchema.index({ actorId: 1, targetId: 1 }, { unique: true });

export const Interaction = (mongoose.models.Interaction as mongoose.Model<IInteraction>) || mongoose.model<IInteraction>("Interaction", InteractionSchema);

