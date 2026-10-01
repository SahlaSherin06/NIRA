import { Request, Response } from "express";
import { User } from "../../auth/models/User";
import { Preference } from "../../profile/models/Preference";
import { Interaction } from "../models/Interaction";

// GET /api/feed/recommendations
/**
 * Function: getRecommendations
 * Executes the core operations and logic for get recommendations.
 */
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // 1. Get the current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 2. Get current user's preferences
    const prefs = await Preference.findOne({ userId });
    
    // Determine target gender (simplified: opposite gender)
    const userGender = currentUser.gender?.toLowerCase() || 'male';
    const targetGender = userGender === 'male' ? 'female' : 'male';

    // 3. Find IDs of users we've already interacted with (liked, passed, blocked, etc)
    const pastInteractions = await Interaction.find({ actorId: userId });
    const excludedIds = pastInteractions.map(i => i.targetId);
    excludedIds.push(currentUser._id); // Exclude self

    // 4. Build strict Aggregation Pipeline matching User Preferences
    
    // Calculate Date range for Age Preferences
    const today = new Date();
    // Min age means born AT MOST (today - minAge) years ago
    const maxDob = new Date();
    maxDob.setFullYear(today.getFullYear() - (prefs?.prefAgeMin || 18));
    
    // Max age means born AT LEAST (today - maxAge) years ago
    const minDob = new Date();
    minDob.setFullYear(today.getFullYear() - (prefs?.prefAgeMax || 60) - 1);

    const pipeline: any[] = [
      // Match Target Gender & Exclude past interactions
      { 
        $match: { 
          gender: { $regex: new RegExp(`^${targetGender}$`, 'i') }, 
          _id: { $nin: excludedIds }, 
          isOnboardingComplete: true 
        } 
      },
      // Join Profile
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile"
        }
      },
      { $unwind: "$profile" }
    ];

    // --- APPLY AGE FILTER (Strict Dealbreaker) ---
    pipeline.push({ 
      $match: { "profile.dob": { $gte: minDob, $lte: maxDob } } 
    });

    // --- CALCULATE MATCH SCORE (Partial Matching / Korachokke Match) ---
    const scoreConditions: any[] = [];

    // Religion
    if (prefs?.prefReligion && prefs.prefReligion !== "Doesn't matter") {
      scoreConditions.push({ $cond: [{ $eq: ["$profile.religion", prefs.prefReligion] }, 1, 0] });
    }

    // Education
    if (prefs?.prefEducation && prefs.prefEducation !== "Doesn't matter") {
      scoreConditions.push({ $cond: [{ $eq: ["$profile.educationLevel", prefs.prefEducation] }, 1, 0] });
    }

    // Marital Status
    if (prefs?.prefMaritalStatus && prefs.prefMaritalStatus.length > 0 && !prefs.prefMaritalStatus.includes("Doesn't matter")) {
      scoreConditions.push({ $cond: [{ $in: ["$profile.maritalStatus", prefs.prefMaritalStatus] }, 1, 0] });
    }

    // Smoking
    if (prefs?.prefSmoking && prefs.prefSmoking !== "Doesn't matter") {
      scoreConditions.push({ $cond: [{ $eq: ["$profile.smoke", prefs.prefSmoking] }, 1, 0] });
    }

    // Drinking
    if (prefs?.prefDrinking && prefs.prefDrinking !== "Doesn't matter") {
      scoreConditions.push({ $cond: [{ $eq: ["$profile.drink", prefs.prefDrinking] }, 1, 0] });
    }

    // If there are preferences to score, add matchScore field and sort by it
    if (scoreConditions.length > 0) {
      pipeline.push({
        $addFields: {
          matchScore: { $add: scoreConditions }
        }
      });
      // Sort by highest score first (best matches at the top, partial matches below)
      pipeline.push({ $sort: { matchScore: -1 } });
    } else {
      // If no preferences set, shuffle them
      pipeline.push({ $sample: { size: 20 } });
    }

    // Limit to 20 results for performance
    pipeline.push({ $limit: 20 });

    const targetUsers = await User.aggregate(pipeline);

    // Format output
    const formattedRecommendations = targetUsers.map(user => ({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      profile: user.profile
    }));

    res.status(200).json({ recommendations: formattedRecommendations });
  } catch (error) {
    console.error("Get Recommendations Error:", error);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
};
