import { asyncHandler } from "../../../utils/asyncHandler";
import { Request, Response , NextFunction } from "express";
import { User } from "../../auth/models/User";
import { Preference } from "../../profile/models/Preference";
import { Interaction } from "../models/Interaction";

/**
 * Function: getExploreData
 * Executes the core operations and logic for get explore data.
 */
export const getExploreData = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
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

        const prefs = await Preference.findOne({ userId });

    const userGender = currentUser.gender?.toLowerCase() || 'male';
    const targetGender = userGender === 'male' ? 'female' : 'male';

    // Exclude users already interacted with
    const pastInteractions = await Interaction.find({ actorId: currentUser._id });
    const excludedIds = pastInteractions.map(i => i.targetId);
    excludedIds.push(currentUser._id);

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

            // Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const fetchProfiles = async (limitNum: number, secondarySort: any, applyPrefs: boolean = true) => {
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
        { $unwind: "$profile" }
      ];

      // If applyPrefs is true, apply Age and Religion filters.
      // If there's a text search (q), we always apply it regardless of applyPrefs.
      if (q) {
        pipeline.push({ $match: dynamicFilter });
      } else if (applyPrefs && Object.keys(dynamicFilter).length > 0) {
        pipeline.push({ $match: dynamicFilter });
      }

      // Score and Sort
      if (applyPrefs && scoreConditions.length > 0) {
        pipeline.push({ $addFields: { matchScore: { $add: scoreConditions } } });
        pipeline.push({ $sort: { matchScore: -1, ...secondarySort } });
      } else {
        // For Just Joined, we just sort directly by the secondarySort (which is { createdAt: -1 })
        pipeline.push({ $sort: secondarySort });
      }

      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limitNum + 1 });
      return User.aggregate(pipeline);
    };

    // Complete Bios uses preferences
    const completeBiosRaw = await fetchProfiles(limit, { _id: 1 }, true);
    const hasNextComplete = completeBiosRaw.length > limit;
    if (hasNextComplete) completeBiosRaw.pop();

    const completeBios = completeBiosRaw.map(user => ({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      subscription: user.subscription,
      profile: user.profile
    }));

    // Just Joined BYPASSES preferences (applyPrefs = false)
    const justJoinedRaw = await fetchProfiles(limit, { createdAt: -1 }, false);
    const hasNextJoined = justJoinedRaw.length > limit;
    if (hasNextJoined) justJoinedRaw.pop();

    const justJoined = justJoinedRaw.map(user => ({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      subscription: user.subscription,
      profile: user.profile
    }));

    res.status(200).json({ 
      completeBios, 
      justJoined,
      nextPage: (hasNextComplete || hasNextJoined) ? page + 1 : null
    });
});


