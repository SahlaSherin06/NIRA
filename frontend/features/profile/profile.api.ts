import { api } from "@/lib/axios";

export interface MyProfileResponse {
  user: {
    _id: string;
    name: string;
    email: string;
    gender: string;
    phone: string;
    isOnboardingComplete: boolean;
  };
  profile: {
    dob: string;
    height: number;
    weight: number;
    bloodGroup: string;
    maritalStatus: string;
    haveChildren: string;
    numberOfChildren: number;
    nationality: string;
    grewUpIn: string;
    city: string;
    state: string;
    country: string;
    religion: string;
    caste: string;
    ethnicity: string;
    motherTongue: string;
    educationLevel: string;
    profession: string;
    income: string;
    diet: string;
    smoke: string;
    drink: string;
    bio: string;
    interests?: string[];
    personality?: string[];
    mainPhoto?: string;
    galleryPhotos?: string[];
    photoPrivacy?: "Public" | "Blurred";
    moveAbroad?: string;
  };
  preferences: {
    prefAgeMin: number;
    prefAgeMax: number;
    prefReligion: string;
    prefMaritalStatus: string[];
    prefEducation: string;
    prefSmoking: string;
    prefDrinking: string;
  };
}

/**
 * Function: fetchMyProfile
 * Executes the core operations and logic for fetch my profile.
 */
export const fetchMyProfile = async (): Promise<MyProfileResponse> => {
  const res = await api.get("/profile/me");
  return res.data;
};

/**
 * Function: updateMyProfileApi
 * Executes the core operations and logic for update my profile api.
 */
export const updateMyProfileApi = async (data: Partial<MyProfileResponse>) => {
  const res = await api.put("/profile/me", data);
  return res.data;
};

