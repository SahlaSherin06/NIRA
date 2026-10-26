import { OnboardingDraft } from "../models/OnboardingDraft";
import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response , NextFunction } from "express";
import { Profile } from "../models/Profile";
import { Preference } from "../models/Preference";
import { User } from "../../auth/models/User";
import { uploadToCloudinary } from "../../../config/cloudinary";

// Helper to handle multiple image uploads
const processPhotoUploads = async (mainPhoto: string, galleryPhotos: string[]): Promise<{ main: string, gallery: string[] }> => {
  let finalMainPhoto = mainPhoto;
  let finalGalleryPhotos = [...(galleryPhotos || [])];

  // If the photo is a base64 string, upload it to Cloudinary
  if (mainPhoto && mainPhoto.startsWith("data:image/")) {
    finalMainPhoto = await uploadToCloudinary(mainPhoto);
  }

  // Upload any gallery photos that are base64 strings
  for (let i = 0; i < finalGalleryPhotos.length; i++) {
    const photo = finalGalleryPhotos[i];
    if (photo && typeof photo === 'string' && photo.startsWith("data:image/")) {
      finalGalleryPhotos[i] = await uploadToCloudinary(photo);
    }
  }

  return { main: finalMainPhoto, gallery: finalGalleryPhotos };
};

// POST /api/profile/onboarding
/**
 * Controller: completeOnboarding
 * Handles the final submission of the onboarding process.
 * Uploads base64 images to Cloudinary, upserts the user's Profile and Preference documents,
 * and marks the user's onboarding status as complete.
 * @param req - Express request containing the onboarding payload in req.body
 * @param res - Express response
 */
export const completeOnboarding = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const data = req.body;

    // Check if user has already completed onboarding
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Process photos
    const { main, gallery } = await processPhotoUploads(data.mainPhoto, data.galleryPhotos || []);

    // Upsert Profile
    await Profile.findOneAndUpdate(
      { userId },
      {
        userId,
        // Step 1
        dob: data.dob,
        height: data.height,
        weight: data.weight,
        bloodGroup: data.bloodGroup,
        maritalStatus: data.maritalStatus,
        haveChildren: data.haveChildren,
        numberOfChildren: data.numberOfChildren,
        // Step 2
        nationality: data.nationality,
        grewUpIn: data.grewUpIn,
        city: data.city,
        state: data.state,
        country: data.country,
        religion: data.religion,
        caste: data.caste,
        ethnicity: data.ethnicity,
        motherTongue: data.motherTongue,
        // Step 3
        educationLevel: data.educationLevel,
        profession: data.profession,
        annualIncome: data.annualIncome,
        // Step 4
        diet: data.diet,
        dressingSense: data.dressingSense,
        smoke: data.smoke,
        drink: data.drink,
        // Step 5
        personality: data.personality || [],
        interests: data.interests || [],
        bio: data.bio,
        // Step 6
        whatBringsYouHere: data.whatBringsYouHere,
        knowSomeoneFor: data.knowSomeoneFor,
        marryWithin: data.marryWithin,
        moveAbroad: data.moveAbroad,
        // Step 8
        mainPhoto: main,
        galleryPhotos: gallery,
        photoPrivacy: data.photoPrivacy,
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Upsert Preferences (Step 7)
    await Preference.findOneAndUpdate(
      { userId },
      {
        userId,
        prefAgeMin: data.prefAgeMin,
        prefAgeMax: data.prefAgeMax,
        prefHeightMin: data.prefHeightMin,
        prefHeightMax: data.prefHeightMax,
        prefMaritalStatus: data.prefMaritalStatus || [],
        prefLocation: data.prefLocation,
        prefEducation: data.prefEducation,
        prefProfession: data.prefProfession,
        prefReligion: data.prefReligion,
        prefSmoking: data.prefSmoking,
        prefDrinking: data.prefDrinking,
        prefDiet: data.prefDiet,
        prefValues: data.prefValues || [],
      },
      { upsert: true, returnDocument: 'after' }
    );

    // Update User Onboarding Status
    user.isOnboardingComplete = true;
    await user.save();

    res.status(200).json({
      message: "Onboarding completed successfully!",
      isOnboardingComplete: true
    });
});

// GET /api/profile/me
/**
 * Function: getMyProfile
 * Executes the core operations and logic for get my profile.
 */
export const getMyProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const profile = await Profile.findOne({ userId });
    const preferences = await Preference.findOne({ userId });
    const user = await User.findById(userId).select("-password");

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      user,
      profile,
      preferences
    });
});

// PUT /api/profile/me
/**
 * Function: updateMyProfile
 * Executes the core operations and logic for update my profile.
 */
export const updateMyProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { user, profile, preferences } = req.body;

    if (user) {
      await User.findByIdAndUpdate(userId, user, { returnDocument: 'after' });
    }

    if (profile) {
      if (profile.mainPhoto || profile.galleryPhotos) {
        const { main, gallery } = await processPhotoUploads(profile.mainPhoto, profile.galleryPhotos);
        if (main) profile.mainPhoto = main;
        if (gallery) profile.galleryPhotos = gallery;
      }
      await Profile.findOneAndUpdate({ userId }, profile, { returnDocument: 'after', upsert: true });
    }

    if (preferences) {
      const mappedPref: Record<string, any> = { ...preferences };
      if (preferences.minAge !== undefined) mappedPref.prefAgeMin = preferences.minAge;
      if (preferences.maxAge !== undefined) mappedPref.prefAgeMax = preferences.maxAge;
      if (preferences.location !== undefined) mappedPref.prefLocation = preferences.location;
      if (preferences.religion !== undefined) mappedPref.prefReligion = preferences.religion;
      if (preferences.caste !== undefined) mappedPref.prefCaste = preferences.caste;
      if (preferences.diet !== undefined) mappedPref.prefDiet = preferences.diet;
      if (preferences.smoking !== undefined) mappedPref.prefSmoking = preferences.smoking;
      if (preferences.drinking !== undefined) mappedPref.prefDrinking = preferences.drinking;
      if (preferences.education !== undefined) mappedPref.prefEducation = preferences.education;
      if (preferences.profession !== undefined) mappedPref.prefProfession = preferences.profession;
      if (preferences.maritalStatus !== undefined) mappedPref.prefMaritalStatus = Array.isArray(preferences.maritalStatus) ? preferences.maritalStatus : [preferences.maritalStatus];
      if (preferences.nationality !== undefined) mappedPref.prefNationality = preferences.nationality;
      if (preferences.children !== undefined) mappedPref.prefChildren = preferences.children;
      if (preferences.language !== undefined) mappedPref.prefLanguage = preferences.language;
      if (preferences.height !== undefined) mappedPref.prefHeightMin = preferences.height;
      if (preferences.marriagePlans !== undefined) mappedPref.prefMarriagePlans = preferences.marriagePlans;
      if (preferences.relocationPlans !== undefined) mappedPref.prefRelocationPlans = preferences.relocationPlans;
      mappedPref.savedFilters = preferences.savedFilters || preferences;

      await Preference.findOneAndUpdate({ userId }, { $set: { ...mappedPref, userId } }, { returnDocument: 'after', upsert: true });
    }

    // Clean up draft once onboarding is completed
    await OnboardingDraft.deleteOne({ userId });

    res.status(200).json({ message: "Profile updated successfully" });
});





/**
 * Function: saveDraft
 * Saves the current onboarding step and data for the user.
 */
export const saveDraft = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { step, data } = req.body;
  
  await OnboardingDraft.findOneAndUpdate(
    { userId },
    { step, data },
    { upsert: true, new: true }
  );

  res.status(200).json({ message: "Draft saved successfully" });
});

/**
 * Function: getDraft
 * Fetches the user's onboarding draft.
 */
export const getDraft = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.userId;
  if (!userId) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const draft = await OnboardingDraft.findOne({ userId });
  if (!draft) {
    res.status(404).json({ message: "No draft found" });
    return;
  }

  res.status(200).json(draft);
});


