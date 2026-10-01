import mongoose, { Schema, Document } from "mongoose";

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  // Step 1
  dob: Date;
  height: string;
  weight: string;
  bloodGroup: string;
  maritalStatus: string;
  haveChildren: string;
  numberOfChildren: string;
  // Step 2
  nationality: string;
  grewUpIn: string;
  city: string;
  state: string;
  country: string;
  religion: string;
  caste: string;
  ethnicity: string;
  motherTongue: string;
  // Step 3
  educationLevel: string;
  profession: string;
  annualIncome: string;
  // Step 4
  diet: string;
  dressingSense: string;
  smoke: string;
  drink: string;
  // Step 5
  personality: string[];
  interests: string[];
  bio: string;
  // Step 6
  whatBringsYouHere: string;
  knowSomeoneFor: string;
  marryWithin: string;
  moveAbroad: string;
  // Step 8
  mainPhoto: string;
  galleryPhotos: string[];
  photoPrivacy: string;
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    
    // Step 1
    dob: { type: Date },
    height: { type: String },
    weight: { type: String },
    bloodGroup: { type: String },
    maritalStatus: { type: String },
    haveChildren: { type: String },
    numberOfChildren: { type: String },
    
    // Step 2
    nationality: { type: String },
    grewUpIn: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    religion: { type: String },
    caste: { type: String },
    ethnicity: { type: String },
    motherTongue: { type: String },
    
    // Step 3
    educationLevel: { type: String },
    profession: { type: String },
    annualIncome: { type: String },
    
    // Step 4
    diet: { type: String },
    dressingSense: { type: String },
    smoke: { type: String },
    drink: { type: String },
    
    // Step 5
    personality: [{ type: String }],
    interests: [{ type: String }],
    bio: { type: String },
    
    // Step 6
    whatBringsYouHere: { type: String },
    knowSomeoneFor: { type: String },
    marryWithin: { type: String },
    moveAbroad: { type: String },
    
    // Step 8
    mainPhoto: { type: String },
    galleryPhotos: [{ type: String }],
    photoPrivacy: { type: String },
  },
  { timestamps: true }
);

export const Profile = (mongoose.models.Profile as mongoose.Model<IProfile>) || mongoose.model<IProfile>("Profile", profileSchema);
