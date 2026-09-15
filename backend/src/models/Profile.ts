import mongoose, { Schema, Document } from "mongoose";

export interface IProfile extends Document {
  userId: string; // Links to Better Auth user ID
  
  // App State
  isCompleted: boolean;
  currentStep: number; // Tracks where they left off for drafts
  
  // Step 2 & 10: Intentions
  intentions: string;
  marriageTimeline: string;
  
  // Step 3: Basic Info
  dateOfBirth: Date;
  gender: string;
  profileCreatedFor: string;
  city: string;
  country: string;
  
  // Step 4: Photos
  photos: string[]; 
  
  // Step 5: About You
  bio: string;
  
  // Step 6: Education
  educationLevel: string;
  college: string;
  
  // Step 7: Profession
  profession: string;
  industry: string;
  annualIncome: string;
  
  // Step 8: Lifestyle
  diet: string;
  smokingHabits: string;
  drinkingHabits: string;
  
  // Step 9: Family Background
  familyType: string;
  familyValues: string;
  fatherOccupation: string;
  motherOccupation: string;
  siblings: number;
  
  // Step 10: Religion & Values
  religion: string;
  sect: string;
  
  // Step 11: Partner Preferences
  partnerAgeRange: { min: number; max: number };
  partnerHeightRange: { min: number; max: number };
  partnerReligion: string[];
  partnerEducation: string[];
}

const ProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    isCompleted: { type: Boolean, default: false },
    currentStep: { type: Number, default: 1 },
    
    intentions: { type: String, default: "" },
    marriageTimeline: { type: String, default: "" },
    
    dateOfBirth: { type: Date },
    gender: { type: String, default: "" },
    profileCreatedFor: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    
    photos: { type: [String], default: [] },
    
    bio: { type: String, default: "" },
    
    educationLevel: { type: String, default: "" },
    college: { type: String, default: "" },
    
    profession: { type: String, default: "" },
    industry: { type: String, default: "" },
    annualIncome: { type: String, default: "" },
    
    diet: { type: String, default: "" },
    smokingHabits: { type: String, default: "" },
    drinkingHabits: { type: String, default: "" },
    
    familyType: { type: String, default: "" },
    familyValues: { type: String, default: "" },
    fatherOccupation: { type: String, default: "" },
    motherOccupation: { type: String, default: "" },
    siblings: { type: Number, default: 0 },
    
    religion: { type: String, default: "" },
    sect: { type: String, default: "" },
    
    partnerAgeRange: { 
      min: { type: Number, default: 18 },
      max: { type: Number, default: 50 }
    },
    partnerHeightRange: { 
      min: { type: Number, default: 140 }, // in cm
      max: { type: Number, default: 200 }
    },
    partnerReligion: { type: [String], default: [] },
    partnerEducation: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const Profile = (mongoose.models.Profile as mongoose.Model<IProfile>) || mongoose.model<IProfile>("Profile", ProfileSchema);
