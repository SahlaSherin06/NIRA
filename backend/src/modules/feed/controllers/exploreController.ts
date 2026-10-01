import { Request, Response } from "express";
import { User } from "../../auth/models/User";
import { Preference } from "../../profile/models/Preference";
import { Interaction } from "../models/Interaction";

/**
 * Function: getExploreData
 * Executes the core operations and logic for get explore data.
 */
export const getExploreData = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 1. Get current user's preferences
    const prefs = await Preference.findOne({ userId });

    const userGender = currentUser.gender?.toLowerCase() || 'male';
    const targetGender = userGender === 'male' ? 'female' : 'male';

    // Exclude users already interacted with
    const pastInteractions = await Interaction.find({ actorId: userId });
    const excludedIds = pastInteractions.map(i => i.targetId);
    excludedIds.push(currentUser._id);

    // 2. Build Base Match
    const baseMatch: any = {
      gender: { $regex: new RegExp(`^${targetGender}$`, 'i') },
      isOnboardingComplete: true,
      _id: { $nin: excludedIds }
    };

    const { q, minAge, maxAge, religion } = req.query;

    // --- CALCULATE MATCH SCORE (Partial Matching / Korachokke Match) ---
    const today = new Date();
    
    let dynamicFilter: any = {};

    if (q) {
      // If searching explicitly by query, BYPASS strict age/religion filters 
      // so they can actually find the person they are looking for!
      const searchRegex = { $regex: String(q), $options: 'i' };
      dynamicFilter.$or = [
        { name: searchRegex },
        { "profile.profession": searchRegex },
        { "profile.city": searchRegex }
      ];
    } else {
      // Apply strict Age and Religion filters only when browsing normally
      const effectiveMinAge = minAge ? Number(minAge) : (prefs?.prefAgeMin || 18);
      const effectiveMaxAge = maxAge ? Number(maxAge) : (prefs?.prefAgeMax || 60);

      const maxDob = new Date();
      maxDob.setFullYear(today.getFullYear() - effectiveMinAge);
      const minDob = new Date();
      minDob.setFullYear(today.getFullYear() - effectiveMaxAge - 1);
      
      dynamicFilter = { "profile.dob": { $gte: minDob, $lte: maxDob } };

      if (religion && religion !== 'All' && religion !== "Doesn't matter") {
        dynamicFilter["profile.religion"] = { $regex: new RegExp(`^${religion}$`, 'i') };
      }
    }

    const scoreConditions: any[] = [];
    if (prefs?.prefReligion && prefs.prefReligion !== "Doesn't matter") scoreConditions.push({ $cond: [{ $eq: ["$profile.religion", prefs.prefReligion] }, 1, 0] });
    if (prefs?.prefEducation && prefs.prefEducation !== "Doesn't matter") scoreConditions.push({ $cond: [{ $eq: ["$profile.educationLevel", prefs.prefEducation] }, 1, 0] });
    if (prefs?.prefMaritalStatus && prefs.prefMaritalStatus.length > 0 && !prefs.prefMaritalStatus.includes("Doesn't matter")) scoreConditions.push({ $cond: [{ $in: ["$profile.maritalStatus", prefs.prefMaritalStatus] }, 1, 0] });
    if (prefs?.prefSmoking && prefs.prefSmoking !== "Doesn't matter") scoreConditions.push({ $cond: [{ $eq: ["$profile.smoke", prefs.prefSmoking] }, 1, 0] });
    if (prefs?.prefDrinking && prefs.prefDrinking !== "Doesn't matter") scoreConditions.push({ $cond: [{ $eq: ["$profile.drink", prefs.prefDrinking] }, 1, 0] });

    // 4. Helper to aggregate
    const fetchProfiles = async (limit: number, secondarySort: any) => {
      const pipeline: any[] = [
        { $match: baseMatch },
        {
          $lookup: {
            from: "profiles",
            localField: "_id",
            foreignField: "userId",
            as: "profile"
          }
        },
        { $unwind: "$profile" },
        { $match: dynamicFilter }
      ];

      // Score and Sort
      if (scoreConditions.length > 0) {
        pipeline.push({ $addFields: { matchScore: { $add: scoreConditions } } });
        // Since we can't cleanly $sample after sorting, we just sort by score, then secondary criteria
        // Note: For $sample in completeBios, we'll just use { _id: -1 } as secondary to keep it simple
        pipeline.push({ $sort: { matchScore: -1, ...secondarySort } });
      } else {
        pipeline.push({ $sort: secondarySort });
      }

      pipeline.push({ $limit: limit });
      return User.aggregate(pipeline);
    };

    // 5. Fetch the two sections
    const completeBiosRaw = await fetchProfiles(20, { _id: 1 });
    const completeBios = completeBiosRaw.map(user => ({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      profile: user.profile
    }));

    const justJoinedRaw = await fetchProfiles(20, { createdAt: -1 });
    const justJoined = justJoinedRaw.map(user => ({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      profile: user.profile
    }));

    res.status(200).json({ completeBios, justJoined });
  } catch (error) {
    console.error("Explore API Error:", error);
    res.status(500).json({ message: "Failed to fetch explore data" });
  }
};
