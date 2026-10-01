import mongoose, { Schema, Document } from "mongoose";

export interface IPreference extends Document {
  userId: mongoose.Types.ObjectId;
  prefAgeMin: number;
  prefAgeMax: number;
  prefHeightMin: string;
  prefHeightMax: string;
  prefMaritalStatus: string[];
  prefLocation: string;
  prefEducation: string;
  prefProfession: string;
  prefReligion: string;
  prefSmoking: string;
  prefDrinking: string;
  prefDiet: string;
  prefValues: string[];
  createdAt: Date;
  updatedAt: Date;
}

const preferenceSchema = new Schema<IPreference>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    prefAgeMin: { type: Number },
    prefAgeMax: { type: Number },
    prefHeightMin: { type: String },
    prefHeightMax: { type: String },
    prefMaritalStatus: [{ type: String }],
    prefLocation: { type: String },
    prefEducation: { type: String },
    prefProfession: { type: String },
    prefReligion: { type: String },
    prefSmoking: { type: String },
    prefDrinking: { type: String },
    prefDiet: { type: String },
    prefValues: [{ type: String }],
  },
  { timestamps: true }
);

export const Preference = (mongoose.models.Preference as mongoose.Model<IPreference>) || mongoose.model<IPreference>("Preference", preferenceSchema);
