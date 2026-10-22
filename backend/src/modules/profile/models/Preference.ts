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
  prefCaste: string;
  prefSmoking: string;
  prefDrinking: string;
  prefDiet: string;
  prefNationality: string;
  prefChildren: string;
  prefLanguage: string;
  prefMarriagePlans: string;
  prefRelocationPlans: string;
  prefValues: string[];
  savedFilters?: Record<string, any>;
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
    prefCaste: { type: String },
    prefSmoking: { type: String },
    prefDrinking: { type: String },
    prefDiet: { type: String },
    prefNationality: { type: String },
    prefChildren: { type: String },
    prefLanguage: { type: String },
    prefMarriagePlans: { type: String },
    prefRelocationPlans: { type: String },
    prefValues: [{ type: String }],
    savedFilters: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Preference = (mongoose.models.Preference as mongoose.Model<IPreference>) || mongoose.model<IPreference>("Preference", preferenceSchema);


